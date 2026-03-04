import Stripe from "stripe";

// Lazy init — never module-level
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "");
}

export { getStripe };

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    properties: 1,
    workOrders: 10,
    features: ["1 property", "10 work orders/mo", "Tenant portal", "Basic tracking"],
  },
  starter: {
    name: "Starter",
    price: 19,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || "",
    properties: 5,
    workOrders: -1,
    features: ["5 properties", "Unlimited work orders", "Email alerts", "Vendor directory", "Work order history"],
  },
  growth: {
    name: "Growth",
    price: 49,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID || "",
    properties: -1,
    workOrders: -1,
    features: ["Unlimited properties", "All Starter features", "CSV export", "REST API access", "MCP endpoint", "Priority support"],
  },
} as const;
