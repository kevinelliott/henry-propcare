import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Building2, Plus, ChevronRight } from 'lucide-react'

export default async function PropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  // Get work order counts per property
  const propertyIds = properties?.map(p => p.id) || []
  const { data: workOrderCounts } = propertyIds.length > 0
    ? await supabase
        .from('work_orders')
        .select('property_id, status')
        .in('property_id', propertyIds)
        .neq('status', 'cancelled')
    : { data: [] }

  const openCountByProperty: Record<string, number> = {}
  workOrderCounts?.forEach(wo => {
    if (wo.status !== 'completed') {
      openCountByProperty[wo.property_id] = (openCountByProperty[wo.property_id] || 0) + 1
    }
  })

  const typeColors: Record<string, string> = {
    residential: 'bg-blue-100 text-blue-700',
    commercial: 'bg-purple-100 text-purple-700',
    multi_family: 'bg-green-100 text-green-700',
    vacation: 'bg-orange-100 text-orange-700',
  }

  return (
    <div className="pt-16 lg:pt-0 p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500 mt-1">Manage your rental properties</p>
        </div>
        <Link href="/dashboard/properties/new" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Property
        </Link>
      </div>

      {!properties?.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Building2 className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h2>
          <p className="text-gray-500 mb-6">Add your first rental property to get started tracking maintenance.</p>
          <Link href="/dashboard/properties/new" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" /> Add your first property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => {
            const openCount = openCountByProperty[property.id] || 0
            return (
              <div key={property.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-200 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[property.type] || 'bg-gray-100 text-gray-600'}`}>
                    {property.type?.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{property.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {property.address}
                  {property.city ? `, ${property.city}` : ''}
                  {property.state ? ` ${property.state}` : ''}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>{property.units_count || 1} unit{(property.units_count || 1) !== 1 ? 's' : ''}</span>
                  {openCount > 0 && (
                    <span className="text-orange-600 font-medium">{openCount} open order{openCount !== 1 ? 's' : ''}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/properties/${property.id}`}
                    className="flex-1 flex items-center justify-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-700 border border-indigo-200 rounded-lg py-2 hover:bg-indigo-50 transition-colors">
                    View <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link href={`/dashboard/work-orders/new?property=${property.id}`}
                    className="flex-1 flex items-center justify-center text-sm text-gray-700 font-medium border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors">
                    + Work Order
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
