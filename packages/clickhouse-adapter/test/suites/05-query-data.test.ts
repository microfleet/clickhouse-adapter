import assert from 'assert'
import moment from 'moment'
import { Migrator, ClickhouseClient, SystemMigrator, TableMaker } from '../../src'
import { InsertData } from '../../src/interfaces'

const DB_NAME = 'db_test'

describe('Clickhouse Adapter', () => {
  const ch = new ClickhouseClient({ host: 'clickhouse', dbName: DB_NAME })
  const systemMigrator = new SystemMigrator(ch)

  beforeAll(() => systemMigrator.up(DB_NAME))

  it('query data', async (done: jest.DoneCallback) => {
    const migrator = new Migrator(ch)

    migrator.addMigration({
      name: '1_event_a',
      async up(clickhouseClient: ClickhouseClient): Promise<boolean> {
        await clickhouseClient.createTable(
          new TableMaker(DB_NAME, 'event_a', null, {
            columnDefinitions: [
              { name: 'trackDate', type: 'Date' },
              { name: 'trackTimestamp', type: 'DateTime' },
              { name: 'eventType', type: 'String' },
            ],
            tableOptions: ['ENGINE = MergeTree(trackDate, (trackTimestamp, eventType), 8192)'],
          })
        )
        return true
      },
    })

    await migrator.up(migrator.migrateAll(DB_NAME))

    const now = moment()
    const insertData: InsertData = {
      query: () => {
        return 'INSERT INTO event_a'
      },
      data: () => {
        return [
          {
            trackDate: moment(now).format('YYYY-MM-DD'),
            trackTimestamp: moment(now).format('YYYY-MM-DD HH:mm:ss'),
            eventType: 'type_a',
          },
        ]
      },
    }

    ch.insert(DB_NAME, insertData, async () => {
      const result = await ch.queryAsync(DB_NAME, 'SELECT * FROM event_a')

      assert(result)
      assert(result.data)
      assert(result.data.length)
      done()
    })
  })
})
