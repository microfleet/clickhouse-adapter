import SqlString from 'sqlstring'
import { Promise } from 'bluebird'
import { ClickhouseClient } from '../client'
import { Migration } from '../interfaces'
import _debug = require('debug')

const debug = _debug('microfleet:clickhouse:migrator')
export class Migrator {
  private readonly ch: ClickhouseClient

  private readonly migrations: Migration[] = []

  constructor(ch: ClickhouseClient) {
    this.ch = ch
  }

  public migrationList(): Migration[] {
    return this.migrations
  }

  public up(callback: (migrator: Migrator) => Promise<any>): Promise<any> {
    return callback(this)
  }

  public migrateAll(dbName: string) {
    return (migrator: Migrator): Promise<Migration[]> => {
      const migrations = migrator.migrationList()
      debug('migration list', migrations)

      return Promise.each(migrations, (migration: Migration) => {
        debug('migrating', dbName, migration.name)
        return migrator.migrate(dbName)(migration)
      })
    }
  }

  public addMigration(migration: Migration): void {
    this.migrations.push(migration)
  }

  private migrate(dbName: string): (migration: Migration) => Promise<void> {
    return async (migration: Migration) => {
      debug('verifying existance', dbName, migration.name)
      if (!(await this.isExistsMigration(dbName, migration.name))) {
        debug('migration.up', dbName, migration.name)
        await migration.up(this.ch, dbName)
        debug('saveMigrationResult', dbName, migration.name)
        await this.saveMigrationResult(dbName, migration.name)
      }
      debug('migration done', dbName, migration.name)
    }
  }

  private async saveMigrationResult(dbName: string, migrationName: string): Promise<any> {
    return this.ch.queryAsync(
      SqlString.format('INSERT INTO ?? (name) VALUES(?)', [`${dbName}.migrations`, migrationName]),
      { format: 'TabSeparated' }
    )
  }

  private async isExistsMigration(dbName: string, migrationName: string): Promise<boolean> {
    const result = await this.ch.queryAsync(
      SqlString.format('SELECT * FROM ?? WHERE name = ?', [`${dbName}.migrations`, migrationName]),
      { format: 'JSONCompact', syncParser: true }
    )

    return result.rows > 0
  }
}
