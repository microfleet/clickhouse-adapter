import assert from 'assert'
import moment from 'moment'
import { Migrator, ClickhouseClient, SystemMigrator, TableMaker } from '../../src'
import { InsertData } from '../../src/interfaces'

const DB_NAME = 'db_test'
const SIMPLE_TABLE = 'insert_simple'
const TSV_TABLE = 'insert_tsv'

describe('Clickhouse Adapter', () => {
  const ch = new ClickhouseClient({ host: 'ch1', dbName: DB_NAME })
  const systemMigrator = new SystemMigrator(ch)

  beforeAll(async () => await systemMigrator.up(DB_NAME))
  describe('insert single row', () => {
    beforeAll(async () => {
      const migrator = new Migrator(ch)

      migrator.addMigration({
        name: `1_${SIMPLE_TABLE}`,
        async up(clickhouseClient: ClickhouseClient): Promise<boolean> {
          await clickhouseClient.createTable(
            new TableMaker(DB_NAME, SIMPLE_TABLE, `'{cluster}'`, {
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

    it('insert', async (done: jest.DoneCallback) => {
      const now = moment()
      const insertData: InsertData = {
        query: () => `INSERT INTO ${SIMPLE_TABLE}`,
        data: () => [
          {
            trackDate: moment(now).format('YYYY-MM-DD'),
            trackTimestamp: moment(now).format('YYYY-MM-DD HH:mm:ss'),
            eventType: 'type_a',
          },
        ],
      }

      ch.insert(DB_NAME, insertData, (err) => {
        assert.ifError(err)
        ch.connection.query(
          `SELECT * FROM ${SIMPLE_TABLE}`,
          { syncParser: true, queryOptions: { database: DB_NAME } },
          (_: any, result: any) => {
            assert(result)
            assert(result.data)
            assert(result.data.length)
            done()
          }
        )
      })
    })

    it('errors on unknown column', async (done: jest.DoneCallback) => {
      const now = moment()
      const insertData: InsertData = {
        query: () => `INSERT INTO ${SIMPLE_TABLE}`,
        data: () => [
          {
            trackDate: moment(now).format('YYYY-MM-DD'),
            trackTimestamp: moment(now).format('YYYY-MM-DD HH:mm:ss'),
            eventTypeMissing: 'type_a',
          },
        ],
      }

      ch.insert(DB_NAME, insertData, (err, result) => {
        assert(
          (err.message = ~/Unknown field found while parsing JSONEachRow format: eventTypeMissing/)
        )
        assert.ifError(result)
        done()
      })
    })
  })

  it('insert tsv', async (done: jest.DoneCallback) => {
    const migrator = new Migrator(ch)

    migrator.addMigration({
      name: `1_${TSV_TABLE}`,
      async up(clickhouseClient: ClickhouseClient): Promise<boolean> {
        await clickhouseClient.createTable(
          new TableMaker(DB_NAME, TSV_TABLE, `'{cluster}'`, {
            columnDefinitions: [
              { name: 'trackDate', type: 'Date' },
              { name: 'trackTimestamp', type: 'DateTime' },
              { name: 'eventType', type: 'String' },
              { name: 'userId', type: 'String' },
              { name: 'code', type: 'Int32' },
            ],
            tableOptions: ['ENGINE = MergeTree(trackDate, (trackTimestamp, eventType), 8192)'],
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
        return `INSERT INTO ${TSV_TABLE} (${fields.join(',')})`
      },
      data: () => {
        return data.map(getArray)
      },
    }

    ch.insert(DB_NAME, insertData, { format: 'TabSeparated' }, (err, result) => {
      assert.ifError(err)
      ch.connection.query(
        `SELECT * FROM ${TSV_TABLE}`,
        { syncParser: true, queryOptions: { database: DB_NAME } },
        (_: any, result: any) => {
          assert(result)
          assert(result.data)
          assert(result.data.length)
          done()
        }
      )
    })
  })
})
