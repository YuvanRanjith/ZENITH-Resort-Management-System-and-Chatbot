/*
# ZENITH - First-time setup bootstrap

- bootstrap_manager: callable only when no employees exist, creates the first manager auth user + employees row. Once any employee exists, this function refuses to run. This prevents a permanent hardcoded admin while still allowing initial setup.
- is_setup_required: returns true when no employees exist (used by the UI to show the setup screen).
*/

create or replace function public.is_setup_required()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select not exists (select 1 from public.employees where department = 'manager');
$$;

revoke execute on function public.is_setup_required() from public, anon;
grant execute on function public.is_setup_required() to anon, authenticated;

create or replace function public.bootstrap_manager(
  p_employee_id text,
  p_name text,
  p_email text,
  p_password text,
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
  if exists (select 1 from public.employees where department = 'manager') then
    raise exception 'Setup already complete: a manager already exists' using errcode = '42501';
  end if;

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
    jsonb_build_object('role', 'manager'),
    jsonb_build_object('full_name', p_name),
    now(),
    now()
  )
  returning id into v_user_id;

  insert into public.employees (
    employee_id, auth_user_id, name, department, salary, date_of_join, gender, phone_no
  )
  values (
    p_employee_id, v_user_id, p_name, 'manager', 0, current_date, null, p_phone_no
  )
  returning id into v_emp_id;

  return v_emp_id;
end;
$$;

revoke execute on function public.bootstrap_manager(text,text,text,text,text) from public, anon;
grant execute on function public.bootstrap_manager(text,text,text,text,text) to anon, authenticated;
