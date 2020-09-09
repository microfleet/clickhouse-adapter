import { RequestOptions } from 'http'
import { Formats } from '../types'
import { ClickhouseSettings } from './clickhouseSettings'

export interface Options extends RequestOptions {
  readonly dataObjects?: boolean
  readonly format?: Formats
  readonly omitFormat?: boolean
  readonly queryOptions?: ClickhouseSettings
  readonly readonly?: boolean
  readonly syncParser?: boolean
}
