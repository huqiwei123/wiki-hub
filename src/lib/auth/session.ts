import crypto from "node:crypto";
import { cookies } from "next/headers";
import { queryOne } from "@/lib/db/query";

export type SessionUser = {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: "admin" | "reader";
};

export const sessionCookieName = process.env.SESSION_COOKIE_NAME ?? "wiki_session";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function sessionTtlMs() {
  const days = Number(process.env.SESSION_TTL_DAYS ?? "30");
  return days * 24 * 60 * 60 * 1000;
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + sessionTtlMs());

  await queryOne(
    "INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    [userId, tokenHash, expiresAt],
  );

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (token) {
    await queryOne("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
  }
  cookieStore.delete(sessionCookieName);
}

export async function getSessionUserFromToken(token: string | undefined) {
  if (!token) return null;

  return queryOne<SessionUser>(
    `
    SELECT p.id, p.email, p.username, p.display_name, p.avatar_url, p.bio, p.role
    FROM sessions s
    JOIN profiles p ON p.id = s.user_id
    WHERE s.token_hash = $1 AND s.expires_at > now()
    `,
    [hashToken(token)],
  );
}

export async function getCurrentSessionUser() {
  const cookieStore = await cookies();
  return getSessionUserFromToken(cookieStore.get(sessionCookieName)?.value);
}
