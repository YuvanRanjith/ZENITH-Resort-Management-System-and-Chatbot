/*
# ZENITH - Helper functions

Sets up role-checking helper functions used by RLS policies.
*/
create extension if not exists pg_trgm;
create extension if not exists btree_gist;

create or replace function public.is_staff_member(p_role text default null)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select case
    when p_role is null then
      coalesce((auth.jwt() -> 'app_metadata' ->> 'role') in ('manager','assistant_manager','receptionist','clerk','room_service'), false)
    else
      coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = p_role, false)
  end
$$;

create or replace function public.is_manager()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'manager', false)
$$;
