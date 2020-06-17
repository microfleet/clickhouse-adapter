import { ClickhouseClient } from '../../src'

describe('init clickhouse client', () => {
  it('init', async () => {
    const client = new ClickhouseClient({
      host: 'ch1',
    })

    expect(await client.connection.pinging()).not.toBeNull()
  })
})
