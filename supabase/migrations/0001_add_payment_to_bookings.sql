-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- Adds payment simulation fields to bookings.

create type booking_payment_status as enum ('pending', 'paid', 'refunded');
create type booking_payment_method as enum ('cash', 'card', 'transfer');

alter table bookings
  add column payment_status booking_payment_status not null default 'pending',
  add column payment_method booking_payment_method,
  add column paid_at timestamptz;

-- Existing confirmed bookings made before this column existed: assume paid
-- (admin-created or already-honored bookings), leave pending bookings untouched.
update bookings set payment_status = 'paid', paid_at = created_at where status = 'confirmed';
