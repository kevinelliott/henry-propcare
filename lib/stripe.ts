let stripeInstance: import('stripe').default | null = null

export function getStripe(): import('stripe').default {
  if (!stripeInstance) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require('stripe')
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2024-06-20',
    }) as import('stripe').default
  }
  return stripeInstance!
}

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 2900,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    properties: 5,
    features: ['Up to 5 properties', 'Unlimited work orders', 'Vendor directory', 'Cost tracking'],
  },
  pro: {
    name: 'Pro',
    price: 4900,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    properties: -1,
    features: ['Unlimited properties', 'Tenant portal', 'Preventive maintenance', 'Priority support'],
  },
}
