import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Wrench,
  CheckCircle,
  AlertCircle,
  Clock,
  Building2,
  Users,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";

const WORK_ORDERS_PREVIEW = [
  { id: 1, title: "Leaking faucet", property: "Oak St #4", status: "open", priority: "high", tenant: "J. Smith", created: "2h ago" },
  { id: 2, title: "HVAC not cooling", property: "Maple Ave #2", status: "in_progress", priority: "emergency", tenant: "A. Chen", created: "1d ago" },
  { id: 3, title: "Broken door lock", property: "Oak St #7", status: "in_progress", priority: "high", tenant: "M. Davis", created: "2d ago" },
  { id: 4, title: "Dishwasher repair", property: "Pine Ln #1", status: "resolved", priority: "medium", tenant: "R. Johnson", created: "5d ago" },
  { id: 5, title: "Clogged drain", property: "Maple Ave #5", status: "open", priority: "medium", tenant: "S. Lee", created: "6h ago" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    open: { label: "Open", cls: "badge-open" },
    in_progress: { label: "In Progress", cls: "badge-in-progress" },
    resolved: { label: "Resolved", cls: "badge-resolved" },
  };
  const s = map[status] || { label: status, cls: "badge-open" };
  return <span className={s.cls}>{s.label}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    emergency: "badge-emergency",
    high: "badge-high",
    medium: "badge-medium",
    low: "badge-low",
  };
  return <span className={map[priority] || "badge-low"}>{priority}</span>;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Save $261/mo vs AppFolio
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
              Stop managing repairs
              <br />
              <span className="text-blue-600">by text message</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              PropCare gives independent landlords a professional maintenance system — 
              tenant portal, work order tracking, and vendor management — at a price that makes sense.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login?signup=1" className="btn-primary text-base px-8 py-3">
                Start free — no credit card
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link href="/pricing" className="btn-secondary text-base px-8 py-3">
                View pricing
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-4">Free plan includes 1 property · $19/mo for 5 properties</p>
          </div>

          {/* Dashboard Preview */}
          <div className="max-w-4xl mx-auto">
            <div className="card overflow-hidden shadow-xl">
              {/* Mock browser bar */}
              <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 mx-4 bg-slate-700 rounded px-3 py-1 text-slate-400 text-xs font-mono">
                  app.propcare.io/dashboard/work-orders
                </div>
              </div>
              {/* Mock dashboard */}
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">Work Orders</h3>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">All</span>
                    <span className="px-3 py-1 text-slate-500 rounded-full text-xs">Open</span>
                    <span className="px-3 py-1 text-slate-500 rounded-full text-xs">In Progress</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="text-2xl font-bold text-slate-800">12</div>
                    <div className="text-xs text-slate-500">Open</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="text-2xl font-bold text-yellow-600">5</div>
                    <div className="text-xs text-slate-500">In Progress</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="text-2xl font-bold text-green-600">48</div>
                    <div className="text-xs text-slate-500">Resolved</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="text-left px-3 py-2 text-xs font-medium text-slate-500">Issue</th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 hidden sm:table-cell">Property</th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-slate-500">Status</th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 hidden md:table-cell">Priority</th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 hidden lg:table-cell">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {WORK_ORDERS_PREVIEW.map((wo) => (
                        <tr key={wo.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-2.5 font-medium text-slate-800">{wo.title}</td>
                          <td className="px-3 py-2.5 text-slate-600 hidden sm:table-cell">{wo.property}</td>
                          <td className="px-3 py-2.5"><StatusBadge status={wo.status} /></td>
                          <td className="px-3 py-2.5 hidden md:table-cell"><PriorityBadge priority={wo.priority} /></td>
                          <td className="px-3 py-2.5 text-slate-400 hidden lg:table-cell">{wo.created}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Sound familiar?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Most landlords manage repairs through scattered texts, missed calls, and sticky notes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <AlertCircle className="w-6 h-6 text-red-500" />,
                title: "Chaos in your inbox",
                desc: "Tenant texts buried in your personal messages. Repairs fall through the cracks. Tenants get frustrated.",
              },
              {
                icon: <Clock className="w-6 h-6 text-yellow-500" />,
                title: "No status visibility",
                desc: "You have no idea what's open, in progress, or resolved. Tenants keep asking 'did you get my message?'",
              },
              {
                icon: <Users className="w-6 h-6 text-orange-500" />,
                title: "Vendor confusion",
                desc: "Hunting through your phone contacts for the plumber. No record of who fixed what, when, or for how much.",
              },
            ].map((pain) => (
              <div key={pain.title} className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                  {pain.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{pain.title}</h3>
                <p className="text-slate-600">{pain.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Wrench />, title: "Tenant Request Portal", desc: "Each property gets a unique link. Tenants submit requests with photos, category, and priority — no app download required." },
              { icon: <BarChart3 />, title: "Work Order Dashboard", desc: "See all requests across all properties in one place. Filter by status, priority, or property." },
              { icon: <Users />, title: "Vendor Directory", desc: "Keep your plumbers, electricians, and handymen organized. Assign vendors to work orders with one click." },
              { icon: <Building2 />, title: "Multi-Property", desc: "Manage all your properties from a single dashboard. Each gets its own portal link to share with tenants." },
              { icon: <Shield />, title: "Repair History", desc: "Full audit trail per property. Know exactly what was repaired, when, by whom, and track patterns." },
              { icon: <Zap />, title: "REST API + MCP", desc: "Automate with our REST API or integrate AI agents via our MCP endpoint (Growth plan)." },
            ].map((f) => (
              <div key={f.title} className="card p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4 [&>svg]:w-5 [&>svg]:h-5">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              $19/mo vs $280/mo. You do the math.
            </h2>
            <p className="text-lg text-slate-600">
              AppFolio charges $280+/mo minimum. PropCare starts free.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-4 font-semibold text-slate-700">Feature</th>
                  <th className="text-center px-6 py-4 font-semibold text-blue-600">PropCare</th>
                  <th className="text-center px-6 py-4 font-semibold text-slate-400">AppFolio</th>
                  <th className="text-center px-6 py-4 font-semibold text-slate-400">Buildium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Starting price", "$0/mo", "$280/mo", "$55/mo"],
                  ["Maintenance tracking", "✅", "✅", "✅"],
                  ["Tenant portal", "✅", "✅", "✅"],
                  ["Vendor management", "✅ (Starter)", "✅", "✅"],
                  ["REST API", "✅ (Growth)", "❌", "✅"],
                  ["MCP / AI integration", "✅ (Growth)", "❌", "❌"],
                  ["Independent landlord pricing", "✅", "❌", "✅"],
                ].map(([feature, propcare, appfolio, buildium], i) => (
                  <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                    <td className="px-6 py-3.5 text-slate-700 font-medium">{feature}</td>
                    <td className="px-6 py-3.5 text-center text-blue-600 font-medium">{propcare}</td>
                    <td className="px-6 py-3.5 text-center text-slate-400">{appfolio}</td>
                    <td className="px-6 py-3.5 text-center text-slate-400">{buildium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-10">
            <Link href="/pricing" className="btn-primary text-base px-8 py-3">
              See all plans
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof / CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to get organized?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join landlords who&apos;ve replaced text message chaos with a professional maintenance system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login?signup=1" className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
              Start free today
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="/features" className="inline-flex items-center justify-center px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
              See all features
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12">
            {[
              { icon: <CheckCircle className="w-4 h-4 text-blue-300" />, text: "No credit card required" },
              { icon: <CheckCircle className="w-4 h-4 text-blue-300" />, text: "Free plan always available" },
              { icon: <CheckCircle className="w-4 h-4 text-blue-300" />, text: "Cancel anytime" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-blue-100 text-sm">
                {item.icon}
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
