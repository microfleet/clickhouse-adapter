import ClickHouse from '@apla/clickhouse'
import { Promise } from 'bluebird'
import { merge } from 'lodash'
import {
  InsertData,
  ClickhouseOptions,
  TableBuilder,
  ClickhouseClientInterface,
  QueryOptions,
} from './interfaces'

export class ClickhouseClient implements ClickhouseClientInterface {
  public static readonly defaultOpts: ClickhouseOptions = {
    host: 'clickhouse',
  }

  public readonly connection: ClickHouse

  public readonly queryAsync: (query: string, options: QueryOptions) => Promise<any>

  constructor(options: ClickhouseOptions) {
    this.connection = new ClickHouse(merge({}, ClickhouseClient.defaultOpts, options))

    this.queryAsync = Promise.promisify(this.query, { context: this })
  }

  public async createTable(builder: TableBuilder): Promise<any> {
    return this.queryAsync(builder.toSql(), { format: 'TabSeparated' })
  }

  public insert(dbName: string, insertData: InsertData, cb: (err: any, result: any) => void): void
  public insert(
    dbName: string,
    insertData: InsertData,
    options: QueryOptions,
    cb: (err: any, result: any) => void
  ): void
  public insert(dbName: string, insertData: InsertData, arg1: any, arg2?: any): void {
    const queryOptions: QueryOptions = typeof arg1 === 'object' ? arg1 : {}
    const stream = this.connection.query(
      insertData.query(),
      {
        ...queryOptions,
        format: queryOptions.format || 'JSONEachRow',
        queryOptions: { database: dbName },
      },
      typeof arg1 === 'function' ? arg1 : arg2
    )

    const data = insertData.data()

    data.forEach((item: any) => {
      stream.write(item)
    })

    stream.end()
  }

  public query(query: string, options: QueryOptions, cb: (err: any, result: any) => void): void {
    this.connection.query(
      query,
      { syncParser: true, ...options, format: options.format || 'JSONCompact' },
      cb
    )
  }
}
