export const queries = {
  describeTable: (db: string, table: string) => `DESCRIBE TABLE ${db}.${table}`,
  listMigrations: (db: string) => `SELECT * FROM ${db}.migrations`,
  cleanTable: (db: string, table: string) => `TRUNCATE TABLE IF EXISTS ${db}.${table}`,
}
