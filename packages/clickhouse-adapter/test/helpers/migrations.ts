import { ClickhouseClient, SystemMigrator, TableMaker } from '../../src'
import { Migration } from '../../src/interfaces'

export const initSystemMigrator: (ch: ClickhouseClient, dbName: string) => Promise<SystemMigrator> = async (
  ch: ClickhouseClient,
  dbName: string
) => {
  const migrator = new SystemMigrator(ch)
  await migrator.up(dbName)

  return migrator
}

export const migrations: Migration[] = [
  {
    name: '1_event_a',
    async up(clickhouseClient: ClickhouseClient): Promise<boolean> {
      await clickhouseClient.createTable(
        new TableMaker('db_test', 'event_a', null, {
          columnDefinitions: [
            { name: 'trackDate', type: 'Date' },
            { name: 'trackTimestamp', type: 'DateTime' },
            { name: 'event_type', type: 'String' },
          ],
          tableOptions: ['ENGINE = MergeTree(trackDate, (trackTimestamp, event_type), 8192)'],
        })
      )
      return true
    },
  },
  {
    name: '2_event_b',
    async up(clickhouseClient: ClickhouseClient): Promise<boolean> {
      await clickhouseClient.createTable(
        new TableMaker('db_test', 'event_b', null, {
          columnDefinitions: [
            { name: 'trackDate', type: 'Date' },
            { name: 'trackTimestamp', type: 'DateTime' },
            { name: 'event_type', type: 'String' },
          ],
          tableOptions: ['ENGINE = MergeTree(trackDate, (trackTimestamp, event_type), 8192)'],
        })
      )
      return true
    },
  },
  {
    name: '3_event_c',
    async up(clickhouseClient: ClickhouseClient): Promise<boolean> {
      await clickhouseClient.createTable(
        new TableMaker('db_test', 'event_c', null, {
          columnDefinitions: [
            { name: 'trackDate', type: 'Date' },
            { name: 'trackTimestamp', type: 'DateTime' },
            { name: 'event_type', type: 'String' },
          ],
          tableOptions: ['ENGINE = MergeTree(trackDate, (trackTimestamp, event_type), 8192)'],
        })
      )
      return true
    },
  },
]
