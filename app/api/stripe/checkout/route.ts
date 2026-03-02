import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getStripe, PLANS } from '@/lib/stripe'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  const planData = PLANS[plan as keyof typeof PLANS]
  if (!planData) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    line_items: [{ price: planData.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    metadata: { user_id: user.id, plan },
  })

  return NextResponse.json({ url: session.url })
}
