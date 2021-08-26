import ClickHouse from '@makeomatic/clickhouse'
import { Promise } from 'bluebird'
import { merge } from 'lodash'
import { Writable, Duplex } from 'stream'
import {
  InsertData,
  TableBuilder,
} from './interfaces'

export class ClickhouseClient {
  public static readonly defaultOpts: ClickHouse.Options = {
    host: 'clickhouse',
  }

  public readonly connection: ClickHouse

  public readonly queryAsync: (query: string, options: ClickHouse.QueryOptions) => Promise<any>
  public readonly insertAsync: (dbName: string, insertData: InsertData, options?: ClickHouse.QueryOptions) => Promise<any>

  constructor(options: ClickHouse.Options) {
    this.connection = new ClickHouse(merge({}, ClickhouseClient.defaultOpts, options))
    this.queryAsync = Promise.promisify(this.query, { context: this })
    this.insertAsync = Promise.promisify(this.insert, { context: this })
  }

  public async createTable(builder: TableBuilder): Promise<any> {
    return this.queryAsync(builder.toSql(), { format: 'TabSeparated' })
  }

  public async close(): Promise<void> {
    await this.connection.close()
  }

  public insert<T = any>(dbName: string, insertData: InsertData, cb: ClickHouse.Callback<T>): void
  public insert<T = any>(dbName: string, insertData: InsertData, options: ClickHouse.QueryOptions, cb: ClickHouse.Callback<T>): void
  public insert<T = any>(dbName: string, insertData: InsertData, arg1: ClickHouse.QueryOptions | ClickHouse.Callback<T>, arg2?: ClickHouse.Callback<T>): void {
    const queryOptions: ClickHouse.QueryOptions = typeof arg1 === 'object' ? arg1 : Object.create(null)
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

  public query(query: string, options: ClickHouse.QueryOptions): Duplex
  public query<T = any>(query: string, options: ClickHouse.QueryOptions, cb: ClickHouse.Callback<T>): Writable
  public query<T = any>(query: string, options: ClickHouse.QueryOptions, cb?: ClickHouse.Callback<T>): Writable | Duplex {
    return this.connection.query(
      query,
      { syncParser: true, ...options, format: options.format || 'JSONCompact' },
      cb
    )
  }
}
