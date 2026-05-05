"use server";

import { publicSupabase } from "@/lib/supabase/public";

export async function subscribe(email: string) {
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Invalid email address" };
  }

  const { error } = await publicSupabase.from("subscriptions").upsert(
    {
      email: email.trim().toLowerCase(),
      is_active: true,
      subscribed_at: new Date().toISOString(),
      unsubscribed_at: null,
    },
    { onConflict: "email" }
  );

  if (error) {
    if (error.code === "23505") {
      return { success: true, message: "Already subscribed" };
    }
    return { success: false, message: "Subscription failed" };
  }

  return { success: true, message: "Subscribed!" };
}
