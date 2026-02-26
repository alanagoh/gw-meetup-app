import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get IDs the user already has matches with
  const { data: existingMatches } = await supabase
    .from("matches")
    .select("user_a, user_b")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id})`);

  const knownIds = new Set([
    user.id,
    ...(existingMatches || []).map((m) =>
      m.user_a === user.id ? m.user_b : m.user_a
    ),
  ]);

  // Pick a random profile outside their match pool
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, role, tags, claude_title, photo_url, primary_tag")
    .not("id", "in", `(${Array.from(knownIds).join(",")})`)
    .limit(50);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ profile: null });
  }

  const random = profiles[Math.floor(Math.random() * profiles.length)];
  return NextResponse.json({
    profile: random,
    match_reason: "A wild card pick — sometimes the best connections are unexpected.",
    conversation_starter: "What's the most surprising thing Claude has helped you build?",
  });
}
