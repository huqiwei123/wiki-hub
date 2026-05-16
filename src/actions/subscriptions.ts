"use server";

import { queryOne } from "@/lib/db/query";

export async function subscribe(email: string) {
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Invalid email address" };
  }

  await queryOne(
    `
    INSERT INTO subscriptions (email, is_active, subscribed_at, unsubscribed_at)
    VALUES ($1, true, now(), null)
    ON CONFLICT (email) DO UPDATE
    SET is_active = true,
        subscribed_at = now(),
        unsubscribed_at = null
    `,
    [email.trim().toLowerCase()],
  );

  return { success: true, message: "Subscribed!" };
}
