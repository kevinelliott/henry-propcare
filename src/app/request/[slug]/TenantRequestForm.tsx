"use client";
import { useState } from "react";
import { Wrench, CheckCircle, AlertTriangle, Building2 } from "lucide-react";
import Link from "next/link";

interface Property {
  id: string;
  name: string;
  address: string;
}

const CATEGORIES = [
  { value: "plumbing", label: "Plumbing", icon: "🚿" },
  { value: "electrical", label: "Electrical", icon: "⚡" },
  { value: "hvac", label: "HVAC / Heating / AC", icon: "❄️" },
  { value: "appliance", label: "Appliance", icon: "🍳" },
  { value: "structural", label: "Structural / Doors / Windows", icon: "🏠" },
  { value: "pest", label: "Pest Control", icon: "🐛" },
  { value: "cleaning", label: "Cleaning", icon: "🧹" },
  { value: "other", label: "Other", icon: "🔧" },
];

const PRIORITIES = [
  { value: "low", label: "Low", desc: "Can wait a week or more", color: "border-slate-200 hover:border-slate-400" },
  { value: "medium", label: "Medium", desc: "Needs attention within a few days", color: "border-yellow-200 hover:border-yellow-400" },
  { value: "high", label: "High", desc: "Needs attention within 24 hours", color: "border-orange-200 hover:border-orange-400" },
  { value: "emergency", label: "Emergency", desc: "Immediate safety hazard", color: "border-red-200 hover:border-red-400" },
];

export default function TenantRequestForm({ property }: { property: Property }) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [workOrderId, setWorkOrderId] = useState<string | null>(null);

  const [form, setForm] = useState({
    tenant_name: "",
    tenant_email: "",
    unit: "",
    category: "",
    description: "",
    priority: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category) {
      setError("Please select a category.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/v1/work-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property_id: property.id,
        ...form,
        unit: form.unit || null,
        public: true,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
    } else {
      setWorkOrderId(data.id);
      setStep("success");
    }
    setLoading(false);
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="card p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h1>
            <p className="text-slate-600 mb-6">
              Your maintenance request has been received. Your landlord will review it and get back to you.
            </p>
            {workOrderId && (
              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Your Work Order ID</div>
                <div className="font-mono text-sm font-bold text-slate-800 break-all">{workOrderId}</div>
                <p className="text-xs text-slate-400 mt-2">
                  Save this ID to track your request status.
                </p>
              </div>
            )}
            {workOrderId && (
              <Link
                href={`/request/${window.location.pathname.split("/")[2]}/${workOrderId}`}
                className="btn-primary w-full mb-3"
              >
                Track Request Status
              </Link>
            )}
            <button
              onClick={() => {
                setStep("form");
                setForm({ tenant_name: "", tenant_email: "", unit: "", category: "", description: "", priority: "medium" });
                setWorkOrderId(null);
              }}
              className="btn-secondary w-full"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Submit a Maintenance Request</h1>
          <div className="flex items-center gap-2 justify-center mt-2 text-slate-600">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="font-medium">{property.name}</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{property.address}</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Your name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.tenant_name}
                  onChange={(e) => setForm({ ...form, tenant_name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Jane Resident"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.tenant_email}
                  onChange={(e) => setForm({ ...form, tenant_email: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit number (optional)</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="e.g. 4B"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Issue type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.value })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all ${
                      form.category === cat.value
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs font-medium text-slate-700 leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Describe the issue <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="Please describe the issue in detail. Include the location (e.g. 'kitchen sink') and when it started..."
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Priority level</label>
              <div className="grid sm:grid-cols-4 gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p.value })}
                    className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${
                      form.priority === p.value
                        ? `border-blue-600 bg-blue-50`
                        : p.color
                    }`}
                  >
                    <span className="font-semibold text-sm text-slate-800">{p.label}</span>
                    <span className="text-xs text-slate-500 mt-0.5 leading-tight">{p.desc}</span>
                  </button>
                ))}
              </div>
              {form.priority === "emergency" && (
                <div className="mt-3 flex items-start gap-2 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  If there is an immediate safety risk (gas leak, fire, flooding), call emergency services (911) first.
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 rounded-lg px-4 py-3 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? "Submitting..." : "Submit Maintenance Request"}
            </button>

            <p className="text-xs text-slate-400 text-center">
              Your request goes directly to your landlord. No account needed.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
