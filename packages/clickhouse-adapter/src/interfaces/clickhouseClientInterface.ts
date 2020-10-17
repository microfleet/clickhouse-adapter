import ClickHouse from '@apla/clickhouse'
import { TableBuilder } from './tableBuilder'
import { InsertData } from './insertData'
import { ClickhouseSettings } from './clickhouseSettings'

export type Callback = (err: Error | undefined, res: any) => void

export interface ClickhouseClientInterface {
  connection: ClickHouse
  createTable(builder: TableBuilder): Promise<any>
  insert(dbName: string, insertData: InsertData, cb: (err: any, result: any) => void): void
  insert(
    dbName: string,
    insertData: InsertData,
    options: ClickhouseSettings,
    cb: (err: any, result: any) => void
  ): void
  insert(dbName: string, insertData: InsertData, arg1: any, arg2: any): void
}
