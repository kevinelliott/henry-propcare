import { createClient } from '@/lib/supabase/server'
import TenantPortalForm from '@/components/TenantPortalForm'
import { Wrench } from 'lucide-react'

export default async function TenantPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // Find tenant by portal token
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*, units(unit_number), properties(name, address)')
    .eq('portal_token', token)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Wrench className="h-5 w-5 text-indigo-600" />
          <span className="font-bold text-gray-900">PropCare</span>
          {tenant?.properties?.name && (
            <span className="text-gray-400 text-sm ml-2">— {tenant.properties.name}</span>
          )}
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit a Maintenance Request</h1>
        {tenant ? (
          <p className="text-gray-500 mb-8">
            Hi {tenant.name}! Submit a request for {tenant.properties?.name}
            {tenant.units?.unit_number ? `, Unit ${tenant.units.unit_number}` : ''}.
          </p>
        ) : (
          <p className="text-gray-500 mb-8">Fill out the form below to submit a maintenance request.</p>
        )}
        <TenantPortalForm token={token} tenant={tenant} />
      </div>
    </div>
  )
}
