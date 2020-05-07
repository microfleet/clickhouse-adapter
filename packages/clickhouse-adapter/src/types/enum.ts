interface EnumProps {
  name: string
  id: string
}

export class EnumClickhouse {
  private readonly value: string

  constructor(enums: EnumProps[]) {
    this.value = enums
      .map((item: { name: string; id: string }) => `'${item.name}' = ${item.id}`)
      .join(',')
  }

  public toString(): string {
    return this.value
  }
}
