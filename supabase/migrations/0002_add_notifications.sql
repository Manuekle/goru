-- Run after 0001_add_payment_to_bookings.sql in the Supabase SQL editor.
-- Internal inbox notifications (no email/push, just rows the dashboard reads).

create type notification_type as enum ('booking_created', 'booking_cancelled', 'payment_received');

create table notifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  type notification_type not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_org_id_created_at_idx on notifications (org_id, created_at desc);

alter table notifications enable row level security;

create policy "Staff can view their org notifications"
  on notifications for select
  using (org_id = my_org_id());

create policy "Staff can mark their org notifications as read"
  on notifications for update
  using (org_id = my_org_id())
  with check (org_id = my_org_id());

-- Booking creation/cancellation can be triggered by unauthenticated visitors
-- through the public widget, so inserts aren't restricted to staff sessions.
-- org_id is still constrained by the FK above.
create policy "Anyone can create a notification for a valid org"
  on notifications for insert
  with check (true);
