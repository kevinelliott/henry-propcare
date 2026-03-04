import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CheckCircle, Clock, AlertCircle, XCircle, Wrench, Building2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";

const STATUS_CONFIG = {
  open: {
    icon: AlertCircle,
    label: "Open",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    desc: "Your request has been received and is waiting for review.",
  },
  in_progress: {
    icon: Clock,
    label: "In Progress",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    desc: "Your request is actively being worked on.",
  },
  resolved: {
    icon: CheckCircle,
    label: "Resolved",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    desc: "Your request has been resolved. Thank you for your patience!",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    desc: "This request was cancelled. Please contact your landlord if you still need assistance.",
  },
};

export default async function WorkOrderStatusPage({
  params,
}: {
  params: Promise<{ slug: string; workOrderId: string }>;
}) {
  const { slug, workOrderId } = await params;
  const supabase = await createServiceClient();

  // Verify property exists
  const { data: property } = await supabase
    .from("properties")
    .select("id, name, address")
    .eq("slug", slug)
    .single();

  if (!property) notFound();

  // Fetch work order
  const { data: workOrder } = await supabase
    .from("work_orders")
    .select("*, vendor:vendors(name, specialty, phone)")
    .eq("id", workOrderId)
    .eq("property_id", property.id)
    .single();

  if (!workOrder) notFound();

  const config = STATUS_CONFIG[workOrder.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.open;
  const StatusIcon = config.icon;

  const PROGRESS = {
    open: 25,
    in_progress: 60,
    resolved: 100,
    cancelled: 0,
  };
  const progress = PROGRESS[workOrder.status as keyof typeof PROGRESS] ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Maintenance Request Status</h1>
          <div className="flex items-center gap-2 justify-center mt-2 text-slate-600">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>{property.name}</span>
          </div>
        </div>

        {/* Status card */}
        <div className="card p-6 mb-4">
          {/* Status banner */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${config.bg} ${config.border} mb-6`}>
            <StatusIcon className={`w-8 h-8 ${config.color} flex-shrink-0`} />
            <div>
              <div className={`font-bold text-lg ${config.color}`}>{config.label}</div>
              <div className="text-sm text-slate-600 mt-0.5">{config.desc}</div>
            </div>
          </div>

          {/* Progress bar */}
          {workOrder.status !== "cancelled" && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Submitted</span>
                <span>In Progress</span>
                <span>Resolved</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Details */}
          <div className="space-y-4">
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Issue</div>
              <p className="text-slate-800">{workOrder.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Category</div>
                <div className="text-slate-700 capitalize">{workOrder.category}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Priority</div>
                <div className="text-slate-700 capitalize">{workOrder.priority}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Submitted</div>
                <div className="text-slate-700">
                  {formatDistanceToNow(new Date(workOrder.created_at), { addSuffix: true })}
                </div>
              </div>
              {workOrder.resolved_at && (
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Resolved</div>
                  <div className="text-slate-700">
                    {format(new Date(workOrder.resolved_at), "MMM d, yyyy")}
                  </div>
                </div>
              )}
              {workOrder.unit && (
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Unit</div>
                  <div className="text-slate-700">{workOrder.unit}</div>
                </div>
              )}
            </div>

            {/* Vendor info (if assigned) */}
            {workOrder.vendor && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Assigned Vendor</div>
                <div className="font-medium text-slate-800">{(workOrder.vendor as { name: string }).name}</div>
                <div className="text-sm text-blue-600">{(workOrder.vendor as { specialty: string }).specialty}</div>
                {(workOrder.vendor as { phone?: string }).phone && (
                  <a
                    href={`tel:${(workOrder.vendor as { phone: string }).phone}`}
                    className="text-sm text-slate-600 hover:text-blue-600 mt-1 block"
                  >
                    📞 {(workOrder.vendor as { phone: string }).phone}
                  </a>
                )}
              </div>
            )}

            {/* Landlord notes */}
            {workOrder.notes && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Notes from your landlord</div>
                <p className="text-slate-700 text-sm">{workOrder.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Work order ID */}
        <div className="card p-4 text-center mb-4">
          <div className="text-xs text-slate-500 mb-1">Work Order ID</div>
          <div className="font-mono text-xs text-slate-600 break-all">{workOrder.id}</div>
          <p className="text-xs text-slate-400 mt-1">Save this page URL to check back on your request status.</p>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link href={`/request/${slug}`} className="btn-secondary text-sm">
            Submit Another Request
          </Link>
        </div>
      </div>
    </div>
  );
}
