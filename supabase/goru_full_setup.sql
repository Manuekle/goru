-- ═══════════════════════════════════════════════════════════════
-- GORU — Setup COMPLETO de base de datos
-- Ejecutar TODO JUNTO en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ═══ ENUMS ═══
do $$ begin create type profile_role as enum ('owner', 'admin', 'receptionist', 'cashier'); exception when duplicate_object then null; end $$;
do $$ begin create type court_surface as enum ('synthetic', 'natural', 'indoor', 'clay'); exception when duplicate_object then null; end $$;
do $$ begin create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'no_show'); exception when duplicate_object then null; end $$;
do $$ begin create type booking_source as enum ('admin', 'widget', 'phone'); exception when duplicate_object then null; end $$;
do $$ begin create type booking_payment_status as enum ('pending', 'paid', 'refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type booking_payment_method as enum ('cash', 'card', 'transfer'); exception when duplicate_object then null; end $$;
do $$ begin create type special_schedule_reason as enum ('maintenance', 'holiday', 'event', 'closed'); exception when duplicate_object then null; end $$;
do $$ begin create type notification_type as enum ('booking_created', 'booking_cancelled', 'payment_received', 'booking_checked_in'); exception when duplicate_object then null; end $$;
do $$ begin create type tournament_status as enum ('draft', 'open', 'active', 'finished'); exception when duplicate_object then null; end $$;
do $$ begin create type match_status as enum ('scheduled', 'playing', 'finished', 'cancelled'); exception when duplicate_object then null; end $$;

-- ═══ TABLAS ═══

-- organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  phone text,
  address text,
  timezone text not null default 'America/Argentina/Buenos_Aires',
  created_at timestamptz not null default now()
);

-- profiles (linked to auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid references organizations(id) on delete set null,
  role profile_role not null default 'receptionist',
  full_name text not null,
  phone text,
  created_at timestamptz not null default now()
);

-- courts
create table if not exists courts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  surface court_surface not null default 'synthetic',
  capacity int not null default 10 check (capacity between 2 and 100),
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- court_schedules
create table if not exists court_schedules (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  open_time text not null,
  close_time text not null,
  slot_duration_minutes int not null default 60 check (slot_duration_minutes in (30, 60, 90, 120)),
  price_per_slot numeric not null default 0,
  unique (court_id, day_of_week)
);

-- special_schedules
create table if not exists special_schedules (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts(id) on delete cascade,
  date date not null,
  open_time text,
  close_time text,
  price_per_slot numeric,
  reason special_schedule_reason not null,
  notes text
);

-- clients
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

-- bookings
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  court_id uuid not null references courts(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status booking_status not null default 'confirmed',
  notes text,
  total_price numeric not null default 0,
  source booking_source not null default 'admin',
  payment_status booking_payment_status not null default 'pending',
  payment_method booking_payment_method,
  paid_at timestamptz,
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);

-- invitations
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  role profile_role not null default 'receptionist',
  token text not null,
  invited_by uuid references profiles(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

-- notifications
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

-- tournaments
create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  start_date date not null,
  end_date date not null,
  registration_open boolean not null default false,
  registration_deadline date,
  max_teams int default 16,
  price_per_team numeric default 0,
  status tournament_status not null default 'draft',
  rules text,
  created_at timestamptz not null default now()
);

-- tournament_teams
create table if not exists tournament_teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  team_name text not null,
  captain_name text not null,
  captain_phone text not null,
  captain_email text,
  payment_status booking_payment_status not null default 'pending',
  payment_method text,
  registered_at timestamptz not null default now()
);

-- tournament_matches
create table if not exists tournament_matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  round int not null default 1,
  match_number int not null default 1,
  team_a_id uuid references tournament_teams(id) on delete set null,
  team_b_id uuid references tournament_teams(id) on delete set null,
  court_id uuid references courts(id) on delete set null,
  scheduled_at timestamptz,
  score_a int,
  score_b int,
  status match_status not null default 'scheduled',
  created_at timestamptz not null default now()
);

-- ═══ INDICES ═══
create index if not exists organizations_slug_idx on organizations (slug);
create index if not exists profiles_org_id_idx on profiles (org_id);
create index if not exists courts_org_id_idx on courts (org_id);
create index if not exists court_schedules_court_id_idx on court_schedules (court_id);
create index if not exists special_schedules_court_date_idx on special_schedules (court_id, date);
create index if not exists clients_org_id_idx on clients (org_id);
create index if not exists clients_phone_idx on clients (org_id, phone);
create index if not exists bookings_org_id_idx on bookings (org_id);
create index if not exists bookings_court_start_idx on bookings (court_id, start_time);
create index if not exists bookings_org_start_idx on bookings (org_id, start_time);
create index if not exists invitations_org_id_idx on invitations (org_id);
create index if not exists notifications_org_id_created_at_idx on notifications (org_id, created_at desc);
create index if not exists tournaments_org_id_idx on tournaments (org_id);
create index if not exists tournaments_status_idx on tournaments (status);
create index if not exists tournament_teams_tournament_idx on tournament_teams (tournament_id);
create index if not exists tournament_matches_tournament_idx on tournament_matches (tournament_id, round);

-- ═══ FUNCIONES ═══
create or replace function my_org_id() returns uuid as $$
  select org_id from profiles where id = auth.uid() limit 1;
$$ language sql stable security definer;

create or replace function my_role() returns profile_role as $$
  select role from profiles where id = auth.uid() limit 1;
$$ language sql stable security definer;

-- ═══ TRIGGER: auto-create profile on signup ═══
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ═══ RLS POLICIES ═══

-- ─── organizations ───
alter table organizations enable row level security;

drop policy if exists "Public can read organizations by slug" on organizations;
create policy "Public can read organizations by slug"
  on organizations for select using (true);

drop policy if exists "Staff can update their own org" on organizations;
create policy "Staff can update their own org"
  on organizations for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.org_id = organizations.id and p.role in ('owner', 'admin')))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.org_id = organizations.id and p.role in ('owner', 'admin')));

-- ─── profiles ───
alter table profiles enable row level security;

drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile"
  on profiles for select using (id = auth.uid());

drop policy if exists "Staff can read their org profiles" on profiles;
create policy "Staff can read their org profiles"
  on profiles for select using (exists (select 1 from profiles p where p.id = auth.uid() and p.org_id = profiles.org_id));

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update using (id = auth.uid());

-- ─── courts ───
alter table courts enable row level security;

drop policy if exists "Public can read active courts" on courts;
create policy "Public can read active courts"
  on courts for select using (active = true);

drop policy if exists "Staff can view their org courts" on courts;
create policy "Staff can view their org courts"
  on courts for select using (exists (select 1 from profiles p where p.id = auth.uid() and p.org_id = courts.org_id));

drop policy if exists "Staff can insert courts for their org" on courts;
create policy "Staff can insert courts for their org"
  on courts for insert
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.org_id = org_id and p.role in ('owner', 'admin')));

drop policy if exists "Staff can update their org courts" on courts;
create policy "Staff can update their org courts"
  on courts for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.org_id = courts.org_id and p.role in ('owner', 'admin')))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.org_id = courts.org_id and p.role in ('owner', 'admin')));

-- ─── court_schedules ───
alter table court_schedules enable row level security;

drop policy if exists "Public can read court schedules" on court_schedules;
create policy "Public can read court schedules"
  on court_schedules for select using (true);

drop policy if exists "Staff can view their org court schedules" on court_schedules;
create policy "Staff can view their org court schedules"
  on court_schedules for select
  using (exists (select 1 from courts c join profiles p on p.org_id = c.org_id where c.id = court_id and p.id = auth.uid()));

drop policy if exists "Staff can insert schedules for their org courts" on court_schedules;
create policy "Staff can insert schedules for their org courts"
  on court_schedules for insert
  with check (exists (select 1 from courts c join profiles p on p.org_id = c.org_id where c.id = court_id and p.id = auth.uid() and p.role in ('owner', 'admin', 'receptionist', 'cashier')));

drop policy if exists "Staff can update schedules for their org courts" on court_schedules;
create policy "Staff can update schedules for their org courts"
  on court_schedules for update
  using (exists (select 1 from courts c join profiles p on p.org_id = c.org_id where c.id = court_id and p.id = auth.uid() and p.role in ('owner', 'admin', 'receptionist', 'cashier')))
  with check (exists (select 1 from courts c join profiles p on p.org_id = c.org_id where c.id = court_id and p.id = auth.uid() and p.role in ('owner', 'admin', 'receptionist', 'cashier')));

drop policy if exists "Staff can delete schedules for their org courts" on court_schedules;
create policy "Staff can delete schedules for their org courts"
  on court_schedules for delete
  using (exists (select 1 from courts c join profiles p on p.org_id = c.org_id where c.id = court_id and p.id = auth.uid() and p.role in ('owner', 'admin', 'receptionist', 'cashier')));

-- ─── special_schedules ───
alter table special_schedules enable row level security;

drop policy if exists "Public can read special schedules" on special_schedules;
create policy "Public can read special schedules"
  on special_schedules for select using (true);

drop policy if exists "Staff can manage special schedules" on special_schedules;
create policy "Staff can manage special schedules"
  on special_schedules for all
  using (exists (select 1 from courts c join profiles p on p.org_id = c.org_id where c.id = court_id and p.id = auth.uid() and p.role in ('owner', 'admin')))
  with check (exists (select 1 from courts c join profiles p on p.org_id = c.org_id where c.id = court_id and p.id = auth.uid() and p.role in ('owner', 'admin')));

-- ─── clients ───
alter table clients enable row level security;

drop policy if exists "Public can upsert clients" on clients;
create policy "Public can upsert clients"
  on clients for insert with check (true);

drop policy if exists "Staff can view their org clients" on clients;
create policy "Staff can view their org clients"
  on clients for select using (exists (select 1 from profiles p where p.id = auth.uid() and p.org_id = clients.org_id));

drop policy if exists "Staff can update their org clients" on clients;
create policy "Staff can update their org clients"
  on clients for update using (exists (select 1 from profiles p where p.id = auth.uid() and p.org_id = clients.org_id));

-- ─── bookings ───
alter table bookings enable row level security;

drop policy if exists "Public can insert bookings" on bookings;
create policy "Public can insert bookings"
  on bookings for insert with check (true);

drop policy if exists "Public can read bookings for slot checking" on bookings;
create policy "Public can read bookings for slot checking"
  on bookings for select using (true);

drop policy if exists "Staff can view their org bookings" on bookings;
create policy "Staff can view their org bookings"
  on bookings for select using (exists (select 1 from profiles p where p.id = auth.uid() and p.org_id = bookings.org_id));

drop policy if exists "Staff can update their org bookings" on bookings;
create policy "Staff can update their org bookings"
  on bookings for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.org_id = bookings.org_id))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.org_id = bookings.org_id));

drop policy if exists "Staff can delete their org bookings" on bookings;
create policy "Staff can delete their org bookings"
  on bookings for delete using (exists (select 1 from profiles p where p.id = auth.uid() and p.org_id = bookings.org_id));

-- ─── invitations ───
alter table invitations enable row level security;

drop policy if exists "Staff can manage invitations" on invitations;
create policy "Staff can manage invitations"
  on invitations for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.org_id = invitations.org_id and p.role in ('owner', 'admin')));

-- ─── notifications ───
alter table notifications enable row level security;

drop policy if exists "Staff can view their org notifications" on notifications;
create policy "Staff can view their org notifications"
  on notifications for select using (org_id = my_org_id());

drop policy if exists "Staff can mark their org notifications as read" on notifications;
create policy "Staff can mark their org notifications as read"
  on notifications for update using (org_id = my_org_id()) with check (org_id = my_org_id());

drop policy if exists "Anyone can create a notification for a valid org" on notifications;
create policy "Anyone can create a notification for a valid org"
  on notifications for insert with check (true);

-- ─── tournaments ───
alter table tournaments enable row level security;

drop policy if exists "Public can read visible tournaments" on tournaments;
create policy "Public can read visible tournaments"
  on tournaments for select using (status in ('open', 'active', 'finished'));

drop policy if exists "Staff can manage their org tournaments" on tournaments;
create policy "Staff can manage their org tournaments"
  on tournaments for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.org_id = tournaments.org_id and p.role in ('owner', 'admin')));

-- ─── tournament_teams ───
alter table tournament_teams enable row level security;

drop policy if exists "Public can register teams" on tournament_teams;
create policy "Public can register teams"
  on tournament_teams for insert with check (true);

drop policy if exists "Public can read tournament teams" on tournament_teams;
create policy "Public can read tournament teams"
  on tournament_teams for select using (true);

drop policy if exists "Staff can manage tournament teams" on tournament_teams;
create policy "Staff can manage tournament teams"
  on tournament_teams for all
  using (exists (select 1 from tournaments t join profiles p on p.org_id = t.org_id where t.id = tournament_teams.tournament_id and p.id = auth.uid() and p.role in ('owner', 'admin')));

-- ─── tournament_matches ───
alter table tournament_matches enable row level security;

drop policy if exists "Public can read tournament matches" on tournament_matches;
create policy "Public can read tournament matches"
  on tournament_matches for select using (true);

drop policy if exists "Staff can manage tournament matches" on tournament_matches;
create policy "Staff can manage tournament matches"
  on tournament_matches for all
  using (exists (select 1 from tournaments t join profiles p on p.org_id = t.org_id where t.id = tournament_matches.tournament_id and p.id = auth.uid() and p.role in ('owner', 'admin')));

-- ═══ VERIFICACION ═══
select '✅ Setup completo — Goru DB lista' as status;
