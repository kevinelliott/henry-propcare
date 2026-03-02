import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Building2, ArrowLeft, Plus, ClipboardList, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!property) notFound()

  const [
    { data: units },
    { data: workOrders },
    { data: schedules }
  ] = await Promise.all([
    supabase.from('units').select('*, tenants(name, email)').eq('property_id', id),
    supabase.from('work_orders').select('*, vendors(name)').eq('property_id', id).order('created_at', { ascending: false }),
    supabase.from('maintenance_schedules').select('*').eq('property_id', id).order('next_due', { ascending: true }),
  ])

  const totalCost = workOrders?.reduce((sum, wo) => sum + (wo.actual_cost || 0), 0) || 0
  const openCount = workOrders?.filter(wo => wo.status === 'open' || wo.status === 'in_progress').length || 0

  const statusColors: Record<string, string> = {
    open: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-600',
  }

  const priorityColors: Record<string, string> = {
    low: 'text-gray-500',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    urgent: 'text-red-600',
  }

  return (
    <div className="pt-16 lg:pt-0 p-6 lg:p-8 max-w-7xl">
      <div className="mb-6">
        <Link href="/dashboard/properties" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
              <p className="text-gray-500">
                {property.address}
                {property.city ? `, ${property.city}` : ''}
                {property.state ? ` ${property.state}` : ''}
                {property.zip ? ` ${property.zip}` : ''}
              </p>
            </div>
          </div>
          <Link href={`/dashboard/work-orders/new?property=${id}`}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" /> Work Order
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{units?.length || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Units</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{openCount}</div>
          <div className="text-sm text-gray-500 mt-1">Open Orders</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalCost)}</div>
          <div className="text-sm text-gray-500 mt-1">Total Spent</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Units */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Units</h2>
          </div>
          {!units?.length ? (
            <div className="p-8 text-center text-gray-400 text-sm">No units added yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {units.map((unit: {
                id: string;
                unit_number: string;
                bedrooms?: number;
                bathrooms?: number;
                rent_amount?: number;
                tenants?: Array<{ name: string; email?: string }>;
              }) => (
                <div key={unit.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Unit {unit.unit_number}</p>
                    <p className="text-xs text-gray-500">
                      {unit.bedrooms} bd / {unit.bathrooms} ba
                      {unit.rent_amount ? ` · ${formatCurrency(unit.rent_amount)}/mo` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    {unit.tenants && unit.tenants.length > 0 ? (
                      <p className="text-sm text-gray-700">{unit.tenants[0].name}</p>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Vacant</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PM Schedules */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">PM Schedule</h2>
            <Link href="/dashboard/schedule" className="text-xs text-indigo-600 hover:text-indigo-700">Manage</Link>
          </div>
          {!schedules?.length ? (
            <div className="p-8 text-center text-gray-400 text-sm">No schedules set</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {schedules.slice(0, 5).map((s: {
                id: string;
                task_name: string;
                next_due?: string;
                frequency_days: number;
              }) => {
                const isOverdue = s.next_due && new Date(s.next_due) < new Date()
                return (
                  <div key={s.id} className="p-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{s.task_name}</p>
                    <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                      {s.next_due ? (isOverdue ? 'Overdue' : `Due ${formatDate(s.next_due)}`) : 'No date set'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Work Orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Work Orders</h2>
          <Link href={`/dashboard/work-orders?property=${id}`} className="text-xs text-indigo-600 hover:text-indigo-700">
            Filter by property
          </Link>
        </div>
        {!workOrders?.length ? (
          <div className="p-12 text-center">
            <ClipboardList className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No work orders for this property</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {workOrders.map((wo: {
              id: string;
              title: string;
              priority: string;
              status: string;
              created_at: string;
              actual_cost?: number;
              vendors?: { name: string } | null;
            }) => (
              <Link key={wo.id} href={`/dashboard/work-orders/${wo.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{wo.title}</p>
                  <p className="text-xs text-gray-500">
                    {wo.vendors?.name ? `Vendor: ${wo.vendors.name}` : 'No vendor assigned'}
                    {' · '}{formatDate(wo.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {wo.actual_cost != null && (
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />{formatCurrency(wo.actual_cost)}
                    </span>
                  )}
                  <span className={`text-xs font-medium ${priorityColors[wo.priority] || 'text-gray-500'}`}>{wo.priority}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[wo.status] || 'bg-gray-100 text-gray-600'}`}>
                    {wo.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
