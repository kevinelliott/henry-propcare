import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const [
    { count: users },
    { count: properties },
    { count: workOrders },
    { count: openWorkOrders },
    { count: vendors },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("work_orders").select("*", { count: "exact", head: true }),
    supabase.from("work_orders").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("vendors").select("*", { count: "exact", head: true }),
  ]);

  // Plan distribution
  const { data: plans } = await supabase
    .from("profiles")
    .select("plan");

  const planCounts = (plans ?? []).reduce((acc: Record<string, number>, p) => {
    acc[p.plan] = (acc[p.plan] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    users,
    properties,
    workOrders,
    openWorkOrders,
    vendors,
    planDistribution: planCounts,
    timestamp: new Date().toISOString(),
  });
}
