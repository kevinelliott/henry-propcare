import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// GET /api/v1/work-orders
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const property_id = searchParams.get("property_id");
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);
  const isPublic = searchParams.get("public") === "1";

  const supabase = isPublic
    ? await createServiceClient()
    : await createClient();

  if (!isPublic) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let query = (await createServiceClient())
    .from("work_orders")
    .select("*, property:properties(id, name, address), vendor:vendors(id, name, specialty)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);
  if (property_id) query = query.eq("property_id", property_id);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count });
}

// POST /api/v1/work-orders
export async function POST(request: Request) {
  const body = await request.json();
  const {
    property_id,
    unit,
    category,
    description,
    priority = "medium",
    tenant_name,
    tenant_email,
    vendor_id,
    notes,
    public: isPublic,
  } = body;

  if (!property_id || !category || !description || !tenant_name || !tenant_email) {
    return NextResponse.json(
      { error: "Missing required fields: property_id, category, description, tenant_name, tenant_email" },
      { status: 400 }
    );
  }

  const supabase = await createServiceClient();

  // Verify property exists
  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", property_id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("work_orders")
    .insert({
      property_id,
      unit: unit || null,
      category,
      description,
      priority,
      tenant_name,
      tenant_email,
      vendor_id: vendor_id || null,
      notes: notes || null,
      status: "open",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/v1/work-orders (not /api/v1/work-orders/:id — dynamic route is separate)
export async function PATCH(request: Request) {
  return NextResponse.json({ error: "Use /api/v1/work-orders/:id for updates" }, { status: 400 });
}
