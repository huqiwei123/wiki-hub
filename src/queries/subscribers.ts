import { requireAdmin } from "@/lib/auth/current-user";
import { query } from "@/lib/db/query";
import type { Subscription } from "@/types";

export async function getAllSubscribers() {
  await requireAdmin();

  return query<Subscription>(
    `
    SELECT id, email, is_active, subscribed_at, unsubscribed_at
    FROM subscriptions
    ORDER BY subscribed_at DESC
    `,
  );
}
