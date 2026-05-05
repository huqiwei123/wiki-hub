import { NextRequest, NextResponse } from "next/server";
import { searchPosts } from "@/queries/search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchPosts(q.trim(), 8);
  return NextResponse.json({ results });
}
