import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Wrench,
  Building2,
  Users,
  Bell,
  BarChart3,
  Link as LinkIcon,
  Shield,
  Download,
  Zap,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: <LinkIcon className="w-6 h-6" />,
    title: "Tenant Request Portal",
    description:
      "Every property gets a unique URL. Tenants submit maintenance requests with title, description, category (plumbing/HVAC/electrical/etc.), priority level, and their contact info — no account needed.",
    badge: "All plans",
    color: "blue",
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    title: "Work Order Tracking",
    description:
      "Every request becomes a tracked work order with status (Open → In Progress → Resolved), notes, and a complete history. Tenants can check their request status with their work order ID.",
    badge: "All plans",
    color: "blue",
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: "Multi-Property Dashboard",
    description:
      "View all work orders across all your properties in one unified dashboard. Filter by property, status, priority, or category. Never lose track of an open request.",
    badge: "All plans",
    color: "blue",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Vendor Directory",
    description:
      "Keep all your vendors (plumbers, electricians, handymen) organized. Assign them to work orders directly from the dashboard. Track which vendor handled what.",
    badge: "Starter+",
    color: "green",
  },
  {
    icon: <Bell className="w-6 h-6" />,
    title: "Email Alerts",
    description:
      "Get a daily digest of new and open work orders. Landlords are notified of new requests automatically. No more checking manually — let PropCare come to you.",
    badge: "Starter+",
    color: "green",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Repair History & Analytics",
    description:
      "Full audit trail per property and unit. See patterns: which unit has the most issues, which category is most common. Use data to plan preventive maintenance.",
    badge: "All plans",
    color: "blue",
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: "CSV Export",
    description:
      "Export your complete work order history as CSV for tax records, property management reports, or your own analysis. Works across all properties or filtered by date/property.",
    badge: "Growth",
    color: "purple",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "REST API",
    description:
      "Full CRUD API for work orders, properties, and vendors. Integrate PropCare with your existing tools — property management software, spreadsheets, or custom automations.",
    badge: "Growth",
    color: "purple",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "MCP Endpoint",
    description:
      "Connect AI agents directly to your maintenance data via our Model Context Protocol endpoint. Let Claude, GPT-4, or other AI assistants query and manage work orders for you.",
    badge: "Growth",
    color: "purple",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
};

const badgeColorMap: Record<string, string> = {
  "All plans": "bg-blue-100 text-blue-700",
  "Starter+": "bg-green-100 text-green-700",
  Growth: "bg-purple-100 text-purple-700",
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              Everything you need to manage repairs
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Built specifically for independent landlords who need professional tools
              without enterprise pricing.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[f.color]}`}>
                    {f.icon}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeColorMap[f.badge]}`}>
                    {f.badge}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm">{f.description}</p>
              </div>
            ))}
          </div>

          {/* Tenant Portal spotlight */}
          <div className="card p-8 bg-gradient-to-br from-blue-50 to-white mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  ✨ Tenant experience
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Your tenants don&apos;t need an app
                </h2>
                <p className="text-slate-600 mb-4">
                  Share a simple link like <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-600 font-mono text-sm">propcare.io/request/oak-st-apts</code> and 
                  your tenants can submit requests from any browser — no signup, no password, no app download.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  {[
                    "Tenant submits request with photo + details",
                    "You get notified immediately",
                    "Tenant can track status with their work order ID",
                    "You close it when resolved",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="text-xs font-medium text-slate-500 mb-3">Tenant Request Form</div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Your name</div>
                    <div className="bg-slate-100 rounded px-3 py-2 text-sm text-slate-600">Jane Resident</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Category</div>
                    <div className="bg-slate-100 rounded px-3 py-2 text-sm text-slate-600">Plumbing</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Description</div>
                    <div className="bg-slate-100 rounded px-3 py-2 text-sm text-slate-600">Kitchen faucet is dripping...</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Priority</div>
                    <div className="flex gap-2">
                      {["Low", "Medium", "High"].map((p) => (
                        <span key={p} className={`px-2.5 py-1 rounded-full text-xs border ${p === "Medium" ? "bg-yellow-100 border-yellow-200 text-yellow-700 font-medium" : "border-slate-200 text-slate-500"}`}>{p}</span>
                      ))}
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium">
                    Submit Request →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to try it?</h2>
            <p className="text-slate-600 mb-8">Start free. No credit card required.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login?signup=1" className="btn-primary text-base px-8 py-3">
                Get started free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link href="/pricing" className="btn-secondary text-base px-8 py-3">
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
