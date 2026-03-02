-- Enable UUID
create extension if not exists "uuid-ossp";

-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  plan text default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

-- Properties
create table properties (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  address text not null,
  city text,
  state text,
  zip text,
  type text default 'residential',
  units_count int default 1,
  purchase_date date,
  notes text,
  created_at timestamptz default now()
);

-- Units
create table units (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references properties on delete cascade not null,
  unit_number text not null,
  bedrooms int default 1,
  bathrooms numeric default 1,
  sq_ft int,
  rent_amount numeric,
  created_at timestamptz default now()
);

-- Tenants
create table tenants (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  unit_id uuid references units on delete set null,
  property_id uuid references properties on delete cascade not null,
  name text not null,
  email text,
  phone text,
  lease_start date,
  lease_end date,
  portal_token text unique default uuid_generate_v4()::text,
  created_at timestamptz default now()
);

-- Vendors
create table vendors (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  trade text,
  phone text,
  email text,
  hourly_rate numeric,
  notes text,
  created_at timestamptz default now()
);

-- Work Orders
create table work_orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  property_id uuid references properties on delete cascade not null,
  unit_id uuid references units on delete set null,
  tenant_id uuid references tenants on delete set null,
  vendor_id uuid references vendors on delete set null,
  title text not null,
  description text,
  category text default 'general',
  priority text default 'medium',
  status text default 'open',
  estimated_cost numeric,
  actual_cost numeric,
  scheduled_date date,
  completed_date date,
  source text default 'landlord',
  created_at timestamptz default now()
);

-- Maintenance Schedules
create table maintenance_schedules (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  property_id uuid references properties on delete cascade not null,
  task_name text not null,
  category text,
  frequency_days int not null,
  last_completed date,
  next_due date,
  notes text,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table properties enable row level security;
alter table units enable row level security;
alter table tenants enable row level security;
alter table vendors enable row level security;
alter table work_orders enable row level security;
alter table maintenance_schedules enable row level security;

-- Policies
create policy "Users own their profile" on profiles for all using (auth.uid() = id);
create policy "Users own their properties" on properties for all using (auth.uid() = user_id);
create policy "Users own their units" on units for all using (
  exists (select 1 from properties where id = units.property_id and user_id = auth.uid())
);
create policy "Users own their tenants" on tenants for all using (auth.uid() = user_id);
create policy "Users own their vendors" on vendors for all using (auth.uid() = user_id);
create policy "Users own their work orders" on work_orders for all using (auth.uid() = user_id);
create policy "Users own their schedules" on maintenance_schedules for all using (auth.uid() = user_id);

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
