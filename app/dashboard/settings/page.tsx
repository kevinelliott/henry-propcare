'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, CreditCard, User } from 'lucide-react'
import { PLANS } from '@/lib/stripe'

type Profile = {
  id: string
  email?: string
  full_name?: string
  plan?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
}

export default function SettingsPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaveLoading(true)
    setError('')
    setSuccess('')
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', profile!.id)
    if (error) { setError(error.message) }
    else { setSuccess('Profile updated!') }
    setSaveLoading(false)
  }

  async function handleUpgrade(plan: string) {
    setUpgradeLoading(plan)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create checkout session')
      }
    } catch {
      setError('Failed to start checkout')
    }
    setUpgradeLoading(null)
  }

  if (loading) {
    return <div className="pt-16 lg:pt-0 p-6 lg:p-8 text-gray-400">Loading...</div>
  }

  const currentPlan = profile?.plan || 'free'

  return (
    <div className="pt-16 lg:pt-0 p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile and subscription</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
            <User className="h-5 w-5 text-indigo-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Profile</h2>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4">{success}</div>}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={profile?.email || ''} disabled
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed" />
          </div>
          <button type="submit" disabled={saveLoading}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Subscription Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Subscription</h2>
            <p className="text-xs text-gray-500">
              Current plan: <span className="font-medium capitalize text-indigo-600">{currentPlan}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrentPlan = currentPlan === key
            return (
              <div key={key} className={`border rounded-xl p-4 ${isCurrentPlan ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>
                <h3 className="font-semibold text-gray-900 mb-1">{plan.name}</h3>
                <div className="text-2xl font-bold mb-1">
                  ${(plan.price / 100).toFixed(0)}<span className="text-sm font-normal text-gray-500">/mo</span>
                </div>
                <ul className="space-y-1 mb-4">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrentPlan ? (
                  <div className="w-full text-center text-xs text-indigo-700 font-medium py-2 bg-indigo-100 rounded-lg">
                    Current Plan
                  </div>
                ) : (
                  <button onClick={() => handleUpgrade(key)} disabled={upgradeLoading === key}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                    {upgradeLoading === key ? 'Loading...' : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="font-semibold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all data. This cannot be undone.</p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
              alert('Please contact support to delete your account.')
            }
          }}
          className="text-sm text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium">
          Delete Account
        </button>
      </div>
    </div>
  )
}
