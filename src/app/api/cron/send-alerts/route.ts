import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  // Vercel cron protection
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  // Get all landlords on starter/growth with open work orders
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, plan")
    .in("plan", ["starter", "growth"]);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ sent: 0, message: "No eligible users" });
  }

  let sent = 0;
  const results: Array<{ userId: string; openCount: number }> = [];

  for (const profile of profiles) {
    // Get open work orders for this landlord's properties
    const { data: properties } = await supabase
      .from("properties")
      .select("id, name")
      .eq("landlord_id", profile.user_id);

    if (!properties || properties.length === 0) continue;

    const propIds = properties.map((p: { id: string }) => p.id);

    const { data: openOrders, count } = await supabase
      .from("work_orders")
      .select("id, description, priority, property:properties(name)", { count: "exact" })
      .in("property_id", propIds)
      .eq("status", "open");

    if (!openOrders || (count ?? 0) === 0) continue;

    // In production, send email here using resend/sendgrid
    // For now, log the digest
    console.log(`[cron/send-alerts] User ${profile.user_id}: ${count} open work orders`);
    results.push({ userId: profile.user_id, openCount: count ?? 0 });
    sent++;
  }

  return NextResponse.json({
    sent,
    results,
    timestamp: new Date().toISOString(),
  });
}
