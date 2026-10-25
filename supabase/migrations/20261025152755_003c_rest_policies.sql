alter table public.reservations enable row level security;
grant select, insert, update on public.reservations to authenticated;
grant select, insert, update on public.reservations to service_role;

drop policy if exists "Customers read own reservations" on public.reservations;
create policy "Customers read own reservations" on public.reservations
  for select to authenticated
  using (
    auth.uid() = (select c.auth_user_id from public.customers c where c.id = reservations.customer_id)
    or public.is_staff_member()
  );

drop policy if exists "Customers insert own reservations" on public.reservations;
create policy "Customers insert own reservations" on public.reservations
  for insert to authenticated
  with check (
    auth.uid() = (select c.auth_user_id from public.customers c where c.id = reservations.customer_id)
    or public.is_staff_member()
  );

drop policy if exists "Customers update own reservations" on public.reservations;
create policy "Customers update own reservations" on public.reservations
  for update to authenticated
  using (
    auth.uid() = (select c.auth_user_id from public.customers c where c.id = reservations.customer_id)
    or public.is_staff_member()
  )
  with check (
    auth.uid() = (select c.auth_user_id from public.customers c where c.id = reservations.customer_id)
    or public.is_staff_member()
  );

alter table public.payments enable row level security;
grant select, insert, update on public.payments to authenticated;
grant select, insert, update on public.payments to service_role;

drop policy if exists "Customers read own payments" on public.payments;
create policy "Customers read own payments" on public.payments
  for select to authenticated
  using (
    exists (
      select 1 from public.reservations r
      join public.customers c on c.id = r.customer_id
      where r.id = payments.reservation_id
      and (auth.uid() = c.auth_user_id or public.is_staff_member())
    )
  );

drop policy if exists "Staff insert payments" on public.payments;
create policy "Staff insert payments" on public.payments
  for insert to authenticated with check (public.is_staff_member());

drop policy if exists "Staff update payments" on public.payments;
create policy "Staff update payments" on public.payments
  for update to authenticated
  using (public.is_staff_member())
  with check (public.is_staff_member());

alter table public.service_requests enable row level security;
grant select, insert, update on public.service_requests to authenticated;
grant select, insert, update on public.service_requests to service_role;

drop policy if exists "Customers read own requests" on public.service_requests;
create policy "Customers read own requests" on public.service_requests
  for select to authenticated
  using (
    auth.uid() = (select c.auth_user_id from public.customers c where c.id = service_requests.customer_id)
    or public.is_staff_member()
  );

drop policy if exists "Customers insert own requests" on public.service_requests;
create policy "Customers insert own requests" on public.service_requests
  for insert to authenticated
  with check (auth.uid() = (select c.auth_user_id from public.customers c where c.id = service_requests.customer_id));

drop policy if exists "Staff update requests" on public.service_requests;
create policy "Staff update requests" on public.service_requests
  for update to authenticated
  using (public.is_staff_member())
  with check (public.is_staff_member());

alter table public.export_logs enable row level security;
grant select, insert on public.export_logs to authenticated;
grant select, insert on public.export_logs to service_role;

drop policy if exists "Manager read export logs" on public.export_logs;
create policy "Manager read export logs" on public.export_logs
  for select to authenticated using (public.is_manager());

drop policy if exists "Manager insert export logs" on public.export_logs;
create policy "Manager insert export logs" on public.export_logs
  for insert to authenticated with check (public.is_manager());
