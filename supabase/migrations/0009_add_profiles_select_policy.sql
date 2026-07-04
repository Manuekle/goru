-- ======================================================
-- FIX: Restore SELECT policy for profiles
-- ======================================================
-- Context: Migration 0008 dropped "Staff can read their
-- org profiles" due to recursion, but added no replacement.
-- This means RLS blocks ALL select on profiles for regular
-- authenticated users, breaking every server action that
-- queries profiles (courts, bookings, clients, etc.).
--
-- Solution: Let users read their own profile row directly.
-- No org scoping needed — self-read is inherently safe
-- and avoids recursion entirely (no subquery on profiles).

create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid());
