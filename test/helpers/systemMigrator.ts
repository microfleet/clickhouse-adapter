import { ClickhouseClient, SystemMigrator } from '@microfleet/clickhouse-adapter'

export const initSystemMigrator: (ch: ClickhouseClient, dbName: string) => Promise<SystemMigrator> = async (
  ch: ClickhouseClient,
  dbName: string
) => {
  const migrator = new SystemMigrator(ch)
  await migrator.up(dbName)

  return migrator
}
