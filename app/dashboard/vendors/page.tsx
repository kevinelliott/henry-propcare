'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Plus, X, Phone, Mail, Edit2, Trash2 } from 'lucide-react'

type Vendor = {
  id: string
  name: string
  trade?: string
  phone?: string
  email?: string
  hourly_rate?: number
  notes?: string
}

const TRADES = ['General Contractor', 'Plumber', 'Electrician', 'HVAC', 'Carpenter', 'Painter', 'Landscaper', 'Cleaner', 'Roofer', 'Other']

export default function VendorsPage() {
  const supabase = createClient()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Vendor | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', trade: '', phone: '', email: '', hourly_rate: '', notes: ''
  })

  async function loadVendors() {
    const { data } = await supabase.from('vendors').select('*').order('name')
    setVendors(data || [])
    setLoading(false)
  }

  useEffect(() => { loadVendors() }, [])

  function openAdd() {
    setEditing(null)
    setForm({ name: '', trade: '', phone: '', email: '', hourly_rate: '', notes: '' })
    setError('')
    setShowModal(true)
  }

  function openEdit(vendor: Vendor) {
    setEditing(vendor)
    setForm({
      name: vendor.name,
      trade: vendor.trade || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      hourly_rate: vendor.hourly_rate?.toString() || '',
      notes: vendor.notes || '',
    })
    setError('')
    setShowModal(true)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setError('')

    const payload = {
      name: form.name,
      trade: form.trade || null,
      phone: form.phone || null,
      email: form.email || null,
      hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
      notes: form.notes || null,
    }

    if (editing) {
      const { error } = await supabase.from('vendors').update(payload).eq('id', editing.id)
      if (error) { setError(error.message); setFormLoading(false); return }
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('vendors').insert({ ...payload, user_id: user!.id })
      if (error) { setError(error.message); setFormLoading(false); return }
    }

    setShowModal(false)
    setFormLoading(false)
    loadVendors()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this vendor?')) return
    await supabase.from('vendors').delete().eq('id', id)
    loadVendors()
  }

  return (
    <div className="pt-16 lg:pt-0 p-6 lg:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-500 mt-1">Your contractor and vendor directory</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" /> Add Vendor
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : !vendors.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Users className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No vendors yet</h2>
          <p className="text-gray-500 mb-6">Add your contractors and service providers to assign them to work orders.</p>
          <button onClick={openAdd} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" /> Add your first vendor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {vendors.map(vendor => (
            <div key={vendor.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-sm">
                  {vendor.name[0].toUpperCase()}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(vendor)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(vendor.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{vendor.name}</h3>
              {vendor.trade && <p className="text-xs text-indigo-600 font-medium mb-3">{vendor.trade}</p>}
              <div className="space-y-2">
                {vendor.phone && (
                  <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                    <Phone className="h-3.5 w-3.5 text-gray-400" /> {vendor.phone}
                  </a>
                )}
                {vendor.email && (
                  <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                    <Mail className="h-3.5 w-3.5 text-gray-400" /> {vendor.email}
                  </a>
                )}
                {vendor.hourly_rate && (
                  <p className="text-sm text-gray-500">${vendor.hourly_rate}/hr</p>
                )}
              </div>
              {vendor.notes && (
                <p className="text-xs text-gray-400 mt-3 border-t border-gray-100 pt-3">{vendor.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Vendor' : 'Add Vendor'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  placeholder="John's Plumbing"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trade / Specialty</label>
                <select name="trade" value={form.trade} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select trade...</option>
                  {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange}
                    placeholder="(555) 555-5555"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                  <input name="hourly_rate" type="number" min="0" step="0.01" value={form.hourly_rate} onChange={handleChange}
                    placeholder="75"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="vendor@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                  placeholder="Reliable, good for after-hours calls..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={formLoading}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                  {formLoading ? 'Saving...' : (editing ? 'Save Changes' : 'Add Vendor')}
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
