import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import type { UsageStatus } from "@/lib/types";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .single();

  const isPro = sub?.status === "active";

  if (isPro) {
    return NextResponse.json<UsageStatus>({ isPro: true, usageToday: 0, limit: Infinity });
  }

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString());

  return NextResponse.json<UsageStatus>({ isPro: false, usageToday: count ?? 0, limit: 2 });
}
