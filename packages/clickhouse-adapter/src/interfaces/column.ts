import { ColumnTypes } from '../types'

export interface Column {
  name: string
  type: ColumnTypes
  options?: string[]
}
