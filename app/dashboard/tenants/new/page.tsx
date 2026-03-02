'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'

type Property = { id: string; name: string }
type Unit = { id: string; unit_number: string }

export default function NewTenantPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [properties, setProperties] = useState<Property[]>([])
  const [units, setUnits] = useState<Unit[]>([])

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    property_id: '',
    unit_id: '',
    lease_start: '',
    lease_end: '',
  })

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('properties').select('id, name').order('name')
      setProperties(data || [])
    }
    load()
  }, [])

  useEffect(() => {
    if (!form.property_id) { setUnits([]); return }
    async function load() {
      const { data } = await supabase.from('units').select('id, unit_number').eq('property_id', form.property_id)
      setUnits(data || [])
    }
    load()
  }, [form.property_id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'property_id') updated.unit_id = ''
      return updated
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    const { error: insertError } = await supabase.from('tenants').insert({
      user_id: user.id,
      property_id: form.property_id,
      unit_id: form.unit_id || null,
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      lease_start: form.lease_start || null,
      lease_end: form.lease_end || null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push('/dashboard/tenants')
    }
  }

  return (
    <div className="pt-16 lg:pt-0 p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard/tenants" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Tenants
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Tenant</h1>
        <p className="text-gray-500 mt-1">Add a new tenant and assign them to a unit</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required
              placeholder="Jane Doe"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="tenant@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="(555) 555-5555"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease Start</label>
              <input name="lease_start" type="date" value={form.lease_start} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease End</label>
              <input name="lease_end" type="date" value={form.lease_end} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {loading ? 'Adding...' : 'Add Tenant'}
            </button>
            <Link href="/dashboard/tenants"
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
