import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface CandidateProfile {
  id: string;
  name: string;
  role: string;
  tags: string[];
  looking_for: string[];
  claude_md_snippet: string | null;
  cool_thing: string | null;
  mcp_servers_skills: string | null;
  claude_title: string | null;
  overlap_count: number;
}

interface BatchScoreResult {
  user_b_id: string;
  score: number;
  reason: string;
  conversation_starter: string;
}

async function scoreBatch(
  userA: CandidateProfile,
  batch: CandidateProfile[]
): Promise<BatchScoreResult[]> {
  const systemPrompt = `You are a networking match scorer for a Claude Code meetup.
Score match quality between Person A and each of the listed candidates (0-100).

Scoring criteria:
- Complementary skills (30%): one has what the other wants
- Shared interests (25%): overlapping tags and tools
- Goal alignment (25%): compatible "looking for" intentions
- Serendipity bonus (20%): unexpected but interesting connections

Return a JSON array (no markdown), one object per candidate:
[{"id":"<candidate_id>","score":<0-100>,"reason":"<one sentence max 100 chars why they should meet>","conversation_starter":"<specific question or topic max 150 chars>"}]`;

  const userPrompt = `PERSON A:
Name: ${userA.name} | Role: ${userA.role}
Tags: ${userA.tags.join(", ")}
Looking for: ${userA.looking_for.join(", ")}
${userA.cool_thing ? `Built: ${userA.cool_thing}` : ""}
${userA.mcp_servers_skills ? `MCP/Skills: ${userA.mcp_servers_skills}` : ""}
${userA.claude_md_snippet ? `claude.md: ${userA.claude_md_snippet.slice(0, 300)}` : ""}

CANDIDATES:
${batch
  .map(
    (c) => `ID: ${c.id}
Role: ${c.role} | Tags: ${c.tags.join(", ")}
Looking for: ${c.looking_for.join(", ")}
${c.cool_thing ? `Built: ${c.cool_thing}` : ""}
${c.mcp_servers_skills ? `MCP: ${c.mcp_servers_skills}` : ""}
---`
  )
  .join("\n")}`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "[]";
  const results = JSON.parse(text) as Array<{
    id: string;
    score: number;
    reason: string;
    conversation_starter: string;
  }>;

  return results.map((r) => ({
    user_b_id: r.id,
    score: Math.max(0, Math.min(100, Math.round(r.score))),
    reason: r.reason,
    conversation_starter: r.conversation_starter,
  }));
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get current user's full profile
  const { data: myProfile } = await admin
    .from("profiles")
    .select("id, name, role, tags, looking_for, claude_md_snippet, cool_thing, mcp_servers_skills, claude_title")
    .eq("id", user.id)
    .single();

  if (!myProfile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Pre-filter: find candidates with tag overlap, limit 50
  const { data: candidates } = await admin
    .from("profiles")
    .select("id, name, role, tags, looking_for, claude_md_snippet, cool_thing, mcp_servers_skills, claude_title")
    .neq("id", user.id)
    .overlaps("tags", myProfile.tags);

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ computed: 0 });
  }

  // Sort by tag overlap count, take top 50
  const withOverlap = candidates
    .map((c) => ({
      ...c,
      overlap_count: c.tags.filter((t: string) => myProfile.tags.includes(t)).length,
    }))
    .sort((a, b) => b.overlap_count - a.overlap_count)
    .slice(0, 50);

  // Top 20: score with Claude in batches of 10
  const top20 = withOverlap.slice(0, 20);
  const rest = withOverlap.slice(20);

  const scoredMatches: Array<{
    user_a: string;
    user_b: string;
    score: number;
    match_reason: string;
    conversation_starter: string;
  }> = [];

  // Process top 20 with Claude in 2 batches of 10
  for (let i = 0; i < top20.length; i += 10) {
    const batch = top20.slice(i, i + 10);
    try {
      const results = await scoreBatch(myProfile as CandidateProfile, batch);
      for (const r of results) {
        const [a, b] = user.id < r.user_b_id ? [user.id, r.user_b_id] : [r.user_b_id, user.id];
        scoredMatches.push({
          user_a: a,
          user_b: b,
          score: r.score,
          match_reason: r.reason,
          conversation_starter: r.conversation_starter,
        });
      }
    } catch {
      // Fall back to overlap scoring for this batch
      for (const c of batch) {
        const score = Math.min(50, c.overlap_count * 8);
        const [a, b] = user.id < c.id ? [user.id, c.id] : [c.id, user.id];
        scoredMatches.push({
          user_a: a,
          user_b: b,
          score,
          match_reason: `Both interested in ${myProfile.tags.filter((t: string) => c.tags.includes(t))[0] || "similar topics"}`,
          conversation_starter: "What are you working on with Claude right now?",
        });
      }
    }
  }

  // Remaining 30: tag-overlap score only (no Claude call)
  for (const c of rest) {
    const score = Math.min(45, c.overlap_count * 6);
    const [a, b] = user.id < c.id ? [user.id, c.id] : [c.id, user.id];
    scoredMatches.push({
      user_a: a,
      user_b: b,
      score,
      match_reason: `Both interested in ${myProfile.tags.filter((t: string) => c.tags.includes(t))[0] || "similar topics"}`,
      conversation_starter: "What are you working on with Claude right now?",
    });
  }

  // Upsert all matches
  if (scoredMatches.length > 0) {
    await admin.from("matches").upsert(scoredMatches, {
      onConflict: "user_a,user_b",
      ignoreDuplicates: false,
    });
  }

  return NextResponse.json({ computed: scoredMatches.length });
}
