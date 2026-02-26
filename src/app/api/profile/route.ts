import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateClaudeTitle } from "@/lib/claude";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    name, role, tags, looking_for,
    claude_md_snippet, cool_thing, mcp_servers_skills,
    linkedin_url, share_email, discoverable,
    photo_url,
  } = body;

  // Basic validation
  if (!name?.trim() || !role?.trim() || !tags?.length || !looking_for?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const primary_tag = tags[0] ?? null;

  // Generate Claude title immediately
  let claude_title: string | null = null;
  try {
    claude_title = await generateClaudeTitle({
      role, tags, looking_for,
      claude_md_snippet, cool_thing, mcp_servers_skills,
    });
  } catch {
    // Non-fatal — title can be generated later
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      name: name.trim(),
      role: role.trim().slice(0, 60),
      tags,
      looking_for,
      primary_tag,
      claude_title,
      claude_title_regenerations: claude_title ? 1 : 0,
      claude_md_snippet: claude_md_snippet?.trim().slice(0, 2000) || null,
      cool_thing: cool_thing?.trim().slice(0, 280) || null,
      mcp_servers_skills: mcp_servers_skills?.trim().slice(0, 500) || null,
      linkedin_url: linkedin_url?.trim() || null,
      share_email: share_email ?? false,
      email: user.email ?? null,
      discoverable: discoverable ?? true,
      photo_url: photo_url || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { error } = await supabase
    .from("profiles")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
