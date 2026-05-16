import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });

await pool.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )
`);

const migrationsDir = path.join(process.cwd(), "db", "migrations");
const files = (await fs.readdir(migrationsDir))
  .filter((file) => file.endsWith(".sql"))
  .sort();

for (const file of files) {
  const existing = await pool.query(
    "SELECT 1 FROM schema_migrations WHERE filename = $1",
    [file],
  );
  if (existing.rowCount) continue;

  const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
  await pool.query("BEGIN");
  try {
    await pool.query(sql);
    await pool.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [
      file,
    ]);
    await pool.query("COMMIT");
    console.log(`Applied ${file}`);
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
}

await pool.end();
