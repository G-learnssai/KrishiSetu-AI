-- ==============================================================================
-- KrishiSetu AI — Production Supabase Database Schema & Row Level Security (RLS)
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your Project -> SQL Editor -> New Query
-- 3. Paste and run this entire file.
-- ==============================================================================

-- 1. PROFILES TABLE (Linked with Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('farmer', 'owner', 'buyer')),
  secondary_role text,
  phone text,
  state text default 'Karnataka',
  district text,
  village text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Profiles RLS Policies
create policy "Public profiles are viewable by everyone." 
  on public.profiles for select 
  using (true);

create policy "Users can insert their own profile." 
  on public.profiles for insert 
  with check (auth.uid() = id);

create policy "Users can update their own profile." 
  on public.profiles for update 
  using (auth.uid() = id);

-- 2. AUTOMATIC PROFILE CREATION TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, phone, state, district, village)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Farmer Friend'),
    coalesce(new.raw_user_meta_data->>'role', 'farmer'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'state', 'Karnataka'),
    coalesce(new.raw_user_meta_data->>'district', 'Mandya'),
    coalesce(new.raw_user_meta_data->>'village', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. CROP MARKETPLACE LISTINGS TABLE
create table if not exists public.crop_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null,
  variety text,
  quantity numeric not null check (quantity > 0),
  unit text not null,
  price numeric not null check (price >= 0),
  village text not null,
  district text not null,
  harvest_date date,
  quality text,
  status text default 'available' check (status in ('available', 'negotiation', 'sold')),
  image_url text,
  farmer_name text not null,
  farmer_phone text not null,
  created_at timestamptz default now()
);

alter table public.crop_listings enable row level security;

-- Crop Listings RLS Policies
create policy "Anyone can view crop listings." 
  on public.crop_listings for select 
  using (true);

create policy "Authenticated users can create crop listings." 
  on public.crop_listings for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own crop listings." 
  on public.crop_listings for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own crop listings." 
  on public.crop_listings for delete 
  using (auth.uid() = user_id);

-- 4. CROP BUYER ENQUIRIES & BIDS TABLE
create table if not exists public.crop_enquiries (
  id uuid primary key default gen_random_uuid(),
  crop_id uuid references public.crop_listings(id) on delete cascade not null,
  buyer_id uuid references auth.users(id) on delete cascade not null,
  seller_id uuid references auth.users(id) on delete cascade not null,
  buyer_name text not null,
  buyer_phone text not null,
  quantity numeric not null check (quantity > 0),
  offered_price numeric not null check (offered_price >= 0),
  message text,
  status text default 'new' check (status in ('new', 'accepted', 'declined')),
  created_at timestamptz default now()
);

alter table public.crop_enquiries enable row level security;

-- Enquiries RLS: Only the buyer who made the enquiry or the seller owning the crop can view/update
create policy "Buyers and sellers can view their own crop enquiries." 
  on public.crop_enquiries for select 
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Buyers can insert enquiries." 
  on public.crop_enquiries for insert 
  with check (auth.uid() = buyer_id);

create policy "Sellers can update enquiry status." 
  on public.crop_enquiries for update 
  using (auth.uid() = seller_id);

-- 5. MACHINERY RENTAL LISTINGS TABLE
create table if not exists public.machinery_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null,
  rate numeric not null check (rate > 0),
  unit text not null check (unit in ('hour', 'day', 'acre')),
  condition text not null,
  driver_included text not null,
  village text not null,
  district text not null,
  specs text not null,
  available_date date,
  owner_name text not null,
  owner_phone text not null,
  status text default 'available' check (status in ('available', 'booked', 'maintenance')),
  image_url text,
  created_at timestamptz default now()
);

alter table public.machinery_listings enable row level security;

-- Machinery Listings RLS Policies
create policy "Anyone can view machinery listings." 
  on public.machinery_listings for select 
  using (true);

create policy "Equipment owners can insert listings." 
  on public.machinery_listings for insert 
  with check (auth.uid() = owner_id);

create policy "Equipment owners can update their listings." 
  on public.machinery_listings for update 
  using (auth.uid() = owner_id);

create policy "Equipment owners can delete their listings." 
  on public.machinery_listings for delete 
  using (auth.uid() = owner_id);

-- 6. MACHINERY BOOKINGS TABLE
create table if not exists public.machinery_bookings (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid references public.machinery_listings(id) on delete cascade not null,
  renter_id uuid references auth.users(id) on delete cascade not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  renter_name text not null,
  renter_phone text not null,
  renter_village text not null,
  start_date date not null,
  end_date date not null,
  unit text not null,
  unit_quantity numeric not null,
  rate numeric not null,
  estimated_cost numeric not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
  message text,
  created_at timestamptz default now()
);

alter table public.machinery_bookings enable row level security;

-- Machinery Bookings RLS: Only the renter or the machinery owner can view/update
create policy "Renters and equipment owners can view their bookings." 
  on public.machinery_bookings for select 
  using (auth.uid() = renter_id or auth.uid() = owner_id);

create policy "Renters can submit booking requests." 
  on public.machinery_bookings for insert 
  with check (auth.uid() = renter_id);

create policy "Owners and renters can update their bookings." 
  on public.machinery_bookings for update 
  using (auth.uid() = owner_id or auth.uid() = renter_id);
