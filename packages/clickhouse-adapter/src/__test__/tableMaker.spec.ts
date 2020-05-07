import { DateTime } from '../types'
import { TableMaker } from '..'

describe('Table maker', () => {
  it('create table by fluent API', () => {
    const maker = new TableMaker('ch_test', 'table_test')
    const sql = maker
      .columnDefinition('trackDate', 'Date')
      .columnDefinition('trackTimestamp', 'DateTime')
      .columnDefinition('event_type', 'String')
      .tableOption('ENGINE = MergeTree(trackDate, (event_type), 8192)')
      .toSql()

    expect(sql).toMatchSnapshot()
  })

  it('create table by spec', () => {
    const maker = new TableMaker('ch_test', 'table_test', null, {
      columnDefinitions: [
        { name: 'trackDate', type: 'Date' },
        { name: 'trackTimestamp', type: new DateTime('Europe/Moscow') },
        { name: 'event_type', type: 'String' },
      ],
      tableOptions: ['ENGINE = MergeTree(trackDate, (event_type), 8192)'],
    })

    expect(maker.toSql()).toMatchInlineSnapshot(`
      "CREATE TABLE IF NOT EXISTS ch_test.table_test (
      trackDate Date,
      trackTimestamp DateTime('Europe/Moscow'),
      event_type String
      ) ENGINE = MergeTree(trackDate, (event_type), 8192)
      "
    `)
  })
})
