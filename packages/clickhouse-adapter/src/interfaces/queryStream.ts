import type { Duplex } from 'stream'

export interface SupplementalInformation {
  rows: number
  statistics: {
    elapsed: number
    rows_read: number
    bytes_read: number
  }
}

export interface QueryStream extends Duplex {
  /**
   * Available only for SELECT queries with JSON* format
   */
  supplemental?: SupplementalInformation
}
