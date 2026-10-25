/*
# ZENITH - Manager privileged functions

Security definer functions callable by managers (and assistant managers where noted) to perform privileged mutations that the anon/authenticated role cannot do directly:
- create_employee: creates a new auth user with the staff role in app_metadata, then inserts the employees row. Avoids public self-registration of staff.
- record_payment: inserts a payment record against a reservation (staff only).
- update_reservation_status: updates the status of a reservation (staff only).
- set_room_status: updates a room's operational status (staff only).
- manager_dashboard_stats: aggregate dashboard figures (manager only).

All functions check the caller's role via public.is_staff_member()/is_manager() and return JSON or rows. EXECUTE revoked from PUBLIC/anon and granted only to authenticated.
*/

-- ===================== create_employee =====================
create or replace function public.create_employee(
  p_employee_id text,
  p_name text,
  p_email text,
  p_password text,
  p_department text,
  p_salary numeric,
  p_date_of_join date,
  p_gender text,
  p_phone_no text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_emp_id uuid;
begin
  if not public.is_manager() then
    raise exception 'Only managers can create employees' using errcode = '42501';
  end if;
  if p_department not in ('manager','assistant_manager','receptionist','clerk','room_service') then
    raise exception 'Invalid department' using errcode = '23514';
  end if;

  -- Create auth user with staff role in app_metadata
  insert into auth.users (
    instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object('role', p_department),
    jsonb_build_object('full_name', p_name),
    now(),
    now()
  )
  returning id into v_user_id;

  insert into public.employees (
    employee_id, auth_user_id, name, department, salary, date_of_join, gender, phone_no
  )
  values (
    p_employee_id, v_user_id, p_name, p_department, p_salary, p_date_of_join, p_gender, p_phone_no
  )
  returning id into v_emp_id;

  return v_emp_id;
end;
$$;

revoke execute on function public.create_employee(text,text,text,text,text,numeric,date,text,text) from public, anon;
grant execute on function public.create_employee(text,text,text,text,text,numeric,date,text,text) to authenticated;

-- ===================== record_payment =====================
create or replace function public.record_payment(
  p_reservation_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_payment_reference text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_staff_member() then
    raise exception 'Only staff can record payments' using errcode = '42501';
  end if;
  if p_amount <= 0 then
    raise exception 'Payment amount must be positive' using errcode = '23514';
  end if;
  insert into public.payments (reservation_id, amount, payment_status, payment_method, payment_reference)
  values (p_reservation_id, p_amount, 'recorded', p_payment_method, p_payment_reference)
  returning id into v_id;
  return v_id;
end;
$$;

revoke execute on function public.record_payment(uuid,numeric,text,text) from public, anon;
grant execute on function public.record_payment(uuid,numeric,text,text) to authenticated;

-- ===================== update_reservation_status =====================
create or replace function public.update_reservation_status(
  p_reservation_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff_member() then
    raise exception 'Only staff can update reservation status' using errcode = '42501';
  end if;
  if p_status not in ('pending','confirmed','checked_in','checked_out','cancelled') then
    raise exception 'Invalid status' using errcode = '23514';
  end if;
  update public.reservations set status = p_status where id = p_reservation_id;
end;
$$;

revoke execute on function public.update_reservation_status(uuid,text) from public, anon;
grant execute on function public.update_reservation_status(uuid,text) to authenticated;

-- ===================== set_room_status =====================
create or replace function public.set_room_status(
  p_room_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff_member() then
    raise exception 'Only staff can update room status' using errcode = '42501';
  end if;
  if p_status not in ('available','occupied','maintenance') then
    raise exception 'Invalid status' using errcode = '23514';
  end if;
  update public.rooms set operational_status = p_status where id = p_room_id;
end;
$$;

revoke execute on function public.set_room_status(uuid,text) from public, anon;
grant execute on function public.set_room_status(uuid,text) to authenticated;

-- ===================== manager_dashboard_stats =====================
create or replace function public.manager_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_rooms int;
  v_available_rooms int;
  v_occupied_rooms int;
  v_total_customers int;
  v_total_employees int;
  v_active_reservations int;
  v_revenue numeric(12,2);
  v_pending_payments numeric(12,2);
begin
  if not public.is_manager() then
    raise exception 'Only managers can view dashboard stats' using errcode = '42501';
  end if;
  select count(*) into v_total_rooms from public.rooms;
  select count(*) into v_available_rooms from public.rooms where operational_status = 'available';
  select count(*) into v_occupied_rooms from public.rooms where operational_status = 'occupied';
  select count(*) into v_total_customers from public.customers;
  select count(*) into v_total_employees from public.employees;
  select count(*) into v_active_reservations from public.reservations where status in ('pending','confirmed','checked_in');
  select coalesce(sum(p.amount),0) into v_revenue from public.payments p where p.payment_status = 'recorded';
  select coalesce(sum(r.total_amount),0) - coalesce(sum(p.amount),0)
    into v_pending_payments
    from public.reservations r
    left join public.payments p on p.reservation_id = r.id and p.payment_status = 'recorded'
    where r.status in ('pending','confirmed','checked_in','checked_out');

  return jsonb_build_object(
    'total_rooms', v_total_rooms,
    'available_rooms', v_available_rooms,
    'occupied_rooms', v_occupied_rooms,
    'total_customers', v_total_customers,
    'total_employees', v_total_employees,
    'active_reservations', v_active_reservations,
    'revenue', v_revenue,
    'pending_payments', v_pending_payments
  );
end;
$$;

revoke execute on function public.manager_dashboard_stats() from public, anon;
grant execute on function public.manager_dashboard_stats() to authenticated;
