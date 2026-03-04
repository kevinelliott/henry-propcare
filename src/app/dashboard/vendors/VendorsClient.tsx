"use client";
import { useState } from "react";
import { Plus, Users, Phone, Mail, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Vendor } from "@/lib/types";

const SPECIALTIES = [
  "Plumbing", "Electrical", "HVAC", "Appliance Repair", "General Handyman",
  "Pest Control", "Landscaping", "Cleaning", "Roofing", "Painting", "Other",
];

export default function VendorsClient({
  initialVendors,
  userId,
}: {
  initialVendors: Vendor[];
  userId: string;
}) {
  const supabase = createClient();
  const [vendors, setVendors] = useState(initialVendors);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", specialty: "", phone: "", email: "",
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: err } = await supabase
      .from("vendors")
      .insert({
        ...form,
        phone: form.phone || null,
        email: form.email || null,
        landlord_id: userId,
        active: true,
      })
      .select()
      .single();

    if (err) {
      setError(err.message);
    } else {
      setVendors([...vendors, data]);
      setShowAdd(false);
      setForm({ name: "", specialty: "", phone: "", email: "" });
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this vendor?")) return;
    await supabase.from("vendors").delete().eq("id", id);
    setVendors(vendors.filter((v) => v.id !== id));
  }

  async function toggleActive(vendor: Vendor) {
    const { data } = await supabase
      .from("vendors")
      .update({ active: !vendor.active })
      .eq("id", vendor.id)
      .select()
      .single();
    if (data) setVendors(vendors.map((v) => (v.id === data.id ? data : v)));
  }

  const activeVendors = vendors.filter((v) => v.active);
  const inactiveVendors = vendors.filter((v) => !v.active);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendors</h1>
          <p className="text-slate-500 mt-1">Your maintenance vendor directory</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Vendor
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Add New Vendor</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vendor name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g. Mike's Plumbing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specialty *</label>
                <select
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="">Select specialty...</option>
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="(503) 555-0123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="vendor@example.com"
                />
              </div>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Adding..." : "Add Vendor"}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {vendors.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No vendors yet</h3>
          <p className="text-slate-500 mb-6">Add plumbers, electricians, and handymen to assign to work orders.</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add your first vendor
          </button>
        </div>
      ) : (
        <>
          {activeVendors.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Active ({activeVendors.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {activeVendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    onDelete={handleDelete}
                    onToggle={toggleActive}
                  />
                ))}
              </div>
            </div>
          )}
          {inactiveVendors.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Inactive ({inactiveVendors.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {inactiveVendors.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    onDelete={handleDelete}
                    onToggle={toggleActive}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function VendorCard({
  vendor,
  onDelete,
  onToggle,
}: {
  vendor: Vendor;
  onDelete: (id: string) => void;
  onToggle: (v: Vendor) => void;
}) {
  return (
    <div className={`card p-5 ${!vendor.active ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{vendor.name}</div>
            <div className="text-sm text-blue-600">{vendor.specialty}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle(vendor)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
            title={vendor.active ? "Deactivate" : "Activate"}
          >
            {vendor.active ? (
              <ToggleRight className="w-5 h-5 text-green-500" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => onDelete(vendor.id)}
            className="p-1.5 text-slate-400 hover:text-red-500 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        {vendor.phone && (
          <a
            href={`tel:${vendor.phone}`}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"
          >
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            {vendor.phone}
          </a>
        )}
        {vendor.email && (
          <a
            href={`mailto:${vendor.email}`}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"
          >
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            {vendor.email}
          </a>
        )}
      </div>
    </div>
  );
}
