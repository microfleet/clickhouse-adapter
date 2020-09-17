import ClickHouse from '@apla/clickhouse'
import { Promise } from 'bluebird'
import { merge } from 'lodash'

import {
  InsertData,
  Options,
  TableBuilder,
  ClickhouseClientInterface,
  QueryStream,
  ClientConfig,
  Callback,
} from './interfaces'

export class ClickhouseClient implements ClickhouseClientInterface {
  public static readonly defaultOpts: Options = {
    host: 'clickhouse',
  }

  public readonly connection: ClickHouse

  public readonly queryAsync: (query: string, options?: Options) => Promise<any>

  private readonly database: string
  private readonly options: Options

  constructor(config: ClientConfig) {
    const { dbName, ...options } = config

    this.options = merge({}, ClickhouseClient.defaultOpts, options)
    this.database = dbName

    this.connection = new ClickHouse(this.options)

    this.queryAsync = Promise.promisify(this.query, { context: this })
  }

  public async createTable(builder: TableBuilder): Promise<any> {
    return this.queryAsync(builder.toSql(), { format: 'TabSeparated' })
  }

  public insert(dbName: string, insertData: InsertData, cb: (err: any, result: any) => void): void
  public insert(
    dbName: string,
    insertData: InsertData,
    options: Options,
    cb: (err: any, result: any) => void
  ): void
  public insert(dbName: string, insertData: InsertData, arg1: any, arg2?: any): void {
    const options: Options = typeof arg1 === 'object' ? arg1 : {}
    const stream = this.connection.query(
      insertData.query(),
      {
        ...options,
        format: options.format || 'JSONEachRow',
        queryOptions: {
          ...options.queryOptions,
          database: dbName,
        },
      },
      typeof arg1 === 'function' ? arg1 : arg2
    )

    const data = insertData.data()

    data.forEach((item: any) => {
      stream.write(item)
    })

    stream.end()
  }

  public query(query: string, options?: Options, cb?: Callback): void {
    // promisify passes callback in 2nd argument if no arg provided
    const callback = options.constructor === Function ? options : cb

    const opts = {
      ...this.getQueryOptions(cb ? options : {}),
      syncParser: true,
    }

    this.connection.query(query, opts, callback)
  }

  public queryStream(query: string, options?: Options, cb?: Callback): QueryStream {
    const opts = {
      ...this.getQueryOptions(options),
      syncParser: false,
    }

    return this.connection.query(query, opts, cb)
  }

  private getQueryOptions(options?: Options): Record<string, any> {
    return {
      ...options,
      syncParser: true,
      format: this.getFormat(options, 'JSONCompact'),
      queryOptions: {
        database: this.database,
        ...options?.queryOptions,
        ...this.options.queryOptions,
      },
    }
  }

  private getFormat(options: Options | undefined, defaultFormat: string): string {
    return options?.format || this.options.format || defaultFormat
  }
}
