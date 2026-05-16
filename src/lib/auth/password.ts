import crypto from "node:crypto";

const keyLength = 64;
const params = { N: 16384, r: 8, p: 1 };

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const derived = crypto.scryptSync(password, salt, keyLength, params);
  return `scrypt:${params.N}:${params.r}:${params.p}:${salt}:${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, n, r, p, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !n || !r || !p || !salt || !hash) return false;

  const derived = crypto.scryptSync(password, salt, keyLength, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });

  const expected = Buffer.from(hash, "base64url");
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}
