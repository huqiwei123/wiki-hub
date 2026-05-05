import { createClient } from "@/lib/supabase/server";
import type { Subscription } from "@/types";

export async function getAllSubscribers() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .order("subscribed_at", { ascending: false });

    if (error || !data) return [];
    return data as Subscription[];
  } catch {
    return [];
  }
}
