/* eslint-disable @typescript-eslint/camelcase */
import { ClickhouseClient, TableMaker } from '../../src'

describe('create table', () => {
  it('create table', async () => {
    const client = new ClickhouseClient({
      host: 'clickhouse',
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

    const descTable = await client.connection.querying('DESCRIBE TABLE db_test.test_table')

    expect(descTable.data).toMatchObject([
      {
        name: 'trackDate',
        type: 'Date',
        default_type: '',
        default_expression: '',
        comment: '',
        codec_expression: '',
        ttl_expression: '',
      },
      {
        name: 'trackTimestamp',
        type: 'DateTime',
        default_type: '',
        default_expression: '',
        comment: '',
        codec_expression: '',
        ttl_expression: '',
      },
      {
        name: 'event_type',
        type: 'String',
        default_type: '',
        default_expression: '',
        comment: '',
        codec_expression: '',
        ttl_expression: '',
      },
    ])
  })
})
