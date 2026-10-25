-- Incremental security and booking completion; preserves existing records.
revoke execute on function public.bootstrap_manager(text,text,text,text,text) from anon, authenticated;
revoke select, update on public.employees from authenticated;
grant select (id, employee_id, auth_user_id, name, department, date_of_join, gender, phone_no, created_at, updated_at) on public.employees to authenticated;
drop policy if exists "Staff read employees" on public.employees;
create policy "Read own staff profile or manager" on public.employees for select to authenticated using (auth.uid() = auth_user_id or public.is_manager());
revoke insert, update on public.reservations from authenticated;
revoke insert on public.export_logs from authenticated;

create or replace function public.ensure_customer_profile() returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
 if auth.uid() is null or public.is_staff_member() then raise exception 'Customer authentication required' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 select id into v_id from customers where auth_user_id=auth.uid();
 if v_id is null then
 insert into customers(customer_id,auth_user_id,name,email) values ('C-' || auth.uid()::text,auth.uid(),coalesce(nullif(auth.jwt()->'user_metadata'->>'full_name',''), 'Guest'), auth.jwt()->>'email') returning id into v_id;
 end if;
 return v_id;
end $$;

create or replace function public.available_rooms(p_check_in date,p_check_out date,p_guests integer,p_category text default null) returns setof public.rooms language plpgsql security definer set search_path = public as $$
begin
 if p_check_in is null or p_check_out is null or p_guests is null or p_check_in < current_date or p_check_out <= p_check_in or p_guests < 1 or p_guests > 20 then raise exception 'Invalid dates or guest count'; end if;
 return query select rm.* from rooms rm where rm.operational_status <> 'maintenance' and rm.capacity >= p_guests and (p_category is null or rm.room_type=p_category) and not exists(select 1 from reservations r where r.room_id=rm.id and r.status in ('pending','confirmed','checked_in') and r.check_in < p_check_out and r.check_out > p_check_in) order by rm.nightly_price,rm.room_number;
end $$;

create or replace function public.book_room(p_room_id uuid,p_check_in date,p_check_out date,p_guests integer) returns uuid language plpgsql security definer set search_path=public as $$
declare v_customer uuid; v_room rooms; v_id uuid; v_base numeric; v_tax numeric;
begin
 v_customer := public.ensure_customer_profile();
 if p_check_in is null or p_check_out is null or p_guests is null or p_check_in < current_date or p_check_out <= p_check_in or p_guests < 1 then raise exception 'Invalid booking details'; end if;
 select * into v_room from rooms where id=p_room_id for update;
 if not found or v_room.operational_status='maintenance' or v_room.capacity < p_guests or v_room.nightly_price < 0 then raise exception 'Room cannot be booked'; end if;
 v_base := round(v_room.nightly_price * (p_check_out-p_check_in),2); v_tax := round(v_base * 0.03,2);
 insert into reservations(customer_id,room_id,check_in,check_out,base_amount,tax_amount,total_amount,status) values(v_customer,p_room_id,p_check_in,p_check_out,v_base,v_tax,v_base+v_tax,'confirmed') returning id into v_id;
 return v_id;
end $$;

create or replace function public.cancel_own_reservation(p_id uuid) returns void language plpgsql security definer set search_path=public as $$
begin
 update reservations set status='cancelled' where id=p_id and status in ('pending','confirmed') and customer_id in(select id from customers where auth_user_id=auth.uid());
 if not found then raise exception 'Reservation cannot be cancelled' using errcode='42501'; end if;
end $$;

create or replace function public.manager_dashboard_stats() returns jsonb language plpgsql security definer set search_path=public as $$
begin
 if not public.is_manager() then raise exception 'Manager authorization required' using errcode='42501'; end if;
 return jsonb_build_object(
 'total_rooms',(select count(*) from rooms),
 'available_rooms',(select count(*) from rooms rm where operational_status <> 'maintenance' and not exists(select 1 from reservations r where r.room_id=rm.id and r.status in ('pending','confirmed','checked_in') and r.check_in <= current_date and r.check_out > current_date)),
 'occupied_rooms',(select count(distinct room_id) from reservations where status in ('pending','confirmed','checked_in') and check_in <= current_date and check_out > current_date),
 'total_customers',(select count(*) from customers),'total_employees',(select count(*) from employees),
 'active_reservations',(select count(*) from reservations where status in ('pending','confirmed','checked_in')),
 'revenue',(select coalesce(sum(amount),0) from payments where payment_status='recorded'),
 'pending_payments',(select coalesce(sum(greatest(r.total_amount-coalesce(p.paid,0),0)),0) from reservations r left join (select reservation_id,sum(amount) paid from payments where payment_status='recorded' group by reservation_id) p on p.reservation_id=r.id where r.status <> 'cancelled'));
end $$;

-- Salary only leaves the database through manager-authorized functions.
create or replace function public.manager_staff() returns setof public.employees language plpgsql security definer set search_path=public as $$
begin
 if not public.is_manager() then raise exception 'Manager authorization required' using errcode='42501'; end if;
 return query select * from employees order by employee_id;
end $$;

create or replace function public.csv_cell(p_value text) returns text language sql immutable as $$
 select '"' || replace(case when coalesce(p_value,'') ~ '^[[:space:][:cntrl:]]*[=+@-]' or coalesce(p_value,'') ~ '^[\t\r\n]' then '''' || p_value else coalesce(p_value,'') end,'"','""') || '"'
$$;

create or replace function public.manager_export(p_kind text,p_search text default '',p_status text default null) returns text language plpgsql security definer set search_path=public as $$
declare v_csv text; v_count integer; v_employee uuid;
begin
 if not public.is_manager() then raise exception 'Manager authorization required' using errcode='42501'; end if;
 select id into v_employee from employees where auth_user_id=auth.uid() limit 1;
 if p_kind='customers' then
 select 'Customer ID,Name,Email,Phone,Room Number,Room Type,Check-in Date,Check-out Date,Number of Days,Fare Paid,Fare Remaining,Reservation Status' || E'\r\n' || coalesce(string_agg(line,E'\r\n' order by sort_key),'') , count(*) into v_csv,v_count from (
 select c.customer_id || coalesce(r.id::text,'') sort_key, concat_ws(',',csv_cell(c.customer_id),csv_cell(c.name),csv_cell(c.email),csv_cell(c.phone_no),csv_cell(rm.room_number),csv_cell(rm.room_type),csv_cell(r.check_in::text),csv_cell(r.check_out::text),csv_cell(r.total_days::text),csv_cell(coalesce(p.paid,0)::text),csv_cell(greatest(coalesce(r.total_amount,0)-coalesce(p.paid,0),0)::text),csv_cell(r.status)) line
 from customers c left join reservations r on r.customer_id=c.id left join rooms rm on rm.id=r.room_id left join(select reservation_id,sum(amount) paid from payments where payment_status='recorded' group by reservation_id) p on p.reservation_id=r.id
 where (coalesce(p_search,'')='' or c.name ilike '%'||p_search||'%' or c.email ilike '%'||p_search||'%' or c.customer_id ilike '%'||p_search||'%') and (p_status is null or r.status=p_status)) records;
 elsif p_kind='staff' then
 select 'Employee ID,Name,Department,Salary,Joining Date,Phone Number' || E'\r\n' || coalesce(string_agg(concat_ws(',',csv_cell(employee_id),csv_cell(name),csv_cell(department),csv_cell(salary::text),csv_cell(date_of_join::text),csv_cell(phone_no)),E'\r\n' order by employee_id),'') ,count(*) into v_csv,v_count from employees where (coalesce(p_search,'')='' or name ilike '%'||p_search||'%' or employee_id ilike '%'||p_search||'%') and (p_status is null or department=p_status);
 else raise exception 'Unknown export type'; end if;
 insert into export_logs(employee_id,export_type,record_count) values(v_employee,p_kind,v_count);
 return v_csv;
end $$;

revoke all on function public.ensure_customer_profile(),public.book_room(uuid,date,date,integer),public.cancel_own_reservation(uuid),public.manager_staff(),public.manager_export(text,text,text) from public,anon;
grant execute on function public.ensure_customer_profile(),public.book_room(uuid,date,date,integer),public.cancel_own_reservation(uuid),public.manager_staff(),public.manager_export(text,text,text) to authenticated;
revoke all on function public.available_rooms(date,date,integer,text) from public;
grant execute on function public.available_rooms(date,date,integer,text) to anon,authenticated;

create or replace function public.manager_update_customer(p_id text,p_name text,p_phone text) returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_manager() then raise exception 'Manager authorization required' using errcode='42501'; end if;
 if length(trim(p_name))=0 or length(p_name)>120 or length(coalesce(p_phone,''))>40 then raise exception 'Invalid customer details'; end if;
 update customers set name=trim(p_name),phone_no=nullif(p_phone,'') where customer_id=p_id;
 if not found then raise exception 'Customer not found'; end if;
end $$;
create or replace function public.manager_update_staff(p_id text,p_name text,p_salary numeric,p_phone text) returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_manager() then raise exception 'Manager authorization required' using errcode='42501'; end if;
 if p_salary is null or p_salary<0 or length(trim(p_name))=0 or length(p_name)>120 or length(coalesce(p_phone,''))>40 then raise exception 'Invalid employee details'; end if;
 update employees set name=trim(p_name),salary=p_salary,phone_no=nullif(p_phone,'') where employee_id=p_id;
 if not found then raise exception 'Employee not found'; end if;
end $$;
create or replace function public.manager_save_room(p_number text,p_type text,p_price numeric,p_capacity integer,p_status text) returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_manager() then raise exception 'Manager authorization required' using errcode='42501'; end if;
 if p_price is null or p_price<0 or p_capacity is null or p_capacity<1 or length(trim(p_number))=0 or length(p_number)>30 then raise exception 'Invalid room details'; end if;
 insert into rooms(room_number,room_type,nightly_price,capacity,operational_status) values(trim(p_number),p_type,p_price,p_capacity,p_status) on conflict(room_number) do update set room_type=excluded.room_type,nightly_price=excluded.nightly_price,capacity=excluded.capacity,operational_status=excluded.operational_status;
end $$;
revoke all on function public.manager_update_customer(text,text,text),public.manager_update_staff(text,text,numeric,text),public.manager_save_room(text,text,numeric,integer,text) from public,anon;
grant execute on function public.manager_update_customer(text,text,text),public.manager_update_staff(text,text,numeric,text),public.manager_save_room(text,text,numeric,integer,text) to authenticated;
revoke execute on function public.create_employee(text,text,text,text,text,numeric,date,text,text) from authenticated;

revoke insert, update on public.rooms from authenticated;
