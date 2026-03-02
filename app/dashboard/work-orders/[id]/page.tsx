import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import EditWorkOrder from '@/components/EditWorkOrder'

export default async function WorkOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: workOrder } = await supabase
    .from('work_orders')
    .select('*, properties(id, name), units(id, unit_number), tenants(id, name, email, phone), vendors(id, name, phone, email, trade)')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!workOrder) notFound()

  const [{ data: properties }, { data: vendors }] = await Promise.all([
    supabase.from('properties').select('id, name').eq('user_id', user!.id),
    supabase.from('vendors').select('id, name, trade').eq('user_id', user!.id),
  ])

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

  return (
    <div className="pt-16 lg:pt-0 p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard/work-orders" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Work Orders
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workOrder.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[workOrder.status] || 'bg-gray-100 text-gray-600'}`}>
                {workOrder.status.replace('_', ' ')}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[workOrder.priority] || 'bg-gray-100 text-gray-600'}`}>
                {workOrder.priority} priority
              </span>
              {workOrder.source === 'tenant' && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Tenant Request</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-6">
          {workOrder.description && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{workOrder.description}</p>
            </div>
          )}

          <EditWorkOrder workOrder={workOrder} properties={properties || []} vendors={vendors || []} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500 mb-0.5">Property</dt>
                <dd className="text-sm font-medium text-gray-900">
                  <Link href={`/dashboard/properties/${workOrder.properties?.id}`} className="hover:text-indigo-600">
                    {workOrder.properties?.name || '—'}
                  </Link>
                </dd>
              </div>
              {workOrder.units && (
                <div>
                  <dt className="text-xs text-gray-500 mb-0.5">Unit</dt>
                  <dd className="text-sm font-medium text-gray-900">Unit {workOrder.units.unit_number}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500 mb-0.5">Category</dt>
                <dd className="text-sm font-medium text-gray-900 capitalize">{workOrder.category}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-0.5">Created</dt>
                <dd className="text-sm font-medium text-gray-900">{formatDate(workOrder.created_at)}</dd>
              </div>
              {workOrder.scheduled_date && (
                <div>
                  <dt className="text-xs text-gray-500 mb-0.5">Scheduled</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatDate(workOrder.scheduled_date)}</dd>
                </div>
              )}
              {workOrder.completed_date && (
                <div>
                  <dt className="text-xs text-gray-500 mb-0.5">Completed</dt>
                  <dd className="text-sm font-medium text-gray-900">{formatDate(workOrder.completed_date)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Costs */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Costs</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-gray-500 mb-0.5">Estimated</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {workOrder.estimated_cost != null ? formatCurrency(workOrder.estimated_cost) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-0.5">Actual</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {workOrder.actual_cost != null ? formatCurrency(workOrder.actual_cost) : '—'}
                </dd>
              </div>
              {workOrder.estimated_cost != null && workOrder.actual_cost != null && (
                <div>
                  <dt className="text-xs text-gray-500 mb-0.5">Variance</dt>
                  <dd className={`text-sm font-medium ${workOrder.actual_cost > workOrder.estimated_cost ? 'text-red-600' : 'text-green-600'}`}>
                    {workOrder.actual_cost > workOrder.estimated_cost ? '+' : ''}
                    {formatCurrency(workOrder.actual_cost - workOrder.estimated_cost)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Tenant */}
          {workOrder.tenants && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Tenant</h3>
              <p className="text-sm font-medium text-gray-900 mb-1">{workOrder.tenants.name}</p>
              {workOrder.tenants.email && (
                <a href={`mailto:${workOrder.tenants.email}`} className="text-sm text-indigo-600 hover:text-indigo-700 block mb-1">
                  {workOrder.tenants.email}
                </a>
              )}
              {workOrder.tenants.phone && (
                <a href={`tel:${workOrder.tenants.phone}`} className="text-sm text-gray-600 hover:text-gray-900 block">
                  {workOrder.tenants.phone}
                </a>
              )}
            </div>
          )}

          {/* Vendor */}
          {workOrder.vendors && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Vendor</h3>
              <p className="text-sm font-medium text-gray-900 mb-1">{workOrder.vendors.name}</p>
              {workOrder.vendors.trade && (
                <p className="text-xs text-gray-500 mb-2 capitalize">{workOrder.vendors.trade}</p>
              )}
              {workOrder.vendors.phone && (
                <a href={`tel:${workOrder.vendors.phone}`} className="text-sm text-indigo-600 hover:text-indigo-700 block mb-1">
                  {workOrder.vendors.phone}
                </a>
              )}
              {workOrder.vendors.email && (
                <a href={`mailto:${workOrder.vendors.email}`} className="text-sm text-gray-600 hover:text-gray-900 block">
                  {workOrder.vendors.email}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
