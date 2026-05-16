import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { queryOne } from "@/lib/db/query";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many attempts. Try again later." },
      { status: 429, headers: { ...corsHeaders, "Retry-After": String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
    );
  }

  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email address" }, { status: 400, headers: corsHeaders });
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

    return NextResponse.json({ success: true, message: "Subscribed!" }, { headers: corsHeaders });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500, headers: corsHeaders });
  }
}
