import { createClient } from "@/lib/supabase/server";
import PropertiesClient from "./PropertiesClient";

export default async function PropertiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: properties } = await supabase
    .from("properties")
    .select("*, work_orders(count)")
    .eq("landlord_id", user!.id)
    .order("created_at", { ascending: false });

  return <PropertiesClient initialProperties={properties ?? []} userId={user!.id} />;
}
