import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Building2, ClipboardList, DollarSign, AlertCircle, Plus, ArrowRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: properties },
    { data: workOrders },
    { data: openOrders },
    { data: schedules }
  ] = await Promise.all([
    supabase.from('properties').select('*').eq('user_id', user!.id),
    supabase.from('work_orders').select('*, properties(name), units(unit_number)').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('work_orders').select('actual_cost, estimated_cost').eq('user_id', user!.id).eq('status', 'open'),
    supabase.from('maintenance_schedules').select('*').eq('user_id', user!.id).lte('next_due', new Date().toISOString().split('T')[0]),
  ])

  const totalCost = openOrders?.reduce((sum, o) => sum + (o.actual_cost || 0), 0) || 0

  const stats = [
    { label: 'Properties', value: properties?.length || 0, icon: Building2 },
    { label: 'Open Work Orders', value: openOrders?.length || 0, icon: ClipboardList },
    { label: 'Open Orders Cost', value: formatCurrency(totalCost), icon: DollarSign },
    { label: 'Overdue PM Tasks', value: schedules?.length || 0, icon: AlertCircle },
  ]

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your properties and maintenance</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/properties/new" className="hidden sm:flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Plus className="h-4 w-4" /> Property
          </Link>
          <Link href="/dashboard/work-orders/new" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" /> Work Order
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <stat.icon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Work Orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Work Orders</h2>
          <Link href="/dashboard/work-orders" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {!workOrders?.length ? (
          <div className="p-12 text-center">
            <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No work orders yet</p>
            <Link href="/dashboard/work-orders/new" className="mt-3 inline-flex items-center gap-2 text-indigo-600 text-sm font-medium">
              <Plus className="h-4 w-4" /> Create first work order
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {workOrders.map((wo: {
              id: string;
              title: string;
              priority: string;
              status: string;
              created_at: string;
              properties: { name: string } | null;
              units: { unit_number: string } | null;
            }) => (
              <Link key={wo.id} href={`/dashboard/work-orders/${wo.id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{wo.title}</p>
                  <p className="text-sm text-gray-500">
                    {wo.properties?.name}
                    {wo.units?.unit_number ? ` · Unit ${wo.units.unit_number}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-medium ${priorityColors[wo.priority] || 'text-gray-500'}`}>{wo.priority}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[wo.status] || 'bg-gray-100 text-gray-600'}`}>
                    {wo.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(wo.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
