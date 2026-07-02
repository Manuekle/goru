-- Tournament system: competitions, team registration, fixtures

do $$ begin
  create type tournament_status as enum ('draft', 'open', 'active', 'finished');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type tournament_payment_status as enum ('pending', 'paid');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type match_status as enum ('scheduled', 'playing', 'finished', 'cancelled');
exception when duplicate_object then null;
end $$;

-- Tournament definition
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

create index if not exists tournaments_org_id_idx on tournaments (org_id);
create index if not exists tournaments_status_idx on tournaments (status);

-- Teams registered in a tournament
create table if not exists tournament_teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  team_name text not null,
  captain_name text not null,
  captain_phone text not null,
  captain_email text,
  payment_status tournament_payment_status not null default 'pending',
  payment_method text,
  registered_at timestamptz not null default now()
);

create index if not exists tournament_teams_tournament_idx on tournament_teams (tournament_id);

-- Fixture matches
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

create index if not exists tournament_matches_tournament_idx on tournament_matches (tournament_id, round);

-- RLS

alter table tournaments enable row level security;
alter table tournament_teams enable row level security;
alter table tournament_matches enable row level security;

-- Public can read open/active/finished tournaments
create policy "Public can read visible tournaments"
  on tournaments for select
  using (status in ('open', 'active', 'finished'));

-- Staff can manage their org's tournaments
create policy "Staff can manage their org tournaments"
  on tournaments for all
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.org_id = tournaments.org_id
        and p.role in ('owner', 'admin')
    )
  );

-- Public can insert tournament teams (registration)
create policy "Public can register teams"
  on tournament_teams for insert
  with check (true);

-- Public can read teams
create policy "Public can read tournament teams"
  on tournament_teams for select
  using (true);

-- Staff can manage teams
create policy "Staff can manage tournament teams"
  on tournament_teams for all
  using (
    exists (
      select 1 from tournaments t
      join profiles p on p.org_id = t.org_id
      where t.id = tournament_teams.tournament_id
        and p.id = auth.uid()
        and p.role in ('owner', 'admin')
    )
  );

-- Public can read matches
create policy "Public can read tournament matches"
  on tournament_matches for select
  using (true);

-- Staff can manage matches
create policy "Staff can manage tournament matches"
  on tournament_matches for all
  using (
    exists (
      select 1 from tournaments t
      join profiles p on p.org_id = t.org_id
      where t.id = tournament_matches.tournament_id
        and p.id = auth.uid()
        and p.role in ('owner', 'admin')
    )
  );
