import { TableBuilder } from '../interfaces'
import { Column, TableSpec } from '../interfaces'
import { ColumnTypes } from '../types'

const CREATE_TABLE = 'CREATE TABLE'
const IF_NOT_EXISTS = 'IF NOT EXISTS'
const ON_CLUSTER = 'ON CLUSTER'

export class TableMaker implements TableBuilder {
  private readonly tableName: string

  private readonly dbName: string

  private readonly clusterName: string | null

  private head: string[] = []

  private columnDefinitions: string[] = []

  private tableOptions: string[] = []

  constructor(
    dbName: string,
    tableName: string,
    clusterName: string | null = null,
    spec?: TableSpec
  ) {
    this.tableName = tableName
    this.dbName = dbName
    this.clusterName = clusterName

    this.head.push(`${CREATE_TABLE} ${IF_NOT_EXISTS} ${this.dbName}.${this.tableName}`.trim())

    if (this.clusterName) {
      this.setupCluster(this.clusterName)
    }

    this.defineColumns(spec?.columnDefinitions)
    this.tableOptions = spec?.tableOptions || []
  }

  public columnDefinition(name: string, type: ColumnTypes, options: string[] = []): this {
    this.columnDefinitions.push(`${name} ${type} ${options.join(' ')}`.trim())
    return this
  }

  public tableOption(option: string): this {
    this.tableOptions.push(option.trim())

    return this
  }

  public toSql(): string {
    return [
      `${this.head.join(' ')} (`,
      `${this.columnDefinitions.join(',\n')}`,
      `) ${this.tableOptions.join(' ')}`,
      '\n',
    ].join('\n')
  }

  private setupCluster(cluster: string): void {
    this.head.push(`${ON_CLUSTER} ${cluster}`.trim())
  }

  private defineColumns(columnDefinitions: Column[] | undefined): void {
    columnDefinitions?.forEach((c: Column) => this.columnDefinition(c.name, c.type, c.options))
  }
}
