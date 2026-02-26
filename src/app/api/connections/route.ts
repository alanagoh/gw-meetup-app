import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RawProfile = {
  id: string;
  name: string;
  role: string;
  claude_title: string | null;
  photo_url: string | null;
  primary_tag: string | null;
  tags: string[];
  linkedin_url: string | null;
  share_email: boolean;
  email: string | null;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: connections, error } = await supabase
    .from("connections")
    .select(
      `id, connected_at,
       profile_a:profiles!connections_user_a_fkey(id, name, role, claude_title, photo_url, primary_tag, tags, linkedin_url, share_email, email),
       profile_b:profiles!connections_user_b_fkey(id, name, role, claude_title, photo_url, primary_tag, tags, linkedin_url, share_email, email)`
    )
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("connected_at", { ascending: false });

  if (error || !connections) {
    return NextResponse.json([]);
  }

  const result = (
    connections as unknown as Array<{
      id: string;
      connected_at: string;
      profile_a: RawProfile;
      profile_b: RawProfile;
    }>
  ).map((c) => {
    const other = c.profile_a.id === user.id ? c.profile_b : c.profile_a;
    return {
      id: c.id,
      connected_at: c.connected_at,
      other: {
        ...other,
        // Only expose email if they opted in
        email: other.share_email ? other.email : null,
      },
    };
  });

  return NextResponse.json(result);
}
