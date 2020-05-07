import { ClickhouseClient } from '../client'

const createDb = (dbName: string): string => `CREATE DATABASE IF NOT EXISTS ${dbName}`
const createMigrationTable = (
  dbName: string
): string => `CREATE TABLE IF NOT EXISTS ${dbName}.migrations (
  name String,
  migrated_at Date DEFAULT now()
) ENGINE = MergeTree(migrated_at, name, 8192);`

export class SystemMigrator {
  private readonly ch: ClickhouseClient

  constructor(ch: ClickhouseClient) {
    this.ch = ch
  }

  public async up(dbName: string): Promise<void> {
    await this.ch.connection.querying(createDb(dbName))
    await this.ch.connection.querying(createMigrationTable(dbName))
  }
}
