import assert from 'assert'
import moment from 'moment'

import { Migrator, ClickhouseClient, SystemMigrator, TableMaker } from '../../src'
import { InsertData } from '../../src/interfaces'

const DB_NAME = 'db_test'
const TABLE_NAME = 'test_query_data'

describe('Clickhouse Adapter', () => {
  const ch = new ClickhouseClient({ host: 'ch1', dbName: DB_NAME })
  const systemMigrator = new SystemMigrator(ch)

  const now = moment()
  const insertData: InsertData = {
    query: () => {
      return `INSERT INTO ${TABLE_NAME}`
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

  beforeAll(async () => {
    await systemMigrator.up(DB_NAME)
  })

  beforeAll(async () => {
    const migrator = new Migrator(ch)

    migrator.addMigration({
      name: `1_${TABLE_NAME}`,
      async up(clickhouseClient: ClickhouseClient): Promise<boolean> {
        await clickhouseClient.createTable(
          new TableMaker(DB_NAME, TABLE_NAME, `'{cluster}'`, {
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
  })

  beforeAll((done: jest.DoneCallback) => {
    ch.insert(DB_NAME, insertData, (err) => {
      if (err) return done.fail(err)
      done()
    })
  })

  describe('query data with QueryOptions', () => {
    const query = `SELECT * from ${TABLE_NAME}`

    it('simple', async () => {
      const result = await ch.queryAsync(query, {
        queryOptions: { database: DB_NAME },
      })

      assert(result)
      assert(result.data)
      assert(result.data.length)
    })

    it('query data as stream', async () => {
      const stream = ch.queryStream(query, {
        queryOptions: { database: DB_NAME },
        format: 'JSON',
      })

      const rows = []
      for await (const row of stream) {
        rows.push(row)
      }

      assert(rows.length === 1)
      assert.ok(stream.supplemental)
      assert(stream.supplemental.rows === 1)
    })
  })

  describe('query data without QueryOptions', () => {
    const query = `SELECT * from ${TABLE_NAME}`

    it('simple', async () => {
      const result = await ch.queryAsync(query)
      assert(result)
      assert(result.data)
      assert(result.data.length)
    })

    it('stream', async () => {
      const stream = ch.queryStream(query)

      const rows = []
      for await (const row of stream) {
        rows.push(row)
      }

      assert(rows.length === 1)
      assert.ok(stream.supplemental)
      assert(stream.supplemental.rows === 1)
    })
  })
})
