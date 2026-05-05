import { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function pruneExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

export function rateLimit(
  request: NextRequest,
  limit = 30,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("cf-connecting-ip") ??
    "anonymous";

  const now = Date.now();
  pruneExpiredEntries(now);

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(ip, { count: 1, resetTime });
    return { allowed: true, remaining: limit - 1, resetTime };
  }

  entry.count += 1;

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  return { allowed: true, remaining: limit - entry.count, resetTime: entry.resetTime };
}
