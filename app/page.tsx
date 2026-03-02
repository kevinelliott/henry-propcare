import Link from 'next/link'
import {
  Wrench, Building2, Users, DollarSign, Bell, ClipboardList,
  CheckCircle, ArrowRight, Star
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">PropCare</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Log in</Link>
            <Link href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
            <Star className="h-3.5 w-3.5" />
            Built for DIY landlords
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Stop losing track of<br />
            <span className="text-indigo-600">maintenance requests</span>
          </h1>
          <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
            PropCare centralizes your property maintenance — work orders, vendors, costs, and tenant requests — so nothing falls through the cracks.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 px-6 py-3 font-medium">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Everything in one place</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ClipboardList, title: 'Work Orders', desc: 'Create, assign, and track maintenance requests from open to completed.' },
              { icon: Users, title: 'Vendor Directory', desc: 'Keep all your contractors and vendors organized with contact info and trade.' },
              { icon: DollarSign, title: 'Cost Tracking', desc: 'Track estimated vs actual costs per work order and property.' },
              { icon: Bell, title: 'Tenant Portal', desc: 'Give tenants a simple link to submit maintenance requests without logging in.' },
              { icon: Building2, title: 'Property & Unit Management', desc: 'Manage multiple properties and units with full tenant assignment.' },
              { icon: Wrench, title: 'Preventive Maintenance', desc: 'Schedule recurring tasks like HVAC filter changes and never miss them again.' },
            ].map((f) => (
              <div key={f.title} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple pricing</h2>
          <p className="text-center text-gray-500 mb-12">No per-unit fees. Just flat monthly pricing.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-2xl p-8">
              <h3 className="text-lg font-semibold mb-2">Starter</h3>
              <div className="text-4xl font-bold mb-1">$29<span className="text-lg font-normal text-gray-500">/mo</span></div>
              <p className="text-gray-500 text-sm mb-6">Up to 5 properties</p>
              <ul className="space-y-3 mb-8">
                {['Up to 5 properties', 'Unlimited work orders', 'Vendor directory', 'Cost tracking', 'Email support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full text-center border border-indigo-600 text-indigo-600 py-2.5 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
                Get started
              </Link>
            </div>
            <div className="border-2 border-indigo-600 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-full">Most Popular</div>
              <h3 className="text-lg font-semibold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-1">$49<span className="text-lg font-normal text-gray-500">/mo</span></div>
              <p className="text-gray-500 text-sm mb-6">Unlimited properties</p>
              <ul className="space-y-3 mb-8">
                {['Unlimited properties', 'Tenant portal links', 'Preventive maintenance scheduler', 'Priority support', 'Everything in Starter'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full text-center bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 px-6 text-center text-gray-400 text-sm">
        &copy; 2026 PropCare. Built for landlords who care.
      </footer>
    </div>
  )
}
