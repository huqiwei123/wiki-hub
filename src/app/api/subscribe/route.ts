import { NextRequest, NextResponse } from "next/server";
import { publicSupabase } from "@/lib/supabase/public";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email address" }, { status: 400 });
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
        return NextResponse.json({ success: true, message: "Already subscribed" });
      }
      return NextResponse.json({ success: false, message: "Subscription failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Subscribed!" });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
