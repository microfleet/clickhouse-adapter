import { ClickhouseClient } from '../client'
import { TableMaker } from '../utils'
import _debug = require('debug')

const debug = _debug('microfleet:clickhouse:system')

const createDb = (dbName: string): string =>
  `CREATE DATABASE IF NOT EXISTS ${dbName} ON CLUSTER '{cluster}'`

export class SystemMigrator {
  private readonly ch: ClickhouseClient

  constructor(ch: ClickhouseClient) {
    this.ch = ch
  }

  public async up(dbName: string): Promise<void> {
    debug('creating db')

    await this.ch.queryAsync(createDb(dbName), {
      format: 'TabSeparated',
    })

    const migrationTable = new TableMaker(dbName, 'migrations', null, {
      columnDefinitions: [
        { name: 'name', type: 'String' },
        { name: 'migrated_at', type: 'Date', options: ['DEFAULT now()'] },
      ],
      tableOptions: [
        `ENGINE = ReplicatedMergeTree('/clickhouse/{installation}/{cluster}/tables/{shard}/{database}/{table}', '{replica}')`,
        'PARTITION BY toYYYYMM(migrated_at)',
        'ORDER BY (migrated_at)',
      ],
    })

    debug('creating migration table')

    await this.ch.queryAsync(migrationTable.toSql(), {
      queryOptions: { database: dbName },
      format: 'TabSeparated',
    })

    debug('done')
  }
}
