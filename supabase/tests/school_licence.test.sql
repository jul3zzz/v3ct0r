-- School licence (phase 1b): kinds, seats, devices, relays of phase 1 and admin. Run: npm run db:test.
-- One transaction, rolled back: now() is the same for every statement.
begin;
create extension if not exists pgtap with schema extensions;
select plan(45);

-- ── fixtures (as postgres) ─────────────────────────────────────────────
insert into school.schools (id, slug, name, accent, start_route)
values ('30000000-0000-0000-0000-000000000001', 'lycee-lic', 'Lycée Licence', '#118844', '#/learn');
insert into school.trial_keys (school_id, key_hash, kind, seats, ends_at, label) values
  ('30000000-0000-0000-0000-000000000001', school.code_hash('AAAAA-BBBBB-CCCCC-DDDDD'), 'licence', 2, now() + interval '300 days', 'lic'),
  ('30000000-0000-0000-0000-000000000001', school.code_hash('EEEEE-FFFFF-GGGGG-HHHHH'), 'licence', 5, now() - interval '1 day', 'lic-ended'),
  ('30000000-0000-0000-0000-000000000001', school.code_hash('JJJJJ-KKKKK-MMMMM-NNNNN'), 'trial', 0, now() + interval '30 days', 'trial');

-- ── structure ──────────────────────────────────────────────────────────
select has_table('school', 'devices', 'school.devices exists');
select ok((select c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'school' and c.relname = 'devices'), 'RLS is on for school.devices');
select throws_ok($$insert into school.trial_keys (school_id, key_hash, kind, seats, ends_at) values ('30000000-0000-0000-0000-000000000001', school.code_hash('x1'), 'trial', 3, now() + interval '1 day')$$, '23514', null, 'a trial key has no seat limit');
select throws_ok($$insert into school.trial_keys (school_id, key_hash, kind, ends_at) values ('30000000-0000-0000-0000-000000000001', school.code_hash('x2'), 'other', now() + interval '1 day')$$, '23514', null, 'only trial and licence keys');
select ok(has_function_privilege('anon', 'public.key_open(text, text)', 'execute'), 'anon can open a key');
select ok(has_function_privilege('anon', 'public.key_ping(text, integer, text)', 'execute'), 'anon can ping a key');
select ok(not has_function_privilege('anon', 'public.admin_key_create(text, text, text, timestamptz, integer, text)', 'execute'), 'anon cannot create a key');
select ok(not has_function_privilege('authenticated', 'public.admin_devices_reset(uuid)', 'execute'), 'authenticated cannot reset devices');
select ok(not has_function_privilege('anon', 'public.admin_report()', 'execute'), 'anon cannot read the report');

-- ── seats ──────────────────────────────────────────────────────────────
set local role anon;
select throws_ok('select * from school.devices', '42501', null, 'anon cannot read school.devices');
select results_eq(
  $$select state, kind, school_name, seats, seats_used from public.key_open('aaaaa-bbbbb-ccccc-ddddd', repeat('a', 64))$$,
  $$values ('active'::text, 'licence'::text, 'Lycée Licence'::text, 2, 1)$$,
  'a licence opens on a first device, which takes a seat');
select results_eq(
  $$select state, seats_used from public.key_open('AAAAABBBBBCCCCCDDDDD', repeat('b', 64))$$,
  $$values ('active'::text, 2)$$,
  'the last seat goes to a second device');
select is((select state from public.key_open('AAAAABBBBBCCCCCDDDDD', repeat('c', 64))), 'full', 'a third device finds every seat taken');
select results_eq(
  $$select state, seats_used from public.key_open('AAAAABBBBBCCCCCDDDDD', repeat('a', 64))$$,
  $$values ('active'::text, 2)$$,
  'a device already seen keeps its seat');
select is((select state from public.key_open('AAAAABBBBBCCCCCDDDDD', null)), 'full', 'no device: no seat on a licence');
select is((select state from public.key_open('AAAAABBBBBCCCCCDDDDD', 'not-a-device')), 'full', 'a malformed device takes no seat');
select is((select state from public.key_open('AAAAABBBBBCCCCCDDDDD', upper(repeat('d', 64)))), 'full', 'a device id is lower-case hex only');
select is((select state from public.key_open('EEEEE-FFFFF-GGGGG-HHHHH', repeat('a', 64))), 'expired', 'an ended licence is expired');
select results_eq(
  $$select state, kind, seats from public.key_open('JJJJJ-KKKKK-MMMMM-NNNNN', null)$$,
  $$values ('active'::text, 'trial'::text, 0)$$,
  'a trial needs no device');
select is((select count(*) from public.key_open('ZZZZZ', repeat('a', 64))), 1::bigint, 'key_open returns exactly one row');
select results_eq(
  $$select state, school_name, kind from public.key_open('ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ', repeat('a', 64))$$,
  $$values ('unknown'::text, null::text, null::text)$$,
  'an unknown key reveals nothing');
select is((select state from public.key_ping('AAAAABBBBBCCCCCDDDDD', 60, repeat('c', 64))), 'full', 'a ping from a device without a seat is full');
select is((select state from public.key_ping('AAAAABBBBBCCCCCDDDDD', 60, repeat('b', 64))), 'active', 'a ping from a seated device is active');
-- phase 1 relays (builds already published send no device)
select is((select state from public.trial_open('JJJJJ-KKKKK-MMMMM-NNNNN')), 'active', 'trial_open still opens a trial');
select is((select state from public.trial_ping('JJJJJ-KKKKK-MMMMM-NNNNN', 30)), 'active', 'trial_ping still pings a trial');
select is((select state from public.trial_open('AAAAA-BBBBB-CCCCC-DDDDD')), 'full', 'a phase 1 build cannot hold a licence seat');
reset role;

select is((select count(*) from school.devices v join school.trial_keys t on t.id = v.key_id where t.label = 'lic'), 2::bigint, 'two devices hold the two seats');
select is((select count(*) from school.devices v join school.trial_keys t on t.id = v.key_id where t.label in ('lic-ended', 'trial')), 0::bigint, 'an ended licence and a trial store no device');
select is((select visits from school.trial_keys where label = 'lic'), 8, 'every opening of a known key is a visit, full ones too');

-- ── admin (service_role) ───────────────────────────────────────────────
set local role service_role;
select lives_ok($$select * from public.admin_key_create('lycee-lic', 'c289702edd18b0b589e69a25d0b35ae14cb23b96bdbd064352e1d815485ee94e', 'licence', now() + interval '1 year', 30, 'labo')$$, 'service_role creates a licence from its hash');
select throws_ok($$select * from public.admin_key_create('lycee-lic', repeat('1', 64), 'trial', now() + interval '10 days', 5)$$, 'P0001', 'bad_seats', 'a trial with seats is refused');
select throws_ok($$select * from public.admin_key_create('lycee-lic', repeat('2', 64), 'licence', now() + interval '10 days', 0)$$, 'P0001', 'bad_seats', 'a licence without seats is refused');
select throws_ok($$select * from public.admin_key_create('lycee-lic', repeat('3', 64), 'licence', now() + interval '4 years', 10)$$, 'P0001', 'bad_end', 'a licence of more than 3 years is refused');
select throws_ok($$select * from public.admin_key_create('lycee-lic', repeat('4', 64), 'trial', now() + interval '400 days')$$, 'P0001', 'bad_end', 'a trial of more than 366 days is refused');
select throws_ok($$select * from public.admin_key_create('lycee-lic', repeat('5', 64), 'gift', now() + interval '10 days')$$, 'P0001', 'bad_kind', 'an unknown kind is refused');
select results_eq(
  $$select kind, seats, seats_used from public.admin_report() where label = 'lic'$$,
  $$values ('licence'::text, 2, 2)$$,
  'the report gives the kind and the seats used');
select is((select count(*) from public.admin_devices((select key_id from public.admin_report() where label = 'lic'))), 2::bigint, 'admin_devices lists the two devices');
select is((select max(char_length(device)) from public.admin_devices((select key_id from public.admin_report() where label = 'lic'))), 8, 'only the start of a device id is shown');
select is(public.admin_devices_reset((select key_id from public.admin_report() where label = 'lic')), 2, 'devices reset: two seats let go');
reset role;

set local role anon;
select is((select state from public.key_open('AAAAABBBBBCCCCCDDDDD', repeat('c', 64))), 'active', 'after the reset a new device gets a seat');
select is((select seats_used from public.key_open('RRRRR-SSSSS-TTTTT-VVVVV', repeat('a', 64))), 1, 'the new licence takes its first seat');
reset role;

-- a key copied out of the school: a new key, the old one stops
set local role service_role;
select lives_ok($$select * from public.admin_key_rotate((select key_id from public.admin_report() where label = 'lic'), 'e564794d5ceed85df494a7fc383aa372663e12ee319fafec342c75e5d6877123')$$, 'service_role rotates a key');
reset role;
set local role anon;
select is((select state from public.key_open('AAAAABBBBBCCCCCDDDDD', repeat('c', 64))), 'disabled', 'the old key is disabled');
select results_eq(
  $$select state, kind, seats, seats_used from public.key_open('WWWWW-XXXXX-YYYYY-ZZZZZ', repeat('c', 64))$$,
  $$values ('active'::text, 'licence'::text, 2, 1)$$,
  'the new key keeps the kind and the seats, devices start again');
reset role;
select is((select ends_at from school.trial_keys where label = 'lic (nouvelle clé)'), (select ends_at from school.trial_keys where label = 'lic'), 'the new key ends with the old one');

select * from finish();
rollback;
