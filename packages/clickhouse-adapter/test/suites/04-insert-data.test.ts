import assert from 'assert'
import moment from 'moment'
import { Migrator, ClickhouseClient, SystemMigrator, TableMaker } from '../../src'
import { InsertData } from '../../src/interfaces'

const DB_NAME = 'db_test'

describe('Clickhouse Adapter', () => {
  const ch = new ClickhouseClient({ host: 'ch1', dbName: DB_NAME })
  const systemMigrator = new SystemMigrator(ch)

  beforeAll(() => systemMigrator.up(DB_NAME))

  it('insert single row', async () => {
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
            tableOptions: ['ENGINE = MergeTree() ORDER BY (trackTimestamp, eventType) PARTITION BY (trackDate) SETTINGS index_granularity=8192'],
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

    await ch.insertAsync(DB_NAME, insertData)
    const result = await ch.queryAsync(
      'SELECT * FROM event_a',
      { syncParser: true, queryOptions: { database: DB_NAME } })
    
    assert(result)
    assert(result.data)
    assert(result.data.length)
  })

  it('insert tsv', async () => {
    const migrator = new Migrator(ch)

    migrator.addMigration({
      name: '1_event_b',
      async up(clickhouseClient: ClickhouseClient): Promise<boolean> {
        await clickhouseClient.createTable(
          new TableMaker(DB_NAME, 'event_b', null, {
            columnDefinitions: [
              { name: 'trackDate', type: 'Date' },
              { name: 'trackTimestamp', type: 'DateTime' },
              { name: 'eventType', type: 'String' },
              { name: 'userId', type: 'String' },
              { name: 'code', type: 'Int32' },
            ],
            tableOptions: ['ENGINE = MergeTree() ORDER BY (trackTimestamp, eventType) PARTITION BY (trackDate) SETTINGS index_granularity=8192'],
          })
        )
        return true
      },
    })

    await migrator.up(migrator.migrateAll(DB_NAME))

    const now = moment()
    const data = [
      {
        trackDate: moment(now).format('YYYY-MM-DD'),
        trackTimestamp: moment(now).format('YYYY-MM-DD HH:mm:ss'),
        eventType: 'type_a',
      },
    ]
    const fields = ['trackDate', 'trackTimestamp', 'eventType', 'userId', 'code']
    const getArray = (data: any): any => {
      return fields.map((key: string) => data[key])
    }

    const insertData: InsertData = {
      query: () => {
        return `INSERT INTO event_b (${fields.join(',')})`
      },
      data: () => {
        return data.map(getArray)
      },
    }

    await ch.insertAsync(DB_NAME, insertData, { format: 'TabSeparated' })
    const result = await ch.queryAsync(
      'SELECT * FROM event_b',
      { syncParser: true, queryOptions: { database: DB_NAME } })

    assert(result)
    assert(result.data)
    assert(result.data.length)
  })
})
