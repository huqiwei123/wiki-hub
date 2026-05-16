declare module "pg" {
  export type QueryResult<T> = {
    rows: T[];
    rowCount: number | null;
  };

  export class Pool {
    constructor(config?: { connectionString?: string; max?: number; idleTimeoutMillis?: number });
    query<T = Record<string, unknown>>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
    connect(): Promise<PoolClient>;
    end(): Promise<void>;
  }

  export type PoolClient = {
    query<T = Record<string, unknown>>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
    release(): void;
  };

  export type QueryConfig = {
    text: string;
    values?: unknown[];
  };

  const pg: {
    Pool: typeof Pool;
    types: {
      setTypeParser(oid: number, parser: (value: string) => unknown): void;
    };
  };

  export default pg;
}
