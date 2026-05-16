import crypto from "node:crypto";
import { promisify } from "node:util";
import pg from "pg";

const { Pool } = pg;
const scrypt = promisify(crypto.scrypt);

const connectionString = process.env.DATABASE_URL;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const username = process.env.ADMIN_USERNAME ?? "admin";

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

if (!email || !password) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
}

async function hashPassword(value) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const params = { N: 16384, r: 8, p: 1 };
  const derived = await scrypt(value, salt, 64, params);
  return `scrypt:${params.N}:${params.r}:${params.p}:${salt}:${derived.toString("base64url")}`;
}

const pool = new Pool({ connectionString });

await pool.query(
  `
  INSERT INTO profiles (email, password_hash, username, display_name, role)
  VALUES ($1, $2, $3, $3, 'admin')
  ON CONFLICT (email) DO UPDATE
  SET password_hash = excluded.password_hash,
      username = excluded.username,
      display_name = excluded.display_name,
      role = 'admin'
  `,
  [email.toLowerCase(), await hashPassword(password), username],
);

await pool.end();
console.log(`Admin ready: ${email}`);
