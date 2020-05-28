import { ClickhouseClient } from '../client'

export interface Migration {
  name: string
  up(clickhouseClient: ClickhouseClient, dbName: string): Promise<boolean>
}
