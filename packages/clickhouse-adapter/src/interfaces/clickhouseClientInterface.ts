import ClickHouse from '@apla/clickhouse'
import { TableBuilder } from './tableBuilder'
import { InsertData } from './insertData'

export interface ClickhouseClientInterface {
  connection: ClickHouse
  createTable(builder: TableBuilder): Promise<any>
  insert(dbName: string, insertData: InsertData, cb: (err: any, result: any) => void): void
}
