alter table public.employees enable row level security;
grant select, update on public.employees to authenticated;
grant select, insert, update on public.employees to service_role;

drop policy if exists "Staff read employees" on public.employees;
create policy "Staff read employees" on public.employees
  for select to authenticated
  using (public.is_staff_member() or auth.uid() = auth_user_id);

drop policy if exists "Employees update own contact" on public.employees;
create policy "Employees update own contact" on public.employees
  for update to authenticated
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

alter table public.rooms enable row level security;
grant select on public.rooms to anon, authenticated;
grant insert, update on public.rooms to authenticated;
grant select, insert, update on public.rooms to service_role;

drop policy if exists "Public read rooms" on public.rooms;
create policy "Public read rooms" on public.rooms
  for select to anon, authenticated using (true);

drop policy if exists "Staff write rooms" on public.rooms;
create policy "Staff write rooms" on public.rooms
  for insert to authenticated with check (public.is_staff_member());

drop policy if exists "Staff update rooms" on public.rooms;
create policy "Staff update rooms" on public.rooms
  for update to authenticated
  using (public.is_staff_member())
  with check (public.is_staff_member());
