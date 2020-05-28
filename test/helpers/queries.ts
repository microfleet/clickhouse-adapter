export const queries = {
  describeTable: (db: string, table: string): string => `DESCRIBE TABLE ${db}.${table}`,
  listMigrations: (db: string): string => `SELECT * FROM ${db}.migrations`,
  cleanTable: (db: string, table: string): string => `TRUNCATE TABLE IF EXISTS ${db}.${table}`,
}
