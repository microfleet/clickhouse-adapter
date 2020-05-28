import { ClickhouseClient } from '../client'
import { TableMaker } from '../utils'

const createDb = (dbName: string): string => `CREATE DATABASE IF NOT EXISTS ${dbName}`

export class SystemMigrator {
  private readonly ch: ClickhouseClient

  constructor(ch: ClickhouseClient) {
    this.ch = ch
  }

  public async up(dbName: string): Promise<void> {
    await this.ch.connection.querying(createDb(dbName))

    const migrationTable = new TableMaker(dbName, 'migrations', null, {
      columnDefinitions: [
        { name: 'name', type: 'String' },
        { name: 'migrated_at', type: 'Date', options: ['DEFAULT now()'] },
      ],
      tableOptions: ['ENGINE = MergeTree(migrated_at, name, 8192)'],
    })

    await this.ch.queryAsync(dbName, migrationTable.toSql())
  }
}
