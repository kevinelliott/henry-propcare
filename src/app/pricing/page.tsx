import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Zap } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for your first rental property",
    cta: "Start free",
    href: "/auth/login?signup=1",
    highlight: false,
    features: [
      "1 property",
      "10 work orders/month",
      "Tenant request portal",
      "Basic work order tracking",
      "Vendor directory (read-only)",
    ],
    missing: ["Email alerts", "CSV export", "API access", "Unlimited work orders"],
  },
  {
    name: "Starter",
    price: 19,
    period: "/month",
    description: "For landlords growing their portfolio",
    cta: "Start Starter",
    href: "/auth/login?signup=1&plan=starter",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Up to 5 properties",
      "Unlimited work orders",
      "Tenant request portal",
      "Email alerts (daily digest)",
      "Vendor directory (full)",
      "Work order history",
      "Status tracking for tenants",
    ],
    missing: ["CSV export", "API access", "MCP endpoint"],
  },
  {
    name: "Growth",
    price: 49,
    period: "/month",
    description: "For serious landlords who want automation",
    cta: "Start Growth",
    href: "/auth/login?signup=1&plan=growth",
    highlight: false,
    features: [
      "Unlimited properties",
      "Everything in Starter",
      "CSV export",
      "REST API access",
      "MCP endpoint (AI agents)",
      "Priority email support",
      "Advanced analytics",
    ],
    missing: [],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Save $261/mo vs AppFolio
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Start free. Upgrade when you need more. Cancel anytime.
              No setup fees, no per-unit fees.
            </p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border-2 p-8 relative ${
                  plan.highlight
                    ? "border-blue-600 shadow-xl shadow-blue-100"
                    : "border-slate-200"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">
                      ${plan.price}
                    </span>
                    <span className="text-slate-500">{plan.period}</span>
                  </div>
                </div>

                <Link
                  href={plan.href}
                  className={`block text-center py-3 px-6 rounded-xl font-semibold mb-8 transition-colors ${
                    plan.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{f}</span>
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-400">
                      <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-center">—</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Comparison vs AppFolio */}
          <div className="card p-8 bg-slate-50">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              How does PropCare compare?
            </h2>
            <p className="text-slate-600 text-center mb-8">
              AppFolio requires a minimum of 50 units and charges $280+/mo.
              Buildium charges $55/mo just to start. PropCare is built for independent landlords.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              {[
                { name: "PropCare Growth", price: "$49/mo", units: "Unlimited", note: "Best for independents" },
                { name: "AppFolio", price: "$280+/mo", units: "50 unit minimum", note: "Enterprise focus" },
                { name: "Buildium", price: "$55/mo", units: "Limited features", note: "Dated UI" },
              ].map((c) => (
                <div key={c.name} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="font-bold text-slate-900 mb-1">{c.name}</div>
                  <div className="text-2xl font-extrabold text-blue-600 mb-1">{c.price}</div>
                  <div className="text-sm text-slate-600 mb-1">{c.units}</div>
                  <div className="text-xs text-slate-400">{c.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">FAQ</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                { q: "Can I upgrade or downgrade at any time?", a: "Yes. Changes take effect at your next billing cycle. You can also cancel at any time with no penalty." },
                { q: "What counts as a 'work order'?", a: "Each maintenance request submitted through a tenant portal is one work order. You can have as many work order entries as needed within your plan limits." },
                { q: "Do tenants need to create accounts?", a: "No. Your tenants just use the unique link for their property. No sign-up required." },
                { q: "Is there a per-unit fee?", a: "No per-unit fees, ever. PropCare charges a flat monthly rate based on the number of properties, not units." },
              ].map((item) => (
                <div key={item.q} className="card p-6">
                  <h3 className="font-semibold text-slate-900 mb-2">{item.q}</h3>
                  <p className="text-slate-600 text-sm">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
