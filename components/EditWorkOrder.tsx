'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type WorkOrder = {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  category: string
  vendor_id?: string
  estimated_cost?: number
  actual_cost?: number
  scheduled_date?: string
  completed_date?: string
}

type Property = { id: string; name: string }
type Vendor = { id: string; name: string; trade?: string }

const CATEGORIES = ['general', 'plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'landscaping', 'cleaning', 'other']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const STATUSES = ['open', 'in_progress', 'completed', 'cancelled']

export default function EditWorkOrder({
  workOrder,
  vendors,
}: {
  workOrder: WorkOrder
  properties: Property[]
  vendors: Vendor[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    title: workOrder.title || '',
    description: workOrder.description || '',
    status: workOrder.status || 'open',
    priority: workOrder.priority || 'medium',
    category: workOrder.category || 'general',
    vendor_id: workOrder.vendor_id || '',
    estimated_cost: workOrder.estimated_cost?.toString() || '',
    actual_cost: workOrder.actual_cost?.toString() || '',
    scheduled_date: workOrder.scheduled_date || '',
    completed_date: workOrder.completed_date || '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleStatusChange(newStatus: string) {
    setLoading(true)
    const updates: Record<string, string | null> = { status: newStatus }
    if (newStatus === 'completed' && !form.completed_date) {
      updates.completed_date = new Date().toISOString().split('T')[0]
      setForm(prev => ({ ...prev, status: newStatus, completed_date: updates.completed_date as string }))
    } else {
      setForm(prev => ({ ...prev, status: newStatus }))
    }
    await supabase.from('work_orders').update(updates).eq('id', workOrder.id)
    setLoading(false)
    router.refresh()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const { error: updateError } = await supabase.from('work_orders').update({
      title: form.title,
      description: form.description || null,
      status: form.status,
      priority: form.priority,
      category: form.category,
      vendor_id: form.vendor_id || null,
      estimated_cost: form.estimated_cost ? parseFloat(form.estimated_cost) : null,
      actual_cost: form.actual_cost ? parseFloat(form.actual_cost) : null,
      scheduled_date: form.scheduled_date || null,
      completed_date: form.completed_date || null,
    }).eq('id', workOrder.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess('Work order updated successfully')
      router.refresh()
    }
    setLoading(false)
  }

  const quickStatusButtons = [
    { status: 'open', label: 'Open', color: 'border-yellow-300 text-yellow-700 hover:bg-yellow-50' },
    { status: 'in_progress', label: 'In Progress', color: 'border-blue-300 text-blue-700 hover:bg-blue-50' },
    { status: 'completed', label: 'Complete', color: 'border-green-300 text-green-700 hover:bg-green-50' },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Edit Work Order</h2>

      {/* Quick status */}
      <div className="flex gap-2 mb-6 pb-6 border-b border-gray-100">
        <span className="text-sm text-gray-500 self-center mr-1">Quick status:</span>
        {quickStatusButtons.map(({ status, label, color }) => (
          <button key={status} onClick={() => handleStatusChange(status)} disabled={loading || form.status === status}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40 ${color}`}>
            {label}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4">{success}</div>}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input name="title" value={form.title} onChange={handleChange} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
            <input name="scheduled_date" type="date" value={form.scheduled_date} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Completed Date</label>
            <input name="completed_date" type="date" value={form.completed_date} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
