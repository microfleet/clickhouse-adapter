const allowDDlValue = [0, 1] as const

/**
 * See https://clickhouse.tech/docs/en/operations/settings/
 */
export interface ClickhouseSettings {
  readonly database: string
  readonly readonly?: boolean
  readonly allow_ddl?: typeof allowDDlValue[number]
  readonly profile?: string
  readonly [key: string]: any
}
