import { createClient } from "@/lib/supabase/server";
import { Building2, ClipboardList, CheckCircle, AlertCircle, Clock, Users } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch stats
  const [
    { count: totalProperties },
    { count: openOrders },
    { count: inProgressOrders },
    { count: totalVendors },
  ] = await Promise.all([
    supabase.from("properties").select("*", { count: "exact", head: true }).eq("landlord_id", user!.id),
    supabase.from("work_orders").select("*", { count: "exact", head: true })
      .in("property_id", (await supabase.from("properties").select("id").eq("landlord_id", user!.id)).data?.map(p => p.id) ?? [])
      .eq("status", "open"),
    supabase.from("work_orders").select("*", { count: "exact", head: true })
      .in("property_id", (await supabase.from("properties").select("id").eq("landlord_id", user!.id)).data?.map(p => p.id) ?? [])
      .eq("status", "in_progress"),
    supabase.from("vendors").select("*", { count: "exact", head: true }).eq("landlord_id", user!.id).eq("active", true),
  ]);

  // Fetch recent work orders
  const propertyIds = (await supabase.from("properties").select("id").eq("landlord_id", user!.id)).data?.map(p => p.id) ?? [];
  const { data: recentOrders } = await supabase
    .from("work_orders")
    .select("*, property:properties(name, address)")
    .in("property_id", propertyIds.length > 0 ? propertyIds : ["none"])
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Properties", value: totalProperties ?? 0, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Open Orders", value: openOrders ?? 0, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "In Progress", value: inProgressOrders ?? 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Active Vendors", value: totalVendors ?? 0, icon: Users, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your property maintenance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/work-orders" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">All Work Orders</div>
            <div className="text-sm text-slate-500">View and manage requests</div>
          </div>
        </Link>
        <Link href="/dashboard/properties" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">Properties</div>
            <div className="text-sm text-slate-500">Manage & get portal links</div>
          </div>
        </Link>
        <Link href="/dashboard/vendors" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">Vendors</div>
            <div className="text-sm text-slate-500">Manage your vendor directory</div>
          </div>
        </Link>
      </div>

      {/* Recent work orders */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Work Orders</h2>
          <Link href="/dashboard/work-orders" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        {!recentOrders || recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No work orders yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Add a property to get your tenant portal link.
            </p>
            <Link href="/dashboard/properties" className="btn-primary mt-4 inline-flex">
              Add Property
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Issue</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 hidden sm:table-cell">Property</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 hidden md:table-cell">Priority</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((wo) => (
                  <tr key={wo.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-800 text-sm">{wo.description.slice(0, 50)}{wo.description.length > 50 ? "..." : ""}</div>
                      <div className="text-xs text-slate-400">{wo.category} · {wo.tenant_name}</div>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-600 hidden sm:table-cell">
                      {(wo.property as { name: string } | null)?.name ?? "—"}
                      {wo.unit && <span className="text-slate-400"> #{wo.unit}</span>}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`badge-${wo.status.replace("_", "-")}`}>{wo.status.replace("_", " ")}</span>
                    </td>
                    <td className="px-6 py-3.5 hidden md:table-cell">
                      <span className={`badge-${wo.priority}`}>{wo.priority}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
