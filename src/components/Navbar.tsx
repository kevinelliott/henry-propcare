"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Wrench } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Wrench className="w-6 h-6" />
            PropCare
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
              Features
            </Link>
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
              Pricing
            </Link>
            <Link href="/docs" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
              Docs
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm">
              Log in
            </Link>
            <Link href="/auth/login?signup=1" className="btn-primary text-sm">
              Get started free
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3">
          <Link href="/features" className="block text-slate-600 py-2">Features</Link>
          <Link href="/pricing" className="block text-slate-600 py-2">Pricing</Link>
          <Link href="/docs" className="block text-slate-600 py-2">Docs</Link>
          <Link href="/auth/login" className="block text-slate-600 py-2">Log in</Link>
          <Link href="/auth/login?signup=1" className="btn-primary w-full text-center text-sm">
            Get started free
          </Link>
        </div>
      )}
    </nav>
  );
}
