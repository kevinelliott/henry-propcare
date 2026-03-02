'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle } from 'lucide-react'

type Tenant = {
  id: string
  name: string
  email?: string
  user_id: string
  property_id: string
  unit_id?: string
  units?: { unit_number: string } | null
  properties?: { name: string; address: string } | null
}

export default function TenantPortalForm({ token, tenant }: { token: string; tenant: Tenant | null }) {
  const [name, setName] = useState(tenant?.name || '')
  const [email, setEmail] = useState(tenant?.email || '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState('medium')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (tenant) {
      const { error: insertError } = await supabase.from('work_orders').insert({
        user_id: tenant.user_id,
        property_id: tenant.property_id,
        unit_id: tenant.unit_id || null,
        tenant_id: tenant.id,
        title,
        description: description || null,
        category,
        priority,
        status: 'open',
        source: 'tenant',
      })
      if (insertError) {
        setError('Failed to submit request. Please try again.')
        setLoading(false)
        return
      }
    } else {
      // No tenant found by token — still acknowledge gracefully
      setError('This portal link appears to be invalid. Please contact your landlord.')
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
        <p className="text-gray-500">Your maintenance request has been received. Your landlord will follow up with you soon.</p>
        <button
          onClick={() => { setSubmitted(false); setTitle(''); setDescription('') }}
          className="mt-6 text-indigo-600 text-sm font-medium hover:text-indigo-700">
          Submit another request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 space-y-5">
      {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g., Leaking kitchen faucet"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
          placeholder="Describe the issue in detail..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {['general', 'plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'landscaping'].map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
          <select value={priority} onChange={e => setPriority(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="low">Low — not urgent</option>
            <option value="medium">Medium — within a week</option>
            <option value="high">High — within 2 days</option>
            <option value="urgent">Urgent — today</option>
          </select>
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  )
}
