import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if ("is_beacon_active" in body) {
    updates.is_beacon_active = body.is_beacon_active;
    if (body.is_beacon_active) {
      updates.beacon_activated_at = new Date().toISOString();
    }
  }
  if (body.beacon_totem) updates.beacon_totem = body.beacon_totem;
  if (body.beacon_color) updates.beacon_color = body.beacon_color;
  if (body.beacon_bg) updates.beacon_bg = body.beacon_bg;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
