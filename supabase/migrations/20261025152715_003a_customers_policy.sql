alter table public.customers enable row level security;
grant select, update on public.customers to authenticated;
grant select on public.customers to service_role;

drop policy if exists "Customers read own profile" on public.customers;
create policy "Customers read own profile" on public.customers
  for select to authenticated
  using (auth.uid() = auth_user_id or public.is_staff_member());
