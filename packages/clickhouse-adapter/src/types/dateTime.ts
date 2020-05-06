export class DateTime {
  private readonly value: string

  constructor(timeZone: string) {
    this.value = `DateTime('${timeZone}')`
  }

  public toString() {
    return this.value
  }
}
