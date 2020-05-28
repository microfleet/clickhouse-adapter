import { ClickhouseClient } from '../../src'

describe('init clickhouse client', () => {
  it('init', async () => {
    const client = new ClickhouseClient({
      host: 'clickhouse',
    })

    expect(await client.connection.pinging()).not.toBeNull()
  })
})
