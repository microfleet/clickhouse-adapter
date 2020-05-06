import { RequestOptions } from 'http'
import { Formats } from '../types'

export interface ClickhouseOptions {
  readonly host: string
  readonly user?: string
  readonly password?: string
  readonly dbName?: string
  readonly path?: string
  readonly port?: number
  readonly protocol?: 'https:' | 'http:'
  readonly dataObjects?: boolean
  readonly isUseGzip?: boolean
  readonly format?: Formats
  readonly queryOptions?: any
  readonly readonly?: boolean
  readonly requestOptions?: RequestOptions
}
