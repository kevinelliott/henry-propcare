import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!
  const stripe = getStripe()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  )

  if (event.type === 'checkout.session.completed') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = event.data.object as unknown as {
      metadata: { user_id: string; plan: string };
      customer: string;
      subscription: string;
    }
    await supabase.from('profiles').update({
      plan: session.metadata.plan,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
    }).eq('id', session.metadata.user_id)
  }

  if (event.type === 'customer.subscription.deleted') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = event.data.object as unknown as { id: string }
    await supabase.from('profiles').update({ plan: 'free' }).eq('stripe_subscription_id', sub.id)
  }

  return NextResponse.json({ received: true })
}
