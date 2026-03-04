"use client";
import { useState } from "react";
import { Filter, Search, ClipboardList, ChevronDown, X, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import type { WorkOrder, WorkOrderStatus } from "@/lib/types";

interface Property { id: string; name: string }
interface Vendor { id: string; name: string; specialty: string }

const STATUS_OPTIONS: WorkOrderStatus[] = ["open", "in_progress", "resolved", "cancelled"];

function StatusBadge({ status }: { status: string }) {
  const cls = `badge-${status.replace("_", "-")}`;
  return <span className={cls}>{status.replace("_", " ")}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  return <span className={`badge-${priority}`}>{priority}</span>;
}

export default function WorkOrdersClient({
  initialWorkOrders,
  properties,
  vendors,
}: {
  initialWorkOrders: WorkOrder[];
  properties: Property[];
  vendors: Vendor[];
}) {
  const supabase = createClient();
  const [workOrders, setWorkOrders] = useState(initialWorkOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [selected, setSelected] = useState<WorkOrder | null>(null);
  const [saving, setSaving] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState<WorkOrderStatus>("open");
  const [editVendor, setEditVendor] = useState<string>("");

  const filtered = workOrders.filter((wo) => {
    if (statusFilter !== "all" && wo.status !== statusFilter) return false;
    if (propertyFilter !== "all" && wo.property_id !== propertyFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !wo.description.toLowerCase().includes(q) &&
        !wo.tenant_name.toLowerCase().includes(q) &&
        !wo.category.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  function openDetail(wo: WorkOrder) {
    setSelected(wo);
    setEditNotes(wo.notes ?? "");
    setEditStatus(wo.status);
    setEditVendor(wo.vendor_id ?? "");
  }

  async function saveChanges() {
    if (!selected) return;
    setSaving(true);
    const updates: Record<string, string | null> = {
      status: editStatus,
      notes: editNotes || null,
      vendor_id: editVendor || null,
    };
    if (editStatus === "resolved" && selected.status !== "resolved") {
      updates.resolved_at = new Date().toISOString();
    }
    const { data, error } = await supabase
      .from("work_orders")
      .update(updates)
      .eq("id", selected.id)
      .select("*, property:properties(id, name, address), vendor:vendors(id, name, specialty)")
      .single();

    if (!error && data) {
      setWorkOrders(workOrders.map((wo) => (wo.id === data.id ? data : wo)));
      setSelected(data);
    }
    setSaving(false);
  }

  const stats = {
    open: workOrders.filter((w) => w.status === "open").length,
    in_progress: workOrders.filter((w) => w.status === "in_progress").length,
    resolved: workOrders.filter((w) => w.status === "resolved").length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Work Orders</h1>
          <p className="text-slate-500 mt-1">All maintenance requests across your properties</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { key: "open", label: "Open", cls: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
          { key: "in_progress", label: "In Progress", cls: "text-yellow-600", bg: "bg-yellow-50 border-yellow-100" },
          { key: "resolved", label: "Resolved", cls: "text-green-600", bg: "bg-green-50 border-green-100" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(statusFilter === s.key ? "all" : s.key)}
            className={`card p-4 text-center border transition-all hover:shadow-sm ${
              statusFilter === s.key ? s.bg : ""
            }`}
          >
            <div className={`text-2xl font-bold ${s.cls}`}>{stats[s.key as keyof typeof stats]}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search work orders..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <Building2Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
          >
            <option value="all">All properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No work orders found</p>
            <p className="text-slate-400 text-sm mt-1">
              {workOrders.length === 0
                ? "Work orders will appear here when tenants submit requests."
                : "Try changing your filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Issue</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 hidden sm:table-cell">Property</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 hidden md:table-cell">Priority</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 hidden lg:table-cell">Tenant</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 hidden xl:table-cell">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((wo) => (
                  <tr
                    key={wo.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onClick={() => openDetail(wo)}
                  >
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-800 text-sm">{wo.description.slice(0, 60)}{wo.description.length > 60 ? "..." : ""}</div>
                      <div className="text-xs text-slate-400 capitalize">{wo.category}</div>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-600 hidden sm:table-cell">
                      {(wo.property as { name: string } | null)?.name ?? "—"}
                      {wo.unit && <span className="text-slate-400"> #{wo.unit}</span>}
                    </td>
                    <td className="px-6 py-3.5"><StatusBadge status={wo.status} /></td>
                    <td className="px-6 py-3.5 hidden md:table-cell"><PriorityBadge priority={wo.priority} /></td>
                    <td className="px-6 py-3.5 text-sm text-slate-600 hidden lg:table-cell">{wo.tenant_name}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-400 hidden xl:table-cell">
                      {formatDistanceToNow(new Date(wo.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{selected.description.slice(0, 80)}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <StatusBadge status={selected.status} />
                  <PriorityBadge priority={selected.priority} />
                  <span className="text-xs text-slate-400 capitalize">{selected.category}</span>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-500 text-xs mb-1">Tenant</div>
                  <div className="font-medium text-slate-800">{selected.tenant_name}</div>
                  <div className="text-slate-500">{selected.tenant_email}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1">Property</div>
                  <div className="font-medium text-slate-800">
                    {(selected.property as { name: string } | null)?.name ?? "—"}
                  </div>
                  {selected.unit && <div className="text-slate-500">Unit {selected.unit}</div>}
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1">Submitted</div>
                  <div className="text-slate-700">
                    {formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })}
                  </div>
                </div>
                {selected.resolved_at && (
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Resolved</div>
                    <div className="text-slate-700">
                      {formatDistanceToNow(new Date(selected.resolved_at), { addSuffix: true })}
                    </div>
                  </div>
                )}
              </div>

              {/* Full description */}
              <div>
                <div className="text-slate-500 text-xs mb-1">Description</div>
                <p className="text-slate-700 text-sm">{selected.description}</p>
              </div>

              {/* Edit status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setEditStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        editStatus === s
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign vendor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assign Vendor</label>
                <select
                  value={editVendor}
                  onChange={(e) => setEditVendor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Unassigned</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} ({v.specialty})</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Add notes about this work order..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={() => setSelected(null)} className="btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Building2Icon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </svg>
  );
}
