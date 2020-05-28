import { queries } from '@microfleet/root-test'
import { ClickhouseClient, StructureTable } from '../../src'
import { initSystemMigrator } from '../helpers'

const DB_NAME = 'db_test'

describe('System Migrator', () => {
  const ch = new ClickhouseClient({
    host: 'clickhouse',
  })

  beforeAll(() => initSystemMigrator(ch, DB_NAME))

  it('create migration table', async () => {
    const describeTableQuery = queries.describeTable(DB_NAME, 'migrations')
    const tableInfo: { data: StructureTable[] } = await ch.connection.querying(describeTableQuery)

    const fields = tableInfo.data.map((item: StructureTable) => item.name)

    expect(fields).toEqual(['name', 'migrated_at'])
  })
})
