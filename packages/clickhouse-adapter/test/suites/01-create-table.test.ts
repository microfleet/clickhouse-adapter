import { ClickhouseClient, TableMaker } from '../../src'

describe('create table', () => {
  it('create table', async () => {
    const client = new ClickhouseClient({
      host: 'ch1',
    })

    await client.connection.querying('CREATE DATABASE IF NOT EXISTS db_test')

    await client.createTable(
      new TableMaker('db_test', 'test_table', null, {
        columnDefinitions: [
          { name: 'trackDate', type: 'Date' },
          { name: 'trackTimestamp', type: 'DateTime' },
          { name: 'event_type', type: 'String' },
        ],
        tableOptions: ['ENGINE = MergeTree(trackDate, (event_type), 8192)'],
      })
    )

    const descTable = await client.queryAsync('DESCRIBE TABLE db_test.test_table', {
      format: 'JSON',
    })

    expect(descTable.data).toMatchSnapshot()
  })

  it('create replicated table', async () => {
    const client = new ClickhouseClient({
      host: 'ch1',
    })

    await client.connection.querying('CREATE DATABASE IF NOT EXISTS db_test')

    await client.createTable(
      new TableMaker('db_test', 'test_replicated_table', `'{cluster}'`, {
        columnDefinitions: [
          { name: 'trackDate', type: 'Date' },
          { name: 'trackTimestamp', type: 'DateTime' },
          { name: 'event_type', type: 'String' },
        ],
        tableOptions: [
          `ENGINE = ReplicatedMergeTree('/clickhouse/{installation}/{cluster}/tables/{shard}/{database}/{table}', '{replica}')`,
          'PARTITION BY toYYYYMM(trackDate)',
          'ORDER BY (trackTimestamp)',
        ],
      })
    )

    const descTable = await client.queryAsync('DESCRIBE TABLE db_test.test_replicated_table', {
      format: 'JSON',
    })

    expect(descTable.data).toMatchSnapshot()
  })
})
