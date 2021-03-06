import { ClickhouseClient } from '@microfleet/clickhouse-adapter'
import { queries } from './queries'

export function cleanTable(
  ch: ClickhouseClient,
  dbName: string,
  tableName: string
): CallableFunction {
  return async () => ch.connection.querying(queries.cleanTable(dbName, tableName))
}
