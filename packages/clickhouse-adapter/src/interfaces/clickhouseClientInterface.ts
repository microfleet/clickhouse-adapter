import ClickHouse from '@apla/clickhouse'
import { TableBuilder } from './tableBuilder'
import { InsertData } from './insertData'
import { QueryOptions } from './queryOptions'

export interface ClickhouseClientInterface {
  connection: ClickHouse
  createTable(builder: TableBuilder): Promise<any>
  insert(dbName: string, insertData: InsertData, cb: (err: any, result: any) => void): void
  insert(
    dbName: string,
    insertData: InsertData,
    options: QueryOptions,
    cb: (err: any, result: any) => void
  ): void
  insert(dbName: string, insertData: InsertData, arg1: any, arg2: any): void
}
