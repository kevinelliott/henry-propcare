import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import TenantRequestForm from "./TenantRequestForm";

export default async function TenantRequestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServiceClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id, name, address")
    .eq("slug", slug)
    .single();

  if (!property) {
    notFound();
  }

  return <TenantRequestForm property={property} />;
}
