import assert from 'assert'
import { queries } from '@microfleet/root-test'
import { Migrator, ClickhouseClient, SystemMigrator } from '../../src'
import { migrations } from '../helpers'

const DB_NAME = 'db_test'

describe('Migrator', () => {
  const ch = new ClickhouseClient({ dbName: DB_NAME, host: 'ch1' })
  const systemMigrator = new SystemMigrator(ch)

  beforeAll(() => systemMigrator.up(DB_NAME))

  it('run one migration', async () => {
    const migrator = new Migrator(ch)

    migrator.addMigration(migrations[0])

    await migrator.up(migrator.migrateAll(DB_NAME))

    const storedMigration = await ch.connection.querying('SELECT * FROM db_test.migrations')

    assert(storedMigration)
    assert(storedMigration.data)
    assert(storedMigration.data.length)
  })

  it('run two migration', async () => {
    const migrator = new Migrator(ch)

    migrator.addMigration(migrations[1])
    migrator.addMigration(migrations[2])

    await migrator.up(migrator.migrateAll(DB_NAME))

    const storedMigration = await ch.connection.querying('SELECT * FROM db_test.migrations')

    assert(storedMigration)
    assert(storedMigration.data)
    assert(storedMigration.data.length > 0)

    const tables = ['event_a', 'event_b', 'event_c']
    await Promise.all(
      tables.map(async (t: string) => {
        const tableInfo = await ch.connection.querying(queries.describeTable(DB_NAME, t))
        assert(tableInfo.data.length > 0)
      })
    )
  })

  it('run exists migration', async () => {
    const migrator = new Migrator(ch)

    migrator.addMigration(migrations[0])

    await migrator.up(migrator.migrateAll(DB_NAME))

    const results = await ch.queryAsync(queries.listMigrations(DB_NAME), { format: 'JSON' })

    assert(results.data.filter((m: { name: string }) => m.name === '1_event_a').length === 1)
  })
})
