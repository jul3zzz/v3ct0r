-- Two apps: key_check, the check of the website before it downloads V3CT0R Lycée. Run: npm run db:test.
begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

insert into school.schools (id, slug, name) values ('40000000-0000-0000-0000-000000000001', 'lycee-ed', 'Lycée Édition');
insert into school.trial_keys (id, school_id, key_hash, kind, seats, ends_at, label) values
  ('40000000-0000-0000-0000-0000000000a1', '40000000-0000-0000-0000-000000000001', school.code_hash('AAAAA-BBBBB-CCCCC-DDDDD'), 'licence', 1, now() + interval '100 days', 'lic'),
  ('40000000-0000-0000-0000-0000000000a2', '40000000-0000-0000-0000-000000000001', school.code_hash('EEEEE-FFFFF-GGGGG-HHHHH'), 'trial', 0, now() + interval '10 days', 'trial'),
  ('40000000-0000-0000-0000-0000000000a3', '40000000-0000-0000-0000-000000000001', school.code_hash('JJJJJ-KKKKK-MMMMM-NNNNN'), 'trial', 0, now() - interval '1 day', 'ended');

select ok(has_function_privilege('anon', 'public.key_check(text)', 'execute'), 'anon can check a key');
select ok((select p.prosecdef and 'search_path=""' = any(p.proconfig) from pg_proc p where p.proname = 'key_check'), 'key_check is security definer with an empty search_path');

set local role anon;
select results_eq(
  $$select state, kind, school_name from public.key_check('aaaaa-bbbbb-ccccc-ddddd')$$,
  $$values ('active'::text, 'licence'::text, 'Lycée Édition'::text)$$,
  'a licence with a free seat is active');
select is((select state from public.key_check('EEEEE-FFFFF-GGGGG-HHHHH')), 'active', 'a running trial is active');
select is((select state from public.key_check('JJJJJ-KKKKK-MMMMM-NNNNN')), 'expired', 'an ended trial is expired');
select is((select count(*) from public.key_check('ZZZZZ')), 1::bigint, 'key_check returns exactly one row');
select results_eq($$select state, school_name from public.key_check('ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ')$$, $$values ('unknown'::text, null::text)$$, 'an unknown key reveals nothing');
reset role;

select is((select visits from school.trial_keys where label = 'lic'), 0, 'a check counts no visit');
select is((select count(*) from school.devices where key_id = '40000000-0000-0000-0000-0000000000a1'), 0::bigint, 'a check takes no seat');

-- the only seat taken by a PC: the website says so before the download
insert into school.devices (key_id, device) values ('40000000-0000-0000-0000-0000000000a1', decode(repeat('ab', 32), 'hex'));
set local role anon;
select is((select state from public.key_check('AAAAA-BBBBB-CCCCC-DDDDD')), 'full', 'every seat taken: full');
reset role;

select is((select failures from school.attempts where bucket = 'global'), 2, 'failed checks are counted');
update school.attempts set failures = 30 where bucket = 'global';
set local role anon;
select is((select state from public.key_check('EEEEE-FFFFF-GGGGG-HHHHH')), 'busy', 'too many failures this minute: busy');
reset role;

select * from finish();
rollback;
