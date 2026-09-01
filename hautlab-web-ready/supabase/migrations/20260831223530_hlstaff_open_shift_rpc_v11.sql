create or replace function public.hlstaff_open_shift()
returns setof public.hlstaff_shifts
language sql
stable
security definer
set search_path=public
as $$
  select s.*
  from public.hlstaff_shifts s
  where s.staff_id=auth.uid() and s.check_out_at is null
  order by s.check_in_at desc
  limit 1;
$$;

revoke execute on function public.hlstaff_open_shift() from public,anon;
grant execute on function public.hlstaff_open_shift() to authenticated;
