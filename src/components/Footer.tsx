import Link from "next/link";
import { Wrench } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <Wrench className="w-5 h-5 text-blue-400" />
              PropCare
            </Link>
            <p className="text-sm text-slate-500">
              Property maintenance management for independent landlords.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:hello@propcare.app" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-600">Privacy Policy</span></li>
              <li><span className="text-slate-600">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-sm text-slate-600 text-center">
          © {new Date().getFullYear()} PropCare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
