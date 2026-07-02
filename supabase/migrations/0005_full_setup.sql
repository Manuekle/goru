-- ═══════════════════════════════════════════════
-- GORU — Setup completo de base de datos
-- Ejecutar TODO JUNTO en Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Verificar que my_org_id() existe
create or replace function my_org_id() returns uuid as $$
  select org_id from profiles where id = auth.uid() limit 1;
$$ language sql stable security definer;

-- ═══ notifications ═══
do $$ begin
  create type notification_type as enum ('booking_created', 'booking_cancelled', 'payment_received');
exception when duplicate_object then null;
end $$;

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  type notification_type not null,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_org_id_created_at_idx on notifications (org_id, created_at desc);

alter table notifications enable row level security;

drop policy if exists "Staff can view their org notifications" on notifications;
create policy "Staff can view their org notifications"
  on notifications for select
  using (org_id = my_org_id());

drop policy if exists "Staff can mark their org notifications as read" on notifications;
create policy "Staff can mark their org notifications as read"
  on notifications for update
  using (org_id = my_org_id())
  with check (org_id = my_org_id());

drop policy if exists "Anyone can create a notification for a valid org" on notifications;
create policy "Anyone can create a notification for a valid org"
  on notifications for insert
  with check (true);

-- ═══ bookings ═══
alter table bookings enable row level security;

drop policy if exists "Public can insert bookings" on bookings;
create policy "Public can insert bookings"
  on bookings for insert
  with check (true);

drop policy if exists "Staff can view their org bookings" on bookings;
create policy "Staff can view their org bookings"
  on bookings for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.org_id = bookings.org_id
    )
  );

drop policy if exists "Staff can update their org bookings" on bookings;
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

drop policy if exists "Staff can delete their org bookings" on bookings;
create policy "Staff can delete their org bookings"
  on bookings for delete
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.org_id = bookings.org_id
    )
  );

-- ═══ court_schedules ═══
alter table court_schedules enable row level security;

drop policy if exists "Staff can insert schedules for their org courts" on court_schedules;
create policy "Staff can insert schedules for their org courts"
  on court_schedules for insert
  with check (
    exists (
      select 1 from courts c
      join profiles p on p.org_id = c.org_id
      where c.id = court_id
        and p.id = auth.uid()
        and p.role in ('owner', 'admin', 'receptionist', 'cashier')
    )
  );

drop policy if exists "Staff can update schedules for their org courts" on court_schedules;
create policy "Staff can update schedules for their org courts"
  on court_schedules for update
  using (
    exists (
      select 1 from courts c
      join profiles p on p.org_id = c.org_id
      where c.id = court_id
        and p.id = auth.uid()
        and p.role in ('owner', 'admin', 'receptionist', 'cashier')
    )
  )
  with check (
    exists (
      select 1 from courts c
      join profiles p on p.org_id = c.org_id
      where c.id = court_id
        and p.id = auth.uid()
        and p.role in ('owner', 'admin', 'receptionist', 'cashier')
    )
  );

drop policy if exists "Staff can delete schedules for their org courts" on court_schedules;
create policy "Staff can delete schedules for their org courts"
  on court_schedules for delete
  using (
    exists (
      select 1 from courts c
      join profiles p on p.org_id = c.org_id
      where c.id = court_id
        and p.id = auth.uid()
        and p.role in ('owner', 'admin', 'receptionist', 'cashier')
    )
  );

drop policy if exists "Staff can view their org court schedules" on court_schedules;
create policy "Staff can view their org court schedules"
  on court_schedules for select
  using (
    exists (
      select 1 from courts c
      join profiles p on p.org_id = c.org_id
      where c.id = court_id
        and p.id = auth.uid()
    )
  );

-- ═══ organizations ═══
alter table organizations enable row level security;

drop policy if exists "Public can read organizations by slug" on organizations;
create policy "Public can read organizations by slug"
  on organizations for select
  using (true);

drop policy if exists "Staff can update their own org" on organizations;
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

-- ═══ courts ═══
alter table courts enable row level security;

drop policy if exists "Public can read active courts" on courts;
create policy "Public can read active courts"
  on courts for select
  using (active = true);

drop policy if exists "Staff can view their org courts" on courts;
create policy "Staff can view their org courts"
  on courts for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.org_id = courts.org_id
    )
  );

drop policy if exists "Staff can insert courts for their org" on courts;
create policy "Staff can insert courts for their org"
  on courts for insert
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.org_id = org_id
        and p.role in ('owner', 'admin')
    )
  );

drop policy if exists "Staff can update their org courts" on courts;
create policy "Staff can update their org courts"
  on courts for update
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.org_id = courts.org_id
        and p.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.org_id = courts.org_id
        and p.role in ('owner', 'admin')
    )
  );

-- ═══ public widget read access ═══
-- The public booking widget needs to read these tables without auth

drop policy if exists "Public can read court schedules" on court_schedules;
create policy "Public can read court schedules"
  on court_schedules for select
  using (true);

drop policy if exists "Public can read bookings for slot checking" on bookings;
create policy "Public can read bookings for slot checking"
  on bookings for select
  using (true);

-- special_schedules table (may not exist yet — safe to skip)
do $$ begin
  alter table special_schedules enable row level security;
  drop policy if exists "Public can read special schedules" on special_schedules;
  create policy "Public can read special schedules"
    on special_schedules for select
    using (true);
  drop policy if exists "Staff can manage special schedules" on special_schedules;
  create policy "Staff can manage special schedules"
    on special_schedules for all
    using (
      exists (
        select 1 from courts c
        join profiles p on p.org_id = c.org_id
        where c.id = court_id
          and p.id = auth.uid()
          and p.role in ('owner', 'admin')
      )
    )
    with check (
      exists (
        select 1 from courts c
        join profiles p on p.org_id = c.org_id
        where c.id = court_id
          and p.id = auth.uid()
          and p.role in ('owner', 'admin')
      )
    );
exception when undefined_table then null;
end $$;

-- ═══ clients ═══
-- Public widget upserts clients by phone; staff manages them
do $$ begin
  alter table clients enable row level security;
  drop policy if exists "Public can upsert clients" on clients;
  create policy "Public can upsert clients"
    on clients for insert
    with check (true);
  drop policy if exists "Staff can view their org clients" on clients;
  create policy "Staff can view their org clients"
    on clients for select
    using (
      exists (
        select 1 from profiles p
        where p.id = auth.uid()
          and p.org_id = clients.org_id
      )
    );
  drop policy if exists "Staff can update their org clients" on clients;
  create policy "Staff can update their org clients"
    on clients for update
    using (
      exists (
        select 1 from profiles p
        where p.id = auth.uid()
          and p.org_id = clients.org_id
      )
    );
exception when undefined_table then null;
end $$;

-- Verificar resultado
select '✅ Setup completo' as status;
