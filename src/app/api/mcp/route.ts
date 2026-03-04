import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Simple API key auth check
async function getApiUser(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const key = auth.replace("Bearer ", "");
  if (!key) return null;

  // For now, key is the user's supabase access token or API key
  const supabase = await createServiceClient();
  const { data } = await supabase.auth.getUser(key);
  return data?.user ?? null;
}

export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Pass API key as Bearer token." }, { status: 401 });
  }

  const body = await request.json();
  const { tool, params = {} } = body;

  const supabase = await createServiceClient();

  // Get user's property IDs
  const { data: properties } = await supabase
    .from("properties")
    .select("id")
    .eq("landlord_id", user.id);
  const propertyIds = properties?.map((p: { id: string }) => p.id) ?? [];

  switch (tool) {
    case "list_work_orders": {
      const { status, property_id, limit = 20 } = params;
      let q = supabase
        .from("work_orders")
        .select("*, property:properties(id, name)")
        .in("property_id", propertyIds.length ? propertyIds : ["none"])
        .order("created_at", { ascending: false })
        .limit(limit);
      if (status) q = q.eq("status", status);
      if (property_id) q = q.eq("property_id", property_id);
      const { data, count } = await q;
      return NextResponse.json({ result: { work_orders: data, count } });
    }

    case "create_work_order": {
      const { property_id, category, description, tenant_name, tenant_email, priority = "medium", unit } = params;
      if (!property_id || !category || !description || !tenant_name || !tenant_email) {
        return NextResponse.json({ error: "Missing required params" }, { status: 400 });
      }
      if (!propertyIds.includes(property_id)) {
        return NextResponse.json({ error: "Property not found or access denied" }, { status: 403 });
      }
      const { data, error } = await supabase
        .from("work_orders")
        .insert({ property_id, category, description, tenant_name, tenant_email, priority, unit: unit || null, status: "open" })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ result: data });
    }

    case "update_status": {
      const { work_order_id, status, notes } = params;
      if (!work_order_id || !status) {
        return NextResponse.json({ error: "Missing work_order_id or status" }, { status: 400 });
      }
      const updates: Record<string, unknown> = { status };
      if (notes) updates.notes = notes;
      if (status === "resolved") updates.resolved_at = new Date().toISOString();
      const { data, error } = await supabase
        .from("work_orders")
        .update(updates)
        .eq("id", work_order_id)
        .in("property_id", propertyIds.length ? propertyIds : ["none"])
        .select()
        .single();
      if (error || !data) return NextResponse.json({ error: error?.message ?? "Not found" }, { status: 404 });
      return NextResponse.json({ result: data });
    }

    case "list_properties": {
      const { data } = await supabase
        .from("properties")
        .select("id, name, address, slug, created_at")
        .eq("landlord_id", user.id)
        .order("name");
      return NextResponse.json({ result: { properties: data } });
    }

    case "get_stats": {
      const [
        { count: totalWo },
        { count: openWo },
        { count: inProgressWo },
        { count: totalProps },
        { count: totalVendors },
      ] = await Promise.all([
        supabase.from("work_orders").select("*", { count: "exact", head: true }).in("property_id", propertyIds.length ? propertyIds : ["none"]),
        supabase.from("work_orders").select("*", { count: "exact", head: true }).in("property_id", propertyIds.length ? propertyIds : ["none"]).eq("status", "open"),
        supabase.from("work_orders").select("*", { count: "exact", head: true }).in("property_id", propertyIds.length ? propertyIds : ["none"]).eq("status", "in_progress"),
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("landlord_id", user.id),
        supabase.from("vendors").select("*", { count: "exact", head: true }).eq("landlord_id", user.id).eq("active", true),
      ]);
      return NextResponse.json({
        result: {
          totalWorkOrders: totalWo,
          openWorkOrders: openWo,
          inProgressWorkOrders: inProgressWo,
          totalProperties: totalProps,
          activeVendors: totalVendors,
        },
      });
    }

    default:
      return NextResponse.json(
        {
          error: `Unknown tool: ${tool}`,
          available_tools: ["list_work_orders", "create_work_order", "update_status", "list_properties", "get_stats"],
        },
        { status: 400 }
      );
  }
}

export async function GET() {
  return NextResponse.json({
    name: "PropCare MCP Endpoint",
    version: "1.0.0",
    tools: [
      { name: "list_work_orders", description: "List work orders with optional filters", params: ["status?", "property_id?", "limit?"] },
      { name: "create_work_order", description: "Create a new work order", params: ["property_id", "category", "description", "tenant_name", "tenant_email", "priority?", "unit?"] },
      { name: "update_status", description: "Update work order status", params: ["work_order_id", "status", "notes?"] },
      { name: "list_properties", description: "List all your properties", params: [] },
      { name: "get_stats", description: "Get dashboard statistics", params: [] },
    ],
  });
}
