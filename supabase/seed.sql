-- ============================================
-- SEED: Goru Pádel Club — datos de prueba
-- Ejecutar en Supabase SQL Editor o psql
-- ============================================
-- Requiere: usuario test@goru.dev / Test1234!
-- creado previamente via Auth API o dashboard.
-- El trigger handle_new_user() crea el perfil.
-- ============================================

-- Organization
INSERT INTO organizations (id, name, slug, phone, address, timezone)
VALUES (
  'd0000000-0000-0000-0000-000000000001',
  'Goru Pádel Club',
  'goru-padel',
  '+525512345678',
  'Av. Revolución 1234, CDMX',
  'America/Mexico_City'
);

-- Asignar perfil del usuario test al org
UPDATE profiles
SET org_id = 'd0000000-0000-0000-0000-000000000001',
    role = 'owner'
WHERE id = (SELECT id FROM auth.users WHERE email = 'test@goru.dev' LIMIT 1);

-- Courts (3)
INSERT INTO courts (id, org_id, name, surface, capacity, active)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Cancha 1 - Central', 'synthetic', 4, true),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Cancha 2 - Norte',   'synthetic', 4, true),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'Cancha 3 - Sur',     'synthetic', 4, true);

-- Court schedules (Mon-Sun, 7:00-22:00, 90 min slots, $250 MXN)
INSERT INTO court_schedules (id, court_id, day_of_week, open_time, close_time, slot_duration_minutes, price_per_slot)
SELECT
  gen_random_uuid(),
  c.id,
  d.dow,
  '07:00'::time,
  '22:00'::time,
  90,
  250
FROM courts c
CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS d(dow)
WHERE c.org_id = 'd0000000-0000-0000-0000-000000000001';

-- Clients (5)
INSERT INTO clients (id, org_id, full_name, phone, email)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Carlos Mendoza',   '+525510010101', 'carlos@email.com'),
  ('a0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'María González',   '+525520020202', 'maria@email.com'),
  ('a0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'Luis Hernández',   '+525530030303', 'luis@email.com'),
  ('a0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'Ana Torres',       '+525540040404', 'ana@email.com'),
  ('a0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', 'Pedro Ramírez',    '+525550050505', 'pedro@email.com');

-- Bookings (today + tomorrow)
INSERT INTO bookings (id, org_id, court_id, client_id, start_time, end_time, status, total_price, source, payment_status, notes)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', now()::date + '08:00'::time,  now()::date + '09:30'::time,  'confirmed', 250, 'admin',  'paid',    'Clase con coach'),
  ('b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', now()::date + '10:00'::time, now()::date + '11:30'::time, 'confirmed', 250, 'admin',  'paid',    ''),
  ('b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', now()::date + '09:00'::time, now()::date + '10:30'::time, 'confirmed', 250, 'admin',  'pending', ''),
  ('b0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', now()::date + '16:00'::time, now()::date + '17:30'::time, 'confirmed', 250, 'widget', 'paid',    'Reservó por web'),
  ('b0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', (now()::date + '1 day'::interval)::date + '08:00'::time, (now()::date + '1 day'::interval)::date + '09:30'::time, 'confirmed', 250, 'admin', 'paid', 'Torneo amistoso'),
  ('b0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', (now()::date + '1 day'::interval)::date + '11:00'::time, (now()::date + '1 day'::interval)::date + '12:30'::time, 'confirmed', 250, 'admin', 'paid', 'Partido semanal'),
  ('b0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', now()::date + '18:00'::time, now()::date + '19:30'::time, 'pending',  250, 'widget','pending', 'Pendiente de confirmar');

-- Notifications
INSERT INTO notifications (id, org_id, booking_id, type, title, body)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'booking_created',  'Nueva reserva',  'Carlos Mendoza reservó Cancha 1'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'booking_created',  'Nueva reserva',  'María González reservó Cancha 1'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'payment_received', 'Pago recibido',  'Ana Torres pagó $250 por web');

-- Tournament
INSERT INTO tournaments (id, org_id, name, description, start_date, end_date, registration_open, max_teams, price_per_team, status)
VALUES (
  'f0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Torneo Apertura 2026',
  'Torneo de apertura Goru Pádel Club. Categoría única.',
  current_date + 14,
  current_date + 16,
  true,
  16,
  500,
  'open'
);

-- Tournament teams
INSERT INTO tournament_teams (id, tournament_id, team_name, captain_name, captain_phone, payment_status)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Los Padelistas', 'Carlos Mendoza',  '+525510010101', 'paid'),
  ('10000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'Smash Girls',    'Ana Torres',      '+525540040404', 'paid'),
  ('10000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'Veteranos MX',   'Luis Hernández',  '+525530030303', 'pending');

-- Tournament matches
INSERT INTO tournament_matches (id, tournament_id, round, match_number, team_a_id, team_b_id, court_id, scheduled_at, status)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 1, 1, '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', (current_date + 14)::timestamptz + '09:00'::time,  'scheduled'),
  ('20000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 1, 2, '10000000-0000-0000-0000-000000000003', NULL,                                                 'c0000000-0000-0000-0000-000000000002', (current_date + 14)::timestamptz + '10:30'::time, 'scheduled');
