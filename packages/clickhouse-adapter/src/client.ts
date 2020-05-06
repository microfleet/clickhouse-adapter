import ClickHouse from '@apla/clickhouse'
import { Promise } from 'bluebird'
import { merge } from 'lodash'
import { InsertData, ClickhouseOptions, TableBuilder, ClickhouseClientInterface } from './interfaces'

export class ClickhouseClient implements ClickhouseClientInterface {
  public static readonly defaultOpts: ClickhouseOptions = {
    host: 'clickhouse',
    dbName: 'default',
    user: 'default',
    password: '',
    format: 'JSON',
  }

  public readonly connection: ClickHouse

  constructor(options: ClickhouseOptions) {
    this.connection = new ClickHouse(merge({}, ClickhouseClient.defaultOpts, options))
  }

  public async createTable(builder: TableBuilder) {
    return this.connection.querying(builder.toSql(), { format: 'JSONEachRow' })
  }

  public insert(dbName: string, insertData: InsertData, cb: (err: any, result: any) => void) {
    const stream = this.connection.query(
      insertData.query(),
      { format: 'JSONEachRow', queryOptions: { database: dbName } },
      cb
    )

    const data = insertData.data()

    data.forEach((item: any) => {
      stream.write(item)
    })

    stream.end()
  }

  public query(dbName: string, query: string, cb: (err: any, result: any) => void) {
    this.connection.query(query, { syncParser: true, queryOptions: { database: dbName } }, cb)
  }

  public queryAsync(dbName: string, query: string) {
    return Promise.promisify(this.query, { context: this })(dbName, query)
  }
}
