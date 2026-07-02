-- ======================================================
-- FIX: Infinite recursion in RLS policy for "profiles"
-- ======================================================
-- Root cause: (1) my_org_id() queried public.profiles.
-- (2) "Staff can read their org profiles" policy had
--     self-referencing subquery on profiles.
-- PostgreSQL detects either as infinite recursion.
--
-- Solution:
-- - my_org_id() reads auth.users.raw_app_meta_data (no RLS)
-- - Drop self-referencing policy (duplicate of read same org)
-- - Trigger syncs profiles.org_id -> auth.users metadata

-- 1. Private schema for internal helpers
create schema if not exists private;

-- 2. Trigger: sync profiles.org_id -> auth.users.raw_app_meta_data
create or replace function private.sync_org_id_to_jwt() returns trigger as $$
begin
  update auth.users
  set raw_app_meta_data = 
    case 
      when new.org_id is null then 
        raw_app_meta_data - 'org_id'
      else 
        raw_app_meta_data || jsonb_build_object('org_id', new.org_id)
    end
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer set search_path = '';

drop trigger if exists on_profile_org_change on public.profiles;
create trigger on_profile_org_change
  after insert or update of org_id on public.profiles
  for each row execute function private.sync_org_id_to_jwt();

-- 3. Rewrite my_org_id(): reads auth.users (NO RLS, no recursion)
create or replace function public.my_org_id() returns uuid as $$
  select (raw_app_meta_data ->> 'org_id')::uuid
  from auth.users
  where id = auth.uid()
  limit 1;
$$ language sql stable security definer set search_path = '';

-- 4. Safety: ensure function owner bypasses RLS (belt and suspenders)
alter table public.profiles no force row level security;

-- 5. Drop self-referencing policy (subquery on profiles inside profiles RLS)
drop policy if exists "Staff can read their org profiles" on public.profiles;

-- 6. Backfill: sync existing profiles.org_id into auth.users metadata
do $$
declare
  r record;
begin
  for r in select id, org_id from public.profiles where org_id is not null loop
    update auth.users
    set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('org_id', r.org_id)
    where id = r.id
      and (raw_app_meta_data ->> 'org_id') is distinct from r.org_id::text;
  end loop;
end;
$$;
