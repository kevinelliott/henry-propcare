import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Documentation</h1>
          <p className="text-xl text-slate-600 mb-12">REST API, MCP endpoint, and database schema.</p>

          {/* REST API */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">REST API v1</h2>
            <p className="text-slate-600 mb-6">
              Available on Growth plan. Authenticate with your API key in the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">Authorization</code> header.
            </p>

            <div className="space-y-6">
              {/* List work orders */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded">GET</span>
                  <code className="font-mono text-sm text-slate-800">/api/v1/work-orders</code>
                </div>
                <p className="text-slate-600 text-sm mb-4">List all work orders for your account. Supports filtering.</p>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-300 overflow-x-auto">
                  <pre>{`GET /api/v1/work-orders?status=open&property_id=xxx&limit=50
Authorization: Bearer YOUR_API_KEY

// Response
{
  "data": [
    {
      "id": "uuid",
      "property_id": "uuid",
      "unit": "4B",
      "category": "plumbing",
      "description": "Leaking faucet",
      "status": "open",
      "priority": "high",
      "tenant_name": "Jane Resident",
      "tenant_email": "jane@example.com",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}`}</pre>
                </div>
              </div>

              {/* Create work order */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded">POST</span>
                  <code className="font-mono text-sm text-slate-800">/api/v1/work-orders</code>
                </div>
                <p className="text-slate-600 text-sm mb-4">Create a new work order.</p>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-300 overflow-x-auto">
                  <pre>{`POST /api/v1/work-orders
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "property_id": "uuid",
  "unit": "4B",
  "category": "plumbing",
  "description": "Kitchen faucet dripping",
  "priority": "medium",
  "tenant_name": "Jane Resident",
  "tenant_email": "jane@example.com"
}`}</pre>
                </div>
              </div>

              {/* Update status */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded">PATCH</span>
                  <code className="font-mono text-sm text-slate-800">/api/v1/work-orders/:id</code>
                </div>
                <p className="text-slate-600 text-sm mb-4">Update a work order (status, vendor, notes).</p>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-300 overflow-x-auto">
                  <pre>{`PATCH /api/v1/work-orders/uuid
Authorization: Bearer YOUR_API_KEY

{
  "status": "in_progress",
  "vendor_id": "uuid",
  "notes": "Plumber scheduled for Thursday 2pm"
}`}</pre>
                </div>
              </div>

              {/* Delete */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded">DELETE</span>
                  <code className="font-mono text-sm text-slate-800">/api/v1/work-orders/:id</code>
                </div>
                <p className="text-slate-600 text-sm mb-4">Delete a work order.</p>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-300 overflow-x-auto">
                  <pre>{`DELETE /api/v1/work-orders/uuid
Authorization: Bearer YOUR_API_KEY

// Response: 204 No Content`}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* MCP Endpoint */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">MCP Endpoint</h2>
            <p className="text-slate-600 mb-6">
              Connect AI agents (Claude, GPT-4, etc.) directly to your maintenance data via the Model Context Protocol.
              Available on Growth plan.
            </p>
            <div className="card p-6 mb-6">
              <p className="text-sm text-slate-600 mb-4">
                <strong>Endpoint:</strong>{" "}
                <code className="bg-slate-100 px-2 py-0.5 rounded font-mono">POST /api/mcp</code>
              </p>
              <p className="text-sm text-slate-600 mb-6">
                <strong>Auth:</strong> Pass your API key as <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">Authorization: Bearer YOUR_KEY</code>
              </p>

              <h4 className="font-semibold text-slate-800 mb-3">Available Tools</h4>
              <div className="space-y-3">
                {[
                  { name: "list_work_orders", desc: "List work orders with optional status/property filters", params: "status?, property_id?, limit?" },
                  { name: "create_work_order", desc: "Create a new work order", params: "property_id, category, description, tenant_name, tenant_email, priority?" },
                  { name: "update_status", desc: "Update a work order's status", params: "work_order_id, status, notes?" },
                  { name: "list_properties", desc: "List all your properties", params: "none" },
                  { name: "get_stats", desc: "Get dashboard statistics", params: "none" },
                ].map((tool) => (
                  <div key={tool.name} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="font-mono text-sm font-semibold text-blue-700 mb-1">{tool.name}</div>
                    <div className="text-sm text-slate-600 mb-1">{tool.desc}</div>
                    <div className="text-xs text-slate-400">Params: {tool.params}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-300 overflow-x-auto">
              <pre>{`// Example MCP call
POST /api/mcp
Authorization: Bearer YOUR_API_KEY

{
  "tool": "list_work_orders",
  "params": {
    "status": "open",
    "limit": 10
  }
}

// Response
{
  "result": {
    "work_orders": [...],
    "count": 3
  }
}`}</pre>
            </div>
          </section>

          {/* DB Schema */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Database Schema</h2>
            <p className="text-slate-600 mb-6">PropCare uses Supabase (PostgreSQL) with row-level security.</p>

            <div className="space-y-6">
              {[
                {
                  table: "profiles",
                  desc: "One row per user. Stores plan and Stripe customer ID.",
                  cols: [
                    { name: "id", type: "uuid", note: "PK" },
                    { name: "user_id", type: "uuid", note: "FK → auth.users" },
                    { name: "plan", type: "text", note: "free | starter | growth" },
                    { name: "stripe_customer_id", type: "text", note: "nullable" },
                    { name: "created_at", type: "timestamptz", note: "" },
                  ],
                },
                {
                  table: "properties",
                  desc: "Properties owned by the landlord.",
                  cols: [
                    { name: "id", type: "uuid", note: "PK" },
                    { name: "landlord_id", type: "uuid", note: "FK → auth.users" },
                    { name: "name", type: "text", note: "" },
                    { name: "address", type: "text", note: "" },
                    { name: "slug", type: "text", note: "unique, used in tenant portal URL" },
                    { name: "created_at", type: "timestamptz", note: "" },
                  ],
                },
                {
                  table: "work_orders",
                  desc: "Maintenance requests/work orders.",
                  cols: [
                    { name: "id", type: "uuid", note: "PK" },
                    { name: "property_id", type: "uuid", note: "FK → properties" },
                    { name: "unit", type: "text", note: "nullable" },
                    { name: "category", type: "text", note: "plumbing | electrical | hvac | appliance | structural | pest | cleaning | other" },
                    { name: "description", type: "text", note: "" },
                    { name: "status", type: "text", note: "open | in_progress | resolved | cancelled" },
                    { name: "priority", type: "text", note: "low | medium | high | emergency" },
                    { name: "vendor_id", type: "uuid", note: "FK → vendors, nullable" },
                    { name: "tenant_name", type: "text", note: "" },
                    { name: "tenant_email", type: "text", note: "" },
                    { name: "notes", type: "text", note: "nullable" },
                    { name: "created_at", type: "timestamptz", note: "" },
                    { name: "resolved_at", type: "timestamptz", note: "nullable" },
                  ],
                },
                {
                  table: "vendors",
                  desc: "Vendor directory per landlord.",
                  cols: [
                    { name: "id", type: "uuid", note: "PK" },
                    { name: "landlord_id", type: "uuid", note: "FK → auth.users" },
                    { name: "name", type: "text", note: "" },
                    { name: "specialty", type: "text", note: "" },
                    { name: "phone", type: "text", note: "nullable" },
                    { name: "email", type: "text", note: "nullable" },
                    { name: "active", type: "boolean", note: "default true" },
                    { name: "created_at", type: "timestamptz", note: "" },
                  ],
                },
              ].map((t) => (
                <div key={t.table} className="card overflow-hidden">
                  <div className="bg-slate-800 px-5 py-3 flex items-center justify-between">
                    <code className="text-white font-bold font-mono">{t.table}</code>
                    <span className="text-slate-400 text-sm">{t.desc}</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-5 py-2 text-xs font-medium text-slate-500">Column</th>
                        <th className="text-left px-5 py-2 text-xs font-medium text-slate-500">Type</th>
                        <th className="text-left px-5 py-2 text-xs font-medium text-slate-500">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.cols.map((c) => (
                        <tr key={c.name} className="border-b border-slate-100">
                          <td className="px-5 py-2 font-mono text-blue-700">{c.name}</td>
                          <td className="px-5 py-2 text-slate-500">{c.type}</td>
                          <td className="px-5 py-2 text-slate-400">{c.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </section>

          {/* Admin endpoint */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Endpoint</h2>
            <p className="text-slate-600 mb-4">Internal stats endpoint protected by a secret key.</p>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-300">
              <pre>{`GET /api/admin?secret=YOUR_ADMIN_SECRET

// Response
{
  "users": 142,
  "properties": 387,
  "workOrders": 2841,
  "openWorkOrders": 93
}`}</pre>
            </div>
          </section>

          {/* Cron */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Cron: Daily Alerts</h2>
            <p className="text-slate-600 mb-4">
              The <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">/api/cron/send-alerts</code> endpoint
              is called daily by Vercel Cron. It sends a digest of open work orders to landlords on Starter+ plans.
              Secured with Vercel Cron secret headers.
            </p>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-300">
              <pre>{`// vercel.json cron config
{
  "crons": [{
    "path": "/api/cron/send-alerts",
    "schedule": "0 8 * * *"
  }]
}`}</pre>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
