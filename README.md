# @microfleet / clickhouse-adapter

## Installation

`yarn add @microfleet/clickhouse-adapter`

## Using

clickhouse-adapter was created to work with Yandex.ClickHouse. The package is a wrapper over @apple/node-clickhouse that provides additional tools:

- migration;
- table maker (schemas);
- typed methods for inserting and reading data.

### Configuring

#### Default options

```typescript
{
    host: 'clickhouse',
    dbName: 'default',
    user: 'default',
    password: '',
    format: 'JSONEachRow',
  }
```

#### Available options

- `host` (required) - ClickHouse Host
- `user` (optional) - Authentication User
- `password` (optional) - Authentication Password
- `dbName` (optional) - Database Name
- `path` (optional) - Path name of ClickHouse server (default: `/`)
- `port` (optional) - Server port (default: `8123`)
- `protocol` (optional) - 'https:' or 'http:' (default: `http:`)
- `dataObjects` (optional) - if set to `false` each row is will represented as an array, for `true` - every row will represented an object `{ field: 'value' }`. Default: `false`
- `format` (optional) - Supported formats: JSON, JSONEachRow, CSV, TabSeparated (more information: [link](https://clickhouse.tech/docs/en/interfaces/formats/)). Default: `JSON`
- `queryOptions` (optional) - ClickHouse options (more information: [link](https://clickhouse.tech/docs/en/operations/settings/)
- `readonly` (optional) - ReadOnly options (more information: [link](https://clickhouse.tech/docs/en/operations/settings/permissions-for-queries/#settings_readonly))
- `requestOptions` (optional) - http or https request options (more information: [http.request](https://nodejs.org/api/http.html#http_http_request_options_callback), [https.request](https://nodejs.org/api/https.html#https_https_request_options_callback))

### Initialization

```typescript
const ch = new ClickhouseClient({
  host: 'clickhouse',
})
```

### Use cases

#### Table maker

```typescript
new TableMaker('db_test', 'test_table', null /* cluster name */, {
  columnDefinitions: [
    { name: 'trackDate', type: 'Date' },
    { name: 'trackTimestamp', type: 'DateTime' },
    { name: 'eventType', type: 'String' },
  ],
  tableOptions: ['ENGINE = MergeTree(trackDate, (eventType), 8192)'],
})
```

#### System migration

```typescript
const migrator = new SystemMigrator(ch)
await migrator.up(dbName)
```

**Note**: it will create a table in which to store the completed user migrations.

```typescript
const migrator = new SystemMigrator(ch)
await migrator.up(dbName)

const migrator = new Migrator(ch)

migrator.addMigration({
  name: '1589508238_event_a',
  async up(clickhouseClient: ClickhouseClient): Promise<boolean> {
    await clickhouseClient.createTable(
      new TableMaker('db_test', 'event_a', null, {
        columnDefinitions: [
          { name: 'trackDate', type: 'Date' },
          { name: 'trackTimestamp', type: 'DateTime' },
          { name: 'event_type', type: 'String' },
        ],
        tableOptions: ['ENGINE = MergeTree(trackDate, (trackTimestamp, event_type), 8192)'],
      })
    )
    return true
  },
})

await migrator.up(migrator.migrateAll(DB_NAME))
```

#### Insert data

```typescript
const insertData: InsertData = {
  query: () => {
    return 'INSERT INTO event_a'
  },
  data: () => {
    return [
      {
        trackDate: moment(now).format('YYYY-MM-DD'),
        trackTimestamp: moment(now).format('YYYY-MM-DD HH:mm:ss'),
        eventType: 'type_a',
      },
    ]
  },
}

ch.insert(DB_NAME, insertData, (err, result) => {
  ...
})
```

#### Read data

```typescript
ch.query(
  this.dbName,
  sqlstring.format(
    `SELECT * FROM event_a`,
    [this.dbName, this.tableName]
  ),
  (err, result) => {...}
)
```

## Roadmap

- [ ] TSV support
- [ ] insert async
- [ ] create migration table on cluster
- [ ] add methods for works with cluster (ping, health check, ...)
