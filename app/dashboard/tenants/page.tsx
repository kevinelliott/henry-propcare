import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { User, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import CopyPortalLink from '@/components/CopyPortalLink'

export default async function TenantsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tenants } = await supabase
    .from('tenants')
    .select('*, properties(name), units(unit_number)')
    .eq('user_id', user!.id)
    .order('name')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="pt-16 lg:pt-0 p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500 mt-1">Manage your tenants and their portal access</p>
        </div>
        <Link href="/dashboard/tenants/new" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Tenant
        </Link>
      </div>

      {!tenants?.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <User className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No tenants yet</h2>
          <p className="text-gray-500 mb-6">Add tenants to track their leases and share portal links for maintenance requests.</p>
          <Link href="/dashboard/tenants/new" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" /> Add your first tenant
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <div className="col-span-3">Tenant</div>
            <div className="col-span-2">Property / Unit</div>
            <div className="col-span-2">Contact</div>
            <div className="col-span-2">Lease</div>
            <div className="col-span-3">Portal Link</div>
          </div>
          <div className="divide-y divide-gray-50">
            {tenants.map((tenant: {
              id: string;
              name: string;
              email?: string;
              phone?: string;
              lease_start?: string;
              lease_end?: string;
              portal_token?: string;
              properties?: { name: string } | null;
              units?: { unit_number: string } | null;
            }) => (
              <div key={tenant.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-sm font-medium shrink-0">
                      {tenant.name[0].toUpperCase()}
                    </div>
                    <p className="font-medium text-gray-900 truncate">{tenant.name}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-700">{tenant.properties?.name || '—'}</p>
                  {tenant.units?.unit_number && (
                    <p className="text-xs text-gray-500">Unit {tenant.units.unit_number}</p>
                  )}
                </div>
                <div className="col-span-2">
                  {tenant.email && (
                    <a href={`mailto:${tenant.email}`} className="text-sm text-indigo-600 hover:text-indigo-700 block truncate">{tenant.email}</a>
                  )}
                  {tenant.phone && (
                    <a href={`tel:${tenant.phone}`} className="text-xs text-gray-500 hover:text-gray-900 block">{tenant.phone}</a>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-600">
                    {tenant.lease_start ? formatDate(tenant.lease_start) : '—'}
                  </p>
                  {tenant.lease_end && (
                    <p className="text-xs text-gray-400">to {formatDate(tenant.lease_end)}</p>
                  )}
                </div>
                <div className="col-span-3">
                  {tenant.portal_token ? (
                    <CopyPortalLink token={tenant.portal_token} appUrl={appUrl} />
                  ) : (
                    <span className="text-xs text-gray-400">No portal link</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
