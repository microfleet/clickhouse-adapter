declare module '@apla/clickhouse' {
    import { Duplex, Writable } from 'stream'
    import { RequestOptions } from 'http'
    
    class Clickhouse {
        constructor(options: Clickhouse.Options)
        
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
            format?: 'JSON' | 'JSONCompact' | 'JSONEachRow' | 'CSV' | 'TabSeparated'
            queryOptions?: Record<string, string | number>
            readonly?: boolean
            syncParser?: boolean
            requestOptions?: RequestOptions
        }

        export type QueryOptions = Omit<Options, 'host' | 'port' | 'user' | 'password' | 'path' | 'pathname' | 'protocol'>
    }

    export = Clickhouse
}
