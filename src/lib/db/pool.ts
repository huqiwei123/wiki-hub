import pg from "pg";
import type { Pool as PgPool } from "pg";

const { Pool } = pg;

pg.types.setTypeParser(1114, (value) => value);
pg.types.setTypeParser(1184, (value) => value);

declare global {
  var __wikiPgPool: PgPool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

export const pool =
  globalThis.__wikiPgPool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__wikiPgPool = pool;
}
