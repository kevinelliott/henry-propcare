'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Plus, X, AlertTriangle, Clock, CheckCircle, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type Schedule = {
  id: string
  task_name: string
  category?: string
  frequency_days: number
  last_completed?: string
  next_due?: string
  notes?: string
  property_id: string
  properties?: { name: string }
}

type Property = { id: string; name: string }

const CATEGORIES = ['General', 'HVAC', 'Plumbing', 'Electrical', 'Landscaping', 'Safety', 'Cleaning', 'Structural', 'Appliance']
const COMMON_TASKS = [
  { name: 'HVAC Filter Change', category: 'HVAC', frequency_days: 90 },
  { name: 'Smoke Detector Test', category: 'Safety', frequency_days: 180 },
  { name: 'Gutter Cleaning', category: 'Landscaping', frequency_days: 180 },
  { name: 'Fire Extinguisher Check', category: 'Safety', frequency_days: 365 },
  { name: 'Annual HVAC Service', category: 'HVAC', frequency_days: 365 },
  { name: 'Roof Inspection', category: 'Structural', frequency_days: 365 },
]

function getDueStatus(nextDue?: string) {
  if (!nextDue) return 'none'
  const due = new Date(nextDue)
  const today = new Date()
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 14) return 'soon'
  return 'ok'
}

export default function SchedulePage() {
  const supabase = createClient()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    task_name: '',
    category: '',
    property_id: '',
    frequency_days: '90',
    last_completed: '',
    next_due: '',
    notes: '',
  })

  async function loadData() {
    const [{ data: scheds }, { data: props }] = await Promise.all([
      supabase.from('maintenance_schedules').select('*, properties(name)').order('next_due', { ascending: true }),
      supabase.from('properties').select('id, name').order('name'),
    ])
    setSchedules(scheds || [])
    setProperties(props || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: value }
      // Auto-calculate next_due from last_completed + frequency
      if ((name === 'last_completed' || name === 'frequency_days') && updated.last_completed && updated.frequency_days) {
        const d = new Date(updated.last_completed)
        d.setDate(d.getDate() + parseInt(updated.frequency_days))
        updated.next_due = d.toISOString().split('T')[0]
      }
      return updated
    })
  }

  function applyTemplate(task: typeof COMMON_TASKS[0]) {
    setForm(prev => ({
      ...prev,
      task_name: task.name,
      category: task.category,
      frequency_days: task.frequency_days.toString(),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setFormLoading(false); return }

    const { error: insertError } = await supabase.from('maintenance_schedules').insert({
      user_id: user.id,
      property_id: form.property_id,
      task_name: form.task_name,
      category: form.category || null,
      frequency_days: parseInt(form.frequency_days),
      last_completed: form.last_completed || null,
      next_due: form.next_due || null,
      notes: form.notes || null,
    })

    if (insertError) {
      setError(insertError.message)
      setFormLoading(false)
    } else {
      setShowModal(false)
      setFormLoading(false)
      loadData()
    }
  }

  async function markCompleted(id: string) {
    const today = new Date().toISOString().split('T')[0]
    const sched = schedules.find(s => s.id === id)
    if (!sched) return
    const nextDue = new Date()
    nextDue.setDate(nextDue.getDate() + sched.frequency_days)
    await supabase.from('maintenance_schedules').update({
      last_completed: today,
      next_due: nextDue.toISOString().split('T')[0],
    }).eq('id', id)
    loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this schedule?')) return
    await supabase.from('maintenance_schedules').delete().eq('id', id)
    loadData()
  }

  const dueStatusConfig = {
    overdue: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', label: 'Overdue' },
    soon: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Due soon' },
    ok: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'On track' },
    none: { icon: Calendar, color: 'text-gray-400', bg: 'bg-gray-50', label: 'No date' },
  }

  const openModal = () => {
    setForm({ task_name: '', category: '', property_id: '', frequency_days: '90', last_completed: '', next_due: '', notes: '' })
    setError('')
    setShowModal(true)
  }

  return (
    <div className="pt-16 lg:pt-0 p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Preventive Maintenance</h1>
          <p className="text-gray-500 mt-1">Schedule recurring maintenance tasks</p>
        </div>
        <button onClick={openModal} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Task
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : !schedules.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Calendar className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No maintenance schedules</h2>
          <p className="text-gray-500 mb-6">Set up recurring tasks like HVAC filter changes to stay on top of preventive maintenance.</p>
          <button onClick={openModal} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" /> Add your first task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(sched => {
            const status = getDueStatus(sched.next_due)
            const cfg = dueStatusConfig[status]
            const Icon = cfg.icon
            return (
              <div key={sched.id} className={`bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-5`}>
                <div className={`w-10 h-10 ${cfg.bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-gray-900">{sched.task_name}</p>
                    {sched.category && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{sched.category}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {sched.properties?.name} · Every {sched.frequency_days} days
                    {sched.last_completed ? ` · Last done: ${formatDate(sched.last_completed)}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</p>
                  {sched.next_due && (
                    <p className="text-xs text-gray-400">{formatDate(sched.next_due)}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => markCompleted(sched.id)}
                    className="text-xs bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg font-medium transition-colors">
                    Done
                  </button>
                  <button onClick={() => handleDelete(sched.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Add Maintenance Task</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Quick templates */}
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-500 mb-2">Quick templates:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_TASKS.map(task => (
                  <button key={task.name} type="button" onClick={() => applyTemplate(task)}
                    className="text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 px-2 py-1 rounded-md transition-colors">
                    {task.name}
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Name *</label>
                <input name="task_name" value={form.task_name} onChange={handleChange} required
                  placeholder="e.g., HVAC Filter Change"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" value={form.category} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">No category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency (days) *</label>
                  <input name="frequency_days" type="number" min="1" value={form.frequency_days} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
                <select name="property_id" value={form.property_id} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select property</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Completed</label>
                  <input name="last_completed" type="date" value={form.last_completed} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Due</label>
                  <input name="next_due" type="date" value={form.next_due} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                  placeholder="Any notes about this task..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={formLoading}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  {formLoading ? 'Adding...' : 'Add Task'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
