import { Column } from './column'

export interface TableSpec {
  columnDefinitions?: Column[]
  tableOptions?: string[]
  constraints?: string[]
}
