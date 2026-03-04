# henry-propcare — Property Maintenance SaaS

## Concept
Simple property maintenance management for independent landlords with 1-20 units.
Target: landlords who currently manage maintenance via text/email chaos.
Price: $19/mo vs AppFolio $280/mo.

## Stack
- Next.js 15 + TypeScript + Tailwind CSS
- Supabase (Auth: Google/GitHub/email, DB with RLS)
- Stripe (Free/Starter $19/Growth $49)
- Vercel (deploy with vercel.json)

## Core Features
1. **Tenant portal** (`/request/[propertySlug]`) — tenants submit maintenance requests (category, description, photo upload, priority)
2. **Landlord dashboard** — work orders list, status tracking (open/in-progress/resolved), filter by property
3. **Work order detail** — assign to vendor, add notes, update status, upload completion photos
4. **Vendor directory** — add/manage plumbers, electricians, handymen with contact info
5. **Property management** — add properties, generate unique tenant portal links
6. **Repair history log** — full audit trail per property/unit, exportable CSV

## Pricing
- Free: 1 property, 10 work orders/mo
- Starter $19/mo: up to 5 properties, unlimited work orders, email alerts
- Growth $49/mo: unlimited properties, vendor portal, CSV export, API

## Key Pages
- / Landing page — hero (shows work order dashboard mock), pain points, pricing vs AppFolio
- /pricing
- /features
- /docs — REST API v1, MCP endpoint, DB schema
- /dashboard — work orders overview
- /dashboard/properties — property list with tenant portal links
- /dashboard/work-orders — all work orders across properties, filters
- /dashboard/vendors — vendor directory
- /request/[slug] — PUBLIC tenant maintenance request form
- /request/[slug]/[workOrderId] — tenant status tracking page
- /api/v1/work-orders — REST API
- /api/mcp — MCP endpoint (5 tools)
- /api/admin — admin stats
- /api/webhooks/stripe — Stripe webhook
- /api/cron/send-alerts — daily digest to landlords

## DB Tables
- profiles (user settings, subscription tier)
- properties (name, address, slug, landlord_id)
- work_orders (property_id, unit, category, description, status, priority, vendor_id, photos, created_at)
- vendors (name, specialty, phone, email, landlord_id)
- subscriptions (stripe data)

All tables use RLS with auth.uid() policies.

## Important Patterns
- Use placeholder fallbacks in Supabase client: `|| 'https://placeholder.supabase.co'`
- Stripe lazy init: use `getStripe()` function, never module-level `new Stripe(...)`
- Add vercel.json: `{"framework":"nextjs","installCommand":"npm install","buildCommand":"npm run build"}`
- Git author: kevin@welikeinc.com
- Public tenant request form needs NO auth

## After building
1. `git init && git add -A && git commit -m "initial commit"`
2. `GIT_AUTHOR_EMAIL=kevin@welikeinc.com GIT_COMMITTER_EMAIL=kevin@welikeinc.com git commit --amend --reset-author --no-edit`
3. `gh repo create kevinelliott/henry-propcare --private --source=. --push`
4. `vercel --prod --yes`
5. Provision Supabase: `supabase projects create henry-propcare --org-id zlozpmrxzcynbawzairi --region us-west-1`
6. Get URL+keys, set in Vercel: `vercel env add NEXT_PUBLIC_SUPABASE_URL production`
7. Run `vercel --prod --yes` again
8. Run: `openclaw system event --text "Done: henry-propcare is live at https://henry-propcare.vercel.app" --mode now`
