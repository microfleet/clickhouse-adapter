import { Options } from './clickhouseOptions'

export interface ClientConfig extends Options {
  readonly host: string
  readonly user?: string
  readonly password?: string
  readonly dbName?: string
  readonly path?: string
  readonly port?: number
  readonly protocol?: 'https:' | 'http:'
}
