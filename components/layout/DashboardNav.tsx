'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Building2, ClipboardList, Users, User,
  Calendar, Settings, Wrench, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/properties', icon: Building2, label: 'Properties' },
  { href: '/dashboard/work-orders', icon: ClipboardList, label: 'Work Orders' },
  { href: '/dashboard/vendors', icon: Users, label: 'Vendors' },
  { href: '/dashboard/tenants', icon: User, label: 'Tenants' },
  { href: '/dashboard/schedule', icon: Calendar, label: 'PM Schedule' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export default function DashboardNav({ user, profile }: { user: { id: string; email?: string }, profile: { full_name?: string; plan?: string } | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-indigo-600" />
          <span className="font-bold text-gray-900">PropCare</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200',
        'lg:translate-x-0 lg:flex',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">PropCare</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}>
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-sm font-medium">
              {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </>
  )
}
