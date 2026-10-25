/*
# ZENITH - Core tables

Creates customers, employees, rooms, reservations, payments, service_requests, export_logs.
See 001 helper migration for role functions.
*/

-- ===================== customers =====================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  customer_id text not null unique,
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null unique,
  phone_no text,
  id_proof_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists customers_customer_id_idx on public.customers (customer_id);
create index if not exists customers_name_idx on public.customers using gin (name gin_trgm_ops);
create index if not exists customers_email_idx on public.customers (email);

-- ===================== employees =====================
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null unique,
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  department text not null check (department in ('manager','assistant_manager','receptionist','clerk','room_service')),
  salary numeric(12,2) not null default 0,
  date_of_join date not null default current_date,
  gender text check (gender in ('M','F','O')),
  phone_no text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists employees_employee_id_idx on public.employees (employee_id);
create index if not exists employees_name_idx on public.employees using gin (name gin_trgm_ops);
create index if not exists employees_department_idx on public.employees (department);

-- ===================== rooms =====================
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text not null unique,
  room_type text not null check (room_type in ('Standard Room','Deluxe Room','Premium Suite','Executive Suite','Presidential Suite')),
  description text,
  nightly_price numeric(12,2) not null default 0,
  capacity int not null default 2 check (capacity > 0),
  amenities text[] not null default '{}',
  image_url text,
  operational_status text not null default 'available' check (operational_status in ('available','occupied','maintenance')),
  created_at timestamptz not null default now()
);
create index if not exists rooms_room_number_idx on public.rooms (room_number);
create index if not exists rooms_type_idx on public.rooms (room_type);
create index if not exists rooms_status_idx on public.rooms (operational_status);

-- ===================== reservations =====================
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  room_id uuid not null references public.rooms(id) on delete restrict,
  check_in date not null,
  check_out date not null,
  total_days int generated always as (check_out - check_in) stored,
  base_amount numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','confirmed','checked_in','checked_out','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_dates check (check_out > check_in),
  constraint no_overlap exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  ) where (status in ('pending','confirmed','checked_in'))
);
create index if not exists reservations_customer_idx on public.reservations (customer_id);
create index if not exists reservations_room_idx on public.reservations (room_id);
create index if not exists reservations_check_in_idx on public.reservations (check_in);
create index if not exists reservations_check_out_idx on public.reservations (check_out);
create index if not exists reservations_status_idx on public.reservations (status);

-- ===================== payments =====================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  payment_status text not null default 'recorded' check (payment_status in ('recorded','refunded','failed')),
  payment_method text,
  payment_reference text,
  created_at timestamptz not null default now()
);
create index if not exists payments_reservation_idx on public.payments (reservation_id);
create index if not exists payments_status_idx on public.payments (payment_status);

-- ===================== service_requests =====================
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  reservation_id uuid references public.reservations(id) on delete set null,
  request_type text not null,
  description text,
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  created_at timestamptz not null default now()
);
create index if not exists service_requests_customer_idx on public.service_requests (customer_id);
create index if not exists service_requests_status_idx on public.service_requests (status);

-- ===================== export_logs =====================
create table if not exists public.export_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete set null,
  export_type text not null,
  record_count int not null default 0,
  exported_at timestamptz not null default now()
);
create index if not exists export_logs_employee_idx on public.export_logs (employee_id);

-- ===================== updated_at triggers =====================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists customers_touch on public.customers;
create trigger customers_touch before update on public.customers
  for each row execute function public.touch_updated_at();

drop trigger if exists employees_touch on public.employees;
create trigger employees_touch before update on public.employees
  for each row execute function public.touch_updated_at();

drop trigger if exists reservations_touch on public.reservations;
create trigger reservations_touch before update on public.reservations
  for each row execute function public.touch_updated_at();
