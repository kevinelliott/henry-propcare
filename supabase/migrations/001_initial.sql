-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  plan text not null default 'free' check (plan in ('free', 'starter', 'growth')),
  stripe_customer_id text,
  created_at timestamptz default now() not null
);

-- Properties table
create table if not exists properties (
  id uuid primary key default uuid_generate_v4(),
  landlord_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  address text not null,
  slug text not null unique,
  created_at timestamptz default now() not null
);

-- Vendors table
create table if not exists vendors (
  id uuid primary key default uuid_generate_v4(),
  landlord_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  specialty text not null,
  phone text,
  email text,
  active boolean default true not null,
  created_at timestamptz default now() not null
);

-- Work orders table
create table if not exists work_orders (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) on delete cascade not null,
  unit text,
  category text not null check (category in ('plumbing','electrical','hvac','appliance','structural','pest','cleaning','other')),
  description text not null,
  status text not null default 'open' check (status in ('open','in_progress','resolved','cancelled')),
  priority text not null default 'medium' check (priority in ('low','medium','high','emergency')),
  vendor_id uuid references vendors(id) on delete set null,
  tenant_name text not null,
  tenant_email text not null,
  notes text,
  created_at timestamptz default now() not null,
  resolved_at timestamptz
);

-- Subscriptions table
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_subscription_id text not null,
  stripe_customer_id text not null,
  status text not null,
  plan text not null,
  current_period_end timestamptz not null,
  created_at timestamptz default now() not null
);

-- RLS Policies
alter table profiles enable row level security;
alter table properties enable row level security;
alter table vendors enable row level security;
alter table work_orders enable row level security;
alter table subscriptions enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = user_id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = user_id);
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = user_id);

-- Properties policies
create policy "Landlords can CRUD own properties" on properties
  for all using (auth.uid() = landlord_id);

-- Work orders policies (landlord)
create policy "Landlords can view work orders for their properties" on work_orders
  for select using (
    property_id in (
      select id from properties where landlord_id = auth.uid()
    )
  );
create policy "Landlords can update work orders for their properties" on work_orders
  for update using (
    property_id in (
      select id from properties where landlord_id = auth.uid()
    )
  );
create policy "Landlords can delete work orders for their properties" on work_orders
  for delete using (
    property_id in (
      select id from properties where landlord_id = auth.uid()
    )
  );

-- Work orders: public insert (tenants can create without auth)
create policy "Anyone can create work orders" on work_orders
  for insert with check (true);

-- Work orders: public select for status tracking by work order id
create policy "Public can view work orders by id" on work_orders
  for select using (true);

-- Vendors policies
create policy "Landlords can CRUD own vendors" on vendors
  for all using (auth.uid() = landlord_id);

-- Subscriptions policies
create policy "Users can view own subscription" on subscriptions
  for select using (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, plan)
  values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes
create index if not exists idx_properties_landlord on properties(landlord_id);
create index if not exists idx_work_orders_property on work_orders(property_id);
create index if not exists idx_work_orders_status on work_orders(status);
create index if not exists idx_vendors_landlord on vendors(landlord_id);
create index if not exists idx_properties_slug on properties(slug);
