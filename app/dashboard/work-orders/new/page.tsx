'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'

const CATEGORIES = ['general', 'plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'landscaping', 'cleaning', 'other']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const STATUSES = ['open', 'in_progress', 'completed', 'cancelled']

type Property = { id: string; name: string }
type Unit = { id: string; unit_number: string }
type Tenant = { id: string; name: string }
type Vendor = { id: string; name: string; trade?: string }

function NewWorkOrderForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [properties, setProperties] = useState<Property[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])

  const [form, setForm] = useState({
    title: '',
    description: '',
    property_id: searchParams.get('property') || '',
    unit_id: '',
    tenant_id: '',
    vendor_id: '',
    category: 'general',
    priority: 'medium',
    status: 'open',
    estimated_cost: '',
    actual_cost: '',
    scheduled_date: '',
  })

  useEffect(() => {
    async function load() {
      const { data: props } = await supabase.from('properties').select('id, name').order('name')
      setProperties(props || [])
      const { data: vends } = await supabase.from('vendors').select('id, name, trade').order('name')
      setVendors(vends || [])
    }
    load()
  }, [])

  useEffect(() => {
    if (!form.property_id) { setUnits([]); setTenants([]); return }
    async function loadUnits() {
      const { data } = await supabase.from('units').select('id, unit_number').eq('property_id', form.property_id)
      setUnits(data || [])
    }
    async function loadTenants() {
      const { data } = await supabase.from('tenants').select('id, name').eq('property_id', form.property_id)
      setTenants(data || [])
    }
    loadUnits()
    loadTenants()
  }, [form.property_id])

  useEffect(() => {
    if (!form.unit_id) { return }
    async function loadUnitTenants() {
      const { data } = await supabase.from('tenants').select('id, name').eq('unit_id', form.unit_id)
      if (data && data.length > 0) setTenants(data)
    }
    loadUnitTenants()
  }, [form.unit_id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'property_id') { updated.unit_id = ''; updated.tenant_id = '' }
      if (name === 'unit_id') { updated.tenant_id = '' }
      return updated
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    const { error: insertError } = await supabase.from('work_orders').insert({
      user_id: user.id,
      property_id: form.property_id,
      unit_id: form.unit_id || null,
      tenant_id: form.tenant_id || null,
      vendor_id: form.vendor_id || null,
      title: form.title,
      description: form.description || null,
      category: form.category,
      priority: form.priority,
      status: form.status,
      estimated_cost: form.estimated_cost ? parseFloat(form.estimated_cost) : null,
      actual_cost: form.actual_cost ? parseFloat(form.actual_cost) : null,
      scheduled_date: form.scheduled_date || null,
      source: 'landlord',
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push('/dashboard/work-orders')
    }
  }

  return (
    <div className="pt-16 lg:pt-0 p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard/work-orders" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Work Orders
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Work Order</h1>
        <p className="text-gray-500 mt-1">Create a new maintenance work order</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required
              placeholder="e.g., Fix leaking kitchen faucet"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Describe the issue or work needed..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
            <select name="property_id" value={form.property_id} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select a property</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {units.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select name="unit_id" value={form.unit_id} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">No specific unit</option>
                {units.map(u => <option key={u.id} value={u.id}>Unit {u.unit_number}</option>)}
              </select>
            </div>
          )}

          {tenants.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
              <select name="tenant_id" value={form.tenant_id} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">No tenant</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Vendor</label>
            <select name="vendor_id" value={form.vendor_id} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">No vendor assigned</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}{v.trade ? ` (${v.trade})` : ''}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost ($)</label>
              <input name="estimated_cost" type="number" min="0" step="0.01" value={form.estimated_cost} onChange={handleChange}
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual Cost ($)</label>
              <input name="actual_cost" type="number" min="0" step="0.01" value={form.actual_cost} onChange={handleChange}
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
            <input name="scheduled_date" type="date" value={form.scheduled_date} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {loading ? 'Creating...' : 'Create Work Order'}
            </button>
            <Link href="/dashboard/work-orders"
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewWorkOrderPage() {
  return (
    <Suspense fallback={<div className="pt-16 lg:pt-0 p-6 lg:p-8">Loading...</div>}>
      <NewWorkOrderForm />
    </Suspense>
  )
}
