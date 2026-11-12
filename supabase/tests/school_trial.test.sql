-- School trial (phase 1): row level security, privileges and API. Run: npm run db:test (Docker).
-- Everything runs in one transaction that is rolled back: now() is the same for every statement.
begin;
create extension if not exists pgtap with schema extensions;
select plan(49);

-- ── fixtures (as postgres) ─────────────────────────────────────────────
insert into school.schools (id, slug, name, accent, start_route)
values ('10000000-0000-0000-0000-000000000001', 'lycee-test', 'Lycée Test', '#3366ff', '#/learn/riemann');
insert into school.trial_keys (school_id, key_hash, ends_at, label, disabled) values
  ('10000000-0000-0000-0000-000000000001', school.code_hash('AAAAA-BBBBB-CCCCC-DDDDD'), now() + interval '30 days', 'active', false),
  ('10000000-0000-0000-0000-000000000001', school.code_hash('EEEEE-FFFFF-GGGGG-HHHHH'), now() - interval '1 day', 'expired', false),
  ('10000000-0000-0000-0000-000000000001', school.code_hash('JJJJJ-KKKKK-MMMMM-NNNNN'), now() + interval '30 days', 'disabled', true);

-- ── structure ──────────────────────────────────────────────────────────
select ok((select bool_and(c.relrowsecurity) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'school' and c.relkind = 'r'), 'RLS is on for every school table');
-- counts of the whole schema (phase 1 + 1b: school_licence.test.sql)
select is((select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'school' and c.relkind = 'r'), 4::bigint, 'four school tables');
select is((select count(*) from pg_policies where schemaname = 'school'), 0::bigint, 'no policy: everything is denied');
select ok(not has_schema_privilege('anon', 'school', 'usage'), 'anon has no usage on schema school');
select ok(not has_schema_privilege('authenticated', 'school', 'usage'), 'authenticated has no usage on schema school');
select ok(not has_schema_privilege('service_role', 'school', 'usage'), 'service_role goes through the admin functions only');
select is(
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and (p.proname like 'trial\_%' or p.proname like 'key\_%' or p.proname like 'admin\_%')),
  17::bigint, 'seventeen API functions');
select is(
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and (p.proname like 'trial\_%' or p.proname like 'key\_%' or p.proname like 'admin\_%')
      and (not p.prosecdef or not ('search_path=""' = any(coalesce(p.proconfig, '{}'))))),
  0::bigint, 'every API function is security definer with an empty search_path');
select ok(not has_function_privilege('anon', 'public.admin_trial_report()', 'execute'), 'anon cannot execute admin functions');
select ok(not has_function_privilege('authenticated', 'public.admin_trial_create(text, text, integer, text)', 'execute'), 'authenticated cannot execute admin functions');
select ok(has_function_privilege('anon', 'public.trial_open(text)', 'execute'), 'anon can open a trial');

-- ── anonymous visitor ──────────────────────────────────────────────────
set local role anon;
select throws_ok('select * from school.schools', '42501', null, 'anon cannot read school.schools');
select throws_ok('select * from school.trial_keys', '42501', null, 'anon cannot read school.trial_keys');
select throws_ok('select * from school.attempts', '42501', null, 'anon cannot read school.attempts');
select throws_ok($$select school.code_hash('x')$$, '42501', null, 'anon cannot call the helpers');
select results_eq(
  $$select state, school_name, accent, start_route from public.trial_open('aaaaa bbbbb ccccc ddddd')$$,
  $$values ('active'::text, 'Lycée Test'::text, '#3366ff'::text, '#/learn/riemann'::text)$$,
  'a good key opens the trial (case and separators ignored)');
select is((select state from public.trial_open('EEEEE-FFFFF-GGGGG-HHHHH')), 'expired', 'an ended key is expired');
select is((select state from public.trial_open('JJJJJ-KKKKK-MMMMM-NNNNN')), 'disabled', 'a disabled key is disabled');
select is((select state from public.trial_open('ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ')), 'unknown', 'an unknown key is unknown');
select is((select count(*) from public.trial_open('nope')), 1::bigint, 'trial_open returns exactly one row');
select is((select school_name from public.trial_open('ZZZZZ')), null, 'an unknown key reveals nothing');
select is((select count(*) from public.trial_open(null)), 1::bigint, 'a missing key returns one row too');
select throws_ok('select * from public.admin_trial_report()', '42501', null, 'anon cannot read the report');
select throws_ok($$select public.admin_school_upsert('x-x', 'X X')$$, '42501', null, 'anon cannot create a school');
select throws_ok($$select * from public.admin_trial_create('lycee-test', repeat('a', 64), 30)$$, '42501', null, 'anon cannot create a key');
select is((select count(*) from public.progress), 0::bigint, 'anon reads no progress row');
reset role;

select is((select visits from school.trial_keys where label = 'active'), 1, 'a visit is counted');
select isnt((select first_opened_at from school.trial_keys where label = 'active'), null, 'the first opening is dated');
select is((select failures from school.attempts where bucket = 'global'), 4, 'failed checks are counted');

-- ── time spent ─────────────────────────────────────────────────────────
update school.trial_keys set last_seen_at = now() - interval '1 hour' where label = 'active';
set local role anon;
select is((select state from public.trial_ping('AAAAABBBBBCCCCCDDDDD', 5000)), 'active', 'ping on an active key');
reset role;
select is((select seconds from school.trial_keys where label = 'active'), 900, 'a ping adds at most 900 s');
set local role anon;
select is((select state from public.trial_ping('AAAAABBBBBCCCCCDDDDD', 600)), 'active', 'second ping');
select is((select state from public.trial_ping('AAAAABBBBBCCCCCDDDDD', -50)), 'active', 'negative ping');
select is((select state from public.trial_ping('EEEEEFFFFFGGGGGHHHHH', 100)), 'expired', 'ping on an ended key');
reset role;
select is((select seconds from school.trial_keys where label = 'active'), 960, 'never more than the time elapsed since the last contact + 60 s');
select is((select seconds from school.trial_keys where label = 'expired'), 0, 'an ended key gains no time');

-- ── too many failures ──────────────────────────────────────────────────
update school.attempts set failures = 30 where bucket = 'global';
set local role anon;
select is((select state from public.trial_open('AAAAA-BBBBB-CCCCC-DDDDD')), 'busy', 'too many failures this minute: busy, even for a good key');
reset role;
delete from school.attempts;

-- ── admin (service_role) ───────────────────────────────────────────────
set local role service_role;
select lives_ok($$select public.admin_school_upsert('lycee-deux', 'Lycée Deux', null, '#ff8800', '#/4d/polytopes')$$, 'service_role creates a school');
-- sha256('PPPPPQQQQQRRRRRSSSSS')
select lives_ok($$select * from public.admin_trial_create('lycee-deux', 'f250d1966a76ddd9fcae4a9b7a25de21edb7fc1a94485dbf8f1d91551b9f9bf7', 14, 'test')$$, 'service_role creates a key from its hash');
select throws_ok($$select * from public.admin_trial_create('lycee-deux', 'PPPPP', 14)$$, 'P0001', 'bad_hash', 'a key in clear is refused');
select is((select count(*) from public.admin_trial_report() where school_slug = 'lycee-deux'), 1::bigint, 'the report lists the new key');
select ok((select public.admin_trial_extend((select key_id from public.admin_trial_report() where label = 'expired'), 10)) > now(), 'extend moves an ended key from now');
select lives_ok($$select public.admin_trial_disable((select key_id from public.admin_trial_report() where label = 'active'))$$, 'service_role disables a key');
select lives_ok($$select public.admin_school_status('lycee-deux', 'disabled')$$, 'service_role disables a school');
reset role;

set local role anon;
select is((select state from public.trial_ping('AAAAA-BBBBB-CCCCC-DDDDD', 10)), 'disabled', 'a disabled key stops a running session');
select is((select state from public.trial_open('EEEEE-FFFFF-GGGGG-HHHHH')), 'active', 'an extended key is active again');
select is((select state from public.trial_open('ppppp-qqqqq-rrrrr-sssss')), 'disabled', 'a disabled school disables its keys');
reset role;

-- ── progress stays private between users ───────────────────────────────
insert into auth.users (id, instance_id, aud, role, email) values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a@test.invalid'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@test.invalid');
insert into public.progress (user_id, data) values
  ('20000000-0000-0000-0000-000000000001', '{"notes.v1": "note a"}'),
  ('20000000-0000-0000-0000-000000000002', '{"notes.v1": "note b"}');
select set_config('request.jwt.claims', '{"sub": "20000000-0000-0000-0000-000000000001", "role": "authenticated"}', true);
set local role authenticated;
select results_eq('select user_id from public.progress', $$values ('20000000-0000-0000-0000-000000000001'::uuid)$$, 'a user reads only their own progress row');
select throws_ok('select * from school.schools', '42501', null, 'a signed-in user cannot read school.schools');
reset role;

select * from finish();
rollback;
