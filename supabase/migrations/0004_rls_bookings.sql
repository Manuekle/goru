-- RLS policies for bookings table
-- Fixes: bookings from public widget not appearing in admin panel

alter table bookings enable row level security;

-- Public widget: anyone can create a booking (validated by the API route)
create policy "Public can insert bookings"
  on bookings for insert
  with check (true);

-- Staff can view/edit bookings for their org
create policy "Staff can view their org bookings"
  on bookings for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.org_id = bookings.org_id
    )
  );

create policy "Staff can update their org bookings"
  on bookings for update
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.org_id = bookings.org_id
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.org_id = bookings.org_id
    )
  );

create policy "Staff can delete their org bookings"
  on bookings for delete
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.org_id = bookings.org_id
    )
  );

-- Also fix: organizations table needs public read for the widget
alter table organizations enable row level security;

create policy "Public can read organizations by slug"
  on organizations for select
  using (true);

-- Staff can manage their own org
create policy "Staff can update their own org"
  on organizations for update
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.org_id = organizations.id
        and p.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.org_id = organizations.id
        and p.role in ('owner', 'admin')
    )
  );
