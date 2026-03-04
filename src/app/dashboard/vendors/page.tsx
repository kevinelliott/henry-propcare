import { createClient } from "@/lib/supabase/server";
import VendorsClient from "./VendorsClient";

export default async function VendorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: vendors } = await supabase
    .from("vendors")
    .select("*")
    .eq("landlord_id", user!.id)
    .order("name");

  return <VendorsClient initialVendors={vendors ?? []} userId={user!.id} />;
}
