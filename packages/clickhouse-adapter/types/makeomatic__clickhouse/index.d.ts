declare module '@makeomatic/clickhouse' {
    import { Duplex, Writable } from 'stream'
    import { RequestOptions } from 'http'
    import type { Pool } from 'undici'
    
    class Clickhouse {
        constructor(options: Clickhouse.Options)
        
        close(): Promise<void>
        query(query: string): Duplex
        query(query: string, options: Clickhouse.QueryOptions): Duplex
        query<T = any>(query: string, callback: Clickhouse.Callback<T>): Writable
        query<T = any>(query: string, options: Clickhouse.QueryOptions, callback: Clickhouse.Callback<T>): Writable
        querying<T = any>(query: string, options?: Clickhouse.QueryOptions): Promise<T>

        pinging(): Promise<any>
        ping(callback: Clickhouse.Callback<any>): void
    }
    
    namespace Clickhouse {
        export type Callback<T> = (error: Error | null, result: T) => void
        export interface Options {
            host: string
            port?: number
            user?: string
            dbName?: string
            password?: string
            path?: string
            pathname?: string
            protocol?: 'http:' | 'https:'
            dataObjects?: boolean
            format?: 'TabSeparated' | 'TabSeparatedRaw' | 'TabSeparatedWithNames' | 'TabSeparatedWithNamesAndTypes' | 'Template' | 'TemplateIgnoreSpaces' | 'CSV' | 'CSVWithNames' | 'CustomSeparated' | 'Values' | 'Vertical' | 'VerticalRaw' | 'JSON' | 'JSONAsString' | 'JSONString' | 'JSONCompact' | 'JSONCompactString' | 'JSONEachRow' | 'JSONEachRowWithProgress' | 'JSONStringsEachRow' | 'JSONStringsEachRowWithProgress' | 'JSONCompactEachRow' | 'JSONCompactEachRowWithNamesAndTypes' | 'JSONCompactStringEachRow' | 'JSONCompactStringEachRowWithNamesAndTypes' | 'TSKV' | 'Pretty' | 'PrettyCompact' | 'PrettyCompactMonoBlock' | 'PrettyNoEscapes' | 'PrettySpace' | 'Protobuf' | 'ProtobufSingle' | 'Avro' | 'AvroConfluent' | 'Parquet' | 'Arrow' | 'ArrowStream' | 'ORC' | 'RowBinary' | 'RowBinaryWithNamesAndTypes' | 'Native' | 'Null' | 'XML' | 'CapnProto' | 'LineAsString' | 'Regexp' | 'RawBLOB'
            queryOptions?: Record<string, string | number>
            readonly?: boolean
            syncParser?: boolean
            requestOptions?: RequestOptions
            poolOptions?: Pool.Options
        }

        export type QueryOptions = Omit<Options, 'host' | 'port' | 'user' | 'password' | 'path' | 'pathname' | 'protocol' | 'poolOptions'>
    }

    export = Clickhouse
}
