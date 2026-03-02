import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, ClipboardList } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

type SearchParams = { status?: string; priority?: string; property?: string }

export default async function WorkOrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('work_orders')
    .select('*, properties(name, id), units(unit_number), vendors(name)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }
  if (params.priority && params.priority !== 'all') {
    query = query.eq('priority', params.priority)
  }
  if (params.property) {
    query = query.eq('property_id', params.property)
  }

  const { data: workOrders } = await query
  const { data: properties } = await supabase.from('properties').select('id, name').eq('user_id', user!.id)

  const statusColors: Record<string, string> = {
    open: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-600',
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  }

  const currentStatus = params.status || 'all'
  const currentPriority = params.priority || 'all'

  function buildUrl(updates: Partial<SearchParams>) {
    const p = { ...params, ...updates }
    const qs = Object.entries(p)
      .filter(([, v]) => v && v !== 'all')
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    return `/dashboard/work-orders${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="pt-16 lg:pt-0 p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-500 mt-1">{workOrders?.length || 0} orders</p>
        </div>
        <Link href="/dashboard/work-orders/new" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" /> New Work Order
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {['all', 'open', 'in_progress', 'completed', 'cancelled'].map(s => (
            <Link key={s} href={buildUrl({ status: s })}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentStatus === s ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {['all', 'urgent', 'high', 'medium', 'low'].map(p => (
            <Link key={p} href={buildUrl({ priority: p })}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentPriority === p ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {p === 'all' ? 'All Priority' : p.charAt(0).toUpperCase() + p.slice(1)}
            </Link>
          ))}
        </div>
        {properties && properties.length > 0 && (
          <select
            value={params.property || ''}
            onChange={(e) => { window.location.href = buildUrl({ property: e.target.value || undefined }) }}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Properties</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {!workOrders?.length ? (
          <div className="p-16 text-center">
            <ClipboardList className="h-14 w-14 text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No work orders found</h2>
            <p className="text-gray-500 mb-5">
              {currentStatus !== 'all' || currentPriority !== 'all'
                ? 'Try adjusting your filters.'
                : 'Create your first work order to get started.'}
            </p>
            <Link href="/dashboard/work-orders/new" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              <Plus className="h-4 w-4" /> New Work Order
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {workOrders.map((wo: {
              id: string;
              title: string;
              priority: string;
              status: string;
              category: string;
              created_at: string;
              actual_cost?: number;
              estimated_cost?: number;
              scheduled_date?: string;
              source: string;
              properties?: { name: string; id: string } | null;
              units?: { unit_number: string } | null;
              vendors?: { name: string } | null;
            }) => (
              <Link key={wo.id} href={`/dashboard/work-orders/${wo.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 truncate">{wo.title}</p>
                    {wo.source === 'tenant' && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded shrink-0">Tenant</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {wo.properties?.name}
                    {wo.units?.unit_number ? ` · Unit ${wo.units.unit_number}` : ''}
                    {wo.vendors?.name ? ` · ${wo.vendors.name}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400 capitalize">{wo.category}</span>
                  {wo.actual_cost != null ? (
                    <span className="text-sm text-gray-700">{formatCurrency(wo.actual_cost)}</span>
                  ) : wo.estimated_cost != null ? (
                    <span className="text-sm text-gray-400">est. {formatCurrency(wo.estimated_cost)}</span>
                  ) : null}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[wo.priority] || 'bg-gray-100 text-gray-600'}`}>
                    {wo.priority}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[wo.status] || 'bg-gray-100 text-gray-600'}`}>
                    {wo.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400 hidden md:block">{formatDate(wo.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
