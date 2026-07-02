-- Enable RLS on court_schedules and add staff policies
-- Fixes: "Error al guardar los horarios" caused by missing INSERT/UPDATE/DELETE policies

alter table court_schedules enable row level security;

-- Staff (owner, admin, manager) can manage schedules for their org's courts
create policy "Staff can insert schedules for their org courts"
  on court_schedules for insert
  with check (
    exists (
      select 1 from courts c
      join profiles p on p.org_id = c.org_id
      where c.id = court_id
        and p.id = auth.uid()
        and p.role in ('owner', 'admin', 'manager')
    )
  );

create policy "Staff can update schedules for their org courts"
  on court_schedules for update
  using (
    exists (
      select 1 from courts c
      join profiles p on p.org_id = c.org_id
      where c.id = court_id
        and p.id = auth.uid()
        and p.role in ('owner', 'admin', 'manager')
    )
  )
  with check (
    exists (
      select 1 from courts c
      join profiles p on p.org_id = c.org_id
      where c.id = court_id
        and p.id = auth.uid()
        and p.role in ('owner', 'admin', 'manager')
    )
  );

create policy "Staff can delete schedules for their org courts"
  on court_schedules for delete
  using (
    exists (
      select 1 from courts c
      join profiles p on p.org_id = c.org_id
      where c.id = court_id
        and p.id = auth.uid()
        and p.role in ('owner', 'admin', 'manager')
    )
  );

-- Staff can read schedules for their org courts
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
