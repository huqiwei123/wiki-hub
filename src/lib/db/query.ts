import type { PoolClient } from "pg";
import { pool } from "./pool";

export async function query<T = Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
) {
  const result = await pool.query<T>(text, values);
  return result.rows;
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
) {
  const rows = await query<T>(text, values);
  return rows[0] ?? null;
}

export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
