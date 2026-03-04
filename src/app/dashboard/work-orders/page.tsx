import { createClient } from "@/lib/supabase/server";
import WorkOrdersClient from "./WorkOrdersClient";

export default async function WorkOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, name")
    .eq("landlord_id", user!.id)
    .order("name");

  const propertyIds = properties?.map((p) => p.id) ?? [];

  const { data: workOrders } = await supabase
    .from("work_orders")
    .select("*, property:properties(id, name, address), vendor:vendors(id, name, specialty)")
    .in("property_id", propertyIds.length > 0 ? propertyIds : ["none"])
    .order("created_at", { ascending: false });

  const { data: vendors } = await supabase
    .from("vendors")
    .select("id, name, specialty")
    .eq("landlord_id", user!.id)
    .eq("active", true);

  return (
    <WorkOrdersClient
      initialWorkOrders={workOrders ?? []}
      properties={properties ?? []}
      vendors={vendors ?? []}
    />
  );
}
