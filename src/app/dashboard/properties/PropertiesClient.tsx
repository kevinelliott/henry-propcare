"use client";
import { useState } from "react";
import { Building2, Plus, Link as LinkIcon, Copy, Check, Trash2, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Property {
  id: string;
  name: string;
  address: string;
  slug: string;
  created_at: string;
  work_orders?: Array<{ count: number }>;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function PropertiesClient({
  initialProperties,
  userId,
}: {
  initialProperties: Property[];
  userId: string;
}) {
  const supabase = createClient();
  const [properties, setProperties] = useState(initialProperties);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const portalBase = typeof window !== "undefined" ? `${window.location.origin}/request` : "/request";

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const slug = slugify(name) + "-" + Math.random().toString(36).slice(2, 6);

    const { data, error: err } = await supabase
      .from("properties")
      .insert({ name, address, slug, landlord_id: userId })
      .select()
      .single();

    if (err) {
      setError(err.message);
    } else {
      setProperties([data, ...properties]);
      setShowAdd(false);
      setName("");
      setAddress("");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this property? All work orders will also be deleted.")) return;
    const { error: err } = await supabase.from("properties").delete().eq("id", id);
    if (!err) setProperties(properties.filter((p) => p.id !== id));
  }

  function copyPortalLink(slug: string, id: string) {
    navigator.clipboard.writeText(`${portalBase}/${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
          <p className="text-slate-500 mt-1">Manage your properties and tenant portal links</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Add New Property</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Property name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="e.g. Oak Street Apartments"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="e.g. 123 Oak St, Portland OR 97201"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Adding..." : "Add Property"}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Properties list */}
      {properties.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No properties yet</h3>
          <p className="text-slate-500 mb-6">Add your first property to generate a tenant request portal link.</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add your first property
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <div key={property.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{property.name}</h3>
                    <p className="text-slate-500 text-sm mt-0.5">{property.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(property.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Portal link */}
              <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700">Tenant Portal Link</span>
                </div>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-sm text-blue-600 font-mono bg-white border border-slate-200 rounded px-3 py-2 overflow-x-auto">
                    {portalBase}/{property.slug}
                  </code>
                  <button
                    onClick={() => copyPortalLink(property.slug, property.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0"
                  >
                    {copiedId === property.id ? (
                      <><Check className="w-4 h-4 text-green-500" /> Copied!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy</>
                    )}
                  </button>
                  <a
                    href={`/request/${property.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Share this link with your tenants. No account required to submit a request.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
