-- QR Tickets & Check-in system
-- Add checked_in_at to bookings so we can track when a client arrives
-- Add booking_checked_in notification type

alter table bookings
  add column if not exists checked_in_at timestamptz;

-- Extend notification_type to include check-in events
do $$ begin
  alter type notification_type add value 'booking_checked_in';
exception when duplicate_object then null;
end $$;
