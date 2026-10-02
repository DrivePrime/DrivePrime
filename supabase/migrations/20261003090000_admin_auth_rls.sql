-- Security fix: replace the public (anon) access granted by the initial migration
-- with admin-only access backed by Supabase Auth.
--
-- Before: any visitor holding the anon/publishable key (shipped in the site's JS) could
-- read, insert, update and delete every reservation and vehicle.
-- After: only authenticated users listed in public.admin_users can touch the data.
--
-- The script is idempotent: it can be run again safely.
--
-- After applying, create the admin account in Supabase Auth (Authentication > Users),
-- then register it as admin:
--   insert into public.admin_users (user_id)
--   select id from auth.users where email = 'ADMIN_EMAIL_HERE';

-- 1. Admin membership table ---------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.admin_users force row level security;

-- No client role reads or writes this table directly (not even signed-in users):
-- the app only calls public.is_admin(). Membership is managed from the Supabase
-- dashboard / SQL editor. RLS stays on with no policy = deny all through the API.
drop policy if exists "admins read own membership" on public.admin_users;
revoke all on table public.admin_users from anon, authenticated;

-- 2. Admin check ------------------------------------------------------------------------
-- SECURITY DEFINER so policies can check membership without recursive RLS evaluation;
-- empty search_path + qualified names so the function cannot be hijacked.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 3. Remove the public policies -----------------------------------------------------------
drop policy if exists "public read vehicules" on public.vehicules;
drop policy if exists "public write vehicules" on public.vehicules;
drop policy if exists "public update vehicules" on public.vehicules;
drop policy if exists "public delete vehicules" on public.vehicules;
drop policy if exists "public read reservations" on public.reservations;
drop policy if exists "public write reservations" on public.reservations;
drop policy if exists "public update reservations" on public.reservations;
drop policy if exists "public delete reservations" on public.reservations;

-- 4. Admin-only policies --------------------------------------------------------------------
alter table public.vehicules enable row level security;
alter table public.reservations enable row level security;

drop policy if exists "admins manage vehicules" on public.vehicules;
create policy "admins manage vehicules" on public.vehicules
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "admins manage reservations" on public.reservations;
create policy "admins manage reservations" on public.reservations
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- 5. Defense in depth: the anonymous role gets no table privileges at all.
revoke all on table public.vehicules from anon;
revoke all on table public.reservations from anon;
