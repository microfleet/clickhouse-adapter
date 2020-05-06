import SqlString from 'sqlstring'
import { ClickhouseClient } from '../client'
import { Migration } from '../interfaces'

export class Migrator {
  private readonly ch: ClickhouseClient

  private readonly migrations: Migration[] = []

  constructor(ch: ClickhouseClient) {
    this.ch = ch
  }

  public migrationList(): Migration[] {
    return this.migrations
  }

  public up(callback: (migrator: Migrator) => Promise<any>) {
    return callback(this)
  }

  public migrateAll(dbName: string) {
    return (migrator: Migrator) => {
      return Promise.all(migrator.migrationList().map(migrator.migrate(dbName), migrator))
    }
  }

  public addMigration(migration: Migration) {
    this.migrations.push(migration)
  }

  private migrate(dbName: string): (migration: Migration) => Promise<void> {
    return async (migration: Migration) => {
      if (!(await this.isExistsMigration(dbName, migration.name))) {
        await migration.up(this.ch, dbName)
        await this.saveMigrationResult(dbName, migration.name)
      }
    }
  }

  private async saveMigrationResult(dbName: string, migrationName: string) {
    return this.ch.connection.querying(
      SqlString.format('INSERT INTO ?? (name) VALUES(?)', [`${dbName}.migrations`, migrationName])
    )
  }

  private async isExistsMigration(dbName: string, migrationName: string) {
    const result = await this.ch.connection.querying(
      SqlString.format('SELECT * FROM ?? WHERE name = ?', [`${dbName}.migrations`, migrationName]),
      { format: 'JSON' }
    )
    return result.data.length > 0
  }
}
