-- V3CT0R for schools, phase 1b: school licence keys, seats (« postes ») and the devices that hold them
-- (docs/ECOLES.md). Same security model as 20261111120000_school_trial.sql: schema `school` not exposed,
-- RLS on with no policy, the `public.*` functions below as the only doors.
--
-- school.trial_keys keeps its name from phase 1 and now holds every key: kind 'trial' (a prospect, no
-- seat limit) or 'licence' (a school that bought V3CT0R, `seats` devices at most). A device is a 32-byte
-- pseudonymous id sent by the app (desktop: sha256 of the Windows MachineGuid with an app prefix, so one
-- PC is one seat whatever the Windows account; browser: random bytes kept by that browser).
-- How to apply it: docs/ADMIN.md.

alter table school.trial_keys add column if not exists kind text not null default 'trial';
alter table school.trial_keys add column if not exists seats integer not null default 0;
alter table school.trial_keys drop constraint if exists trial_keys_kind;
alter table school.trial_keys add constraint trial_keys_kind check (kind in ('trial', 'licence'));
alter table school.trial_keys drop constraint if exists trial_keys_seats;
alter table school.trial_keys add constraint trial_keys_seats check (seats between 0 and 10000 and (kind = 'licence' or seats = 0));

create table if not exists school.devices (
  key_id uuid not null references school.trial_keys (id) on delete cascade,
  device bytea not null check (octet_length(device) = 32),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  primary key (key_id, device)
);

alter table school.devices enable row level security;
revoke all on school.devices from public;
revoke all on school.devices from anon, authenticated;

-- ── helpers ────────────────────────────────────────────────────────────

-- A seat for this device: kept if it already has one, taken if one is free, refused otherwise.
-- No limit (seats = 0): nothing stored. The key row is locked so that two devices never take the
-- last seat together.
create or replace function school.take_seat(p_key_id uuid, p_seats integer, p_device text)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  d bytea;
begin
  if p_seats = 0 then
    return true;
  end if;
  if p_device is null or p_device !~ '^[0-9a-f]{64}$' then
    return false;
  end if;
  d := decode(p_device, 'hex');
  perform 1 from school.trial_keys t where t.id = p_key_id for update;
  update school.devices v set last_seen = now() where v.key_id = p_key_id and v.device = d;
  if found then
    return true;
  end if;
  if (select count(*) from school.devices v where v.key_id = p_key_id) >= p_seats then
    return false;
  end if;
  insert into school.devices (key_id, device) values (p_key_id, d);
  return true;
end
$$;

create or replace function school.seats_used(p_key_id uuid)
returns integer
language sql
stable
set search_path = ''
as $$
  select count(*)::integer from school.devices v where v.key_id = p_key_id
$$;

revoke execute on all functions in schema school from public;

-- ── API: keys (anonymous) ──────────────────────────────────────────────

-- Opens a trial or a licence: always exactly one row. state: active | expired | disabled | full |
-- unknown | busy (full: every seat of the licence is taken by other devices). Counts a visit. Never
-- raises for a bad key (a raise would roll back the failure count).
create or replace function public.key_open(p_key text, p_device text default null)
returns table (
  state text, kind text, school_name text, logo text, accent text, start_route text,
  ends_at timestamptz, seats integer, seats_used integer, server_now timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  k school.trial_keys;
  s school.schools;
  st text;
begin
  if school.too_many('global', 30) then
    return query select 'busy'::text, null::text, null::text, null::text, null::text, null::text, null::timestamptz, null::integer, null::integer, now();
    return;
  end if;
  if p_key is not null and char_length(p_key) <= 64 then
    select * into k from school.trial_keys t where t.key_hash = school.code_hash(p_key);
  end if;
  if k.id is null then
    perform school.fail('global');
    return query select 'unknown'::text, null::text, null::text, null::text, null::text, null::text, null::timestamptz, null::integer, null::integer, now();
    return;
  end if;
  select * into s from school.schools x where x.id = k.school_id;
  st := school.trial_state(k.ends_at, k.disabled, s.status);
  if st = 'active' and not school.take_seat(k.id, k.seats, p_device) then
    st := 'full';
  end if;
  update school.trial_keys t
     set first_opened_at = coalesce(t.first_opened_at, now()), last_seen_at = now(), visits = t.visits + 1
   where t.id = k.id;
  return query select st, k.kind, s.name, s.logo, s.accent, s.start_route, k.ends_at, k.seats, school.seats_used(k.id), now();
end
$$;

-- Time spent, same caps as trial_ping (900 s, elapsed + 60 s). Always one row, with the state: a key
-- disabled, a seat taken back (devices reset) or a school stopped ends a running session.
create or replace function public.key_ping(p_key text, p_seconds integer, p_device text default null)
returns table (state text, ends_at timestamptz, server_now timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  k school.trial_keys;
  s school.schools;
  st text;
  v_add integer;
begin
  if school.too_many('global', 30) then
    return query select 'busy'::text, null::timestamptz, now();
    return;
  end if;
  if p_key is not null and char_length(p_key) <= 64 then
    select * into k from school.trial_keys t where t.key_hash = school.code_hash(p_key);
  end if;
  if k.id is null then
    perform school.fail('global');
    return query select 'unknown'::text, null::timestamptz, now();
    return;
  end if;
  select * into s from school.schools x where x.id = k.school_id;
  st := school.trial_state(k.ends_at, k.disabled, s.status);
  if st = 'active' and not school.take_seat(k.id, k.seats, p_device) then
    st := 'full';
  end if;
  if st = 'active' then
    v_add := least(
      greatest(coalesce(p_seconds, 0), 0),
      900,
      coalesce(floor(extract(epoch from now() - k.last_seen_at))::integer, 0) + 60
    );
    update school.trial_keys t
       set seconds = t.seconds + v_add, last_seen_at = now(), first_opened_at = coalesce(t.first_opened_at, now())
     where t.id = k.id;
  end if;
  return query select st, k.ends_at, now();
end
$$;

-- The phase 1 functions, kept for builds already published: relays to the new ones (no device).
create or replace function public.trial_open(p_key text)
returns table (state text, school_name text, logo text, accent text, start_route text, ends_at timestamptz, server_now timestamptz)
language sql
security definer
set search_path = ''
as $$
  select o.state, o.school_name, o.logo, o.accent, o.start_route, o.ends_at, o.server_now from public.key_open(p_key, null) o
$$;

create or replace function public.trial_ping(p_key text, p_seconds integer)
returns table (state text, ends_at timestamptz, server_now timestamptz)
language sql
security definer
set search_path = ''
as $$
  select o.state, o.ends_at, o.server_now from public.key_ping(p_key, p_seconds, null) o
$$;

revoke execute on function public.key_open(text, text) from public, anon, authenticated;
revoke execute on function public.key_ping(text, integer, text) from public, anon, authenticated;
grant execute on function public.key_open(text, text) to anon, authenticated;
grant execute on function public.key_ping(text, integer, text) to anon, authenticated;

-- ── API: admin (service_role only, used by tools/school.ts) ────────────

-- A new key, trial or licence: the script sends its sha256 (hex), never the key itself.
-- Trial: no seat limit, at most 366 days. Licence: 1 to 10000 seats, at most 3 years.
create or replace function public.admin_key_create(p_slug text, p_key_hash text, p_kind text, p_ends_at timestamptz, p_seats integer default 0, p_label text default '')
returns table (key_id uuid, ends_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_school uuid;
begin
  select x.id into v_school from school.schools x where x.slug = p_slug;
  if v_school is null then
    raise exception 'unknown_school';
  end if;
  if p_key_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'bad_hash';
  end if;
  if p_kind not in ('trial', 'licence') then
    raise exception 'bad_kind';
  end if;
  -- (the CASE in parentheses: a bare THEN inside it would end the IF condition)
  if p_ends_at is null or p_ends_at <= now() or p_ends_at > now() + (case when p_kind = 'trial' then interval '366 days' else interval '3 years' end) then
    raise exception 'bad_end';
  end if;
  if (p_kind = 'trial' and coalesce(p_seats, 0) <> 0) or (p_kind = 'licence' and (p_seats is null or p_seats < 1 or p_seats > 10000)) then
    raise exception 'bad_seats';
  end if;
  return query
    insert into school.trial_keys (school_id, key_hash, kind, seats, ends_at, label)
    values (v_school, decode(p_key_hash, 'hex'), p_kind, coalesce(p_seats, 0), p_ends_at, coalesce(p_label, ''))
    returning id, ends_at;
end
$$;

-- A new key in place of an old one (a key copied out of the school): same school, kind, seats and
-- end; the old key is disabled and its devices are let go. Returns the new key.
create or replace function public.admin_key_rotate(p_key_id uuid, p_key_hash text)
returns table (key_id uuid, ends_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  k school.trial_keys;
begin
  select * into k from school.trial_keys t where t.id = p_key_id for update;
  if k.id is null then
    raise exception 'unknown_key';
  end if;
  if p_key_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'bad_hash';
  end if;
  update school.trial_keys t set disabled = true where t.id = k.id;
  delete from school.devices v where v.key_id = k.id;
  return query
    insert into school.trial_keys (school_id, key_hash, kind, seats, ends_at, label)
    values (k.school_id, decode(p_key_hash, 'hex'), k.kind, k.seats, k.ends_at, left(k.label || ' (nouvelle clé)', 120))
    returning id, ends_at;
end
$$;

-- The devices of a key: the first 8 hex digits of their id only (enough to tell them apart).
create or replace function public.admin_devices(p_key_id uuid)
returns table (device text, first_seen timestamptz, last_seen timestamptz)
language sql
security definer
set search_path = ''
as $$
  select left(encode(v.device, 'hex'), 8), v.first_seen, v.last_seen
    from school.devices v
   where v.key_id = p_key_id
   order by v.last_seen desc
$$;

-- Lets every device of a key go (a lab reinstalled, PCs replaced). Returns how many.
create or replace function public.admin_devices_reset(p_key_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  if not exists (select 1 from school.trial_keys t where t.id = p_key_id) then
    raise exception 'unknown_key';
  end if;
  delete from school.devices v where v.key_id = p_key_id;
  get diagnostics n = row_count;
  return n;
end
$$;

-- The report with kinds and seats, one row per key.
create or replace function public.admin_report()
returns table (
  school_slug text, school_name text, school_status text, key_id uuid, kind text, label text, created_at timestamptz,
  ends_at timestamptz, state text, seats integer, seats_used integer,
  first_opened_at timestamptz, last_seen_at timestamptz, visits integer, seconds integer
)
language sql
security definer
set search_path = ''
as $$
  select x.slug, x.name, x.status, t.id, t.kind, t.label, t.created_at, t.ends_at, school.trial_state(t.ends_at, t.disabled, x.status),
         t.seats, case when t.id is null then null else school.seats_used(t.id) end,
         t.first_opened_at, t.last_seen_at, t.visits, t.seconds
    from school.schools x
    left join school.trial_keys t on t.school_id = x.id
   order by x.slug, t.created_at
$$;

revoke execute on function public.admin_key_create(text, text, text, timestamptz, integer, text) from public, anon, authenticated;
revoke execute on function public.admin_key_rotate(uuid, text) from public, anon, authenticated;
revoke execute on function public.admin_devices(uuid) from public, anon, authenticated;
revoke execute on function public.admin_devices_reset(uuid) from public, anon, authenticated;
revoke execute on function public.admin_report() from public, anon, authenticated;
grant execute on function public.admin_key_create(text, text, text, timestamptz, integer, text) to service_role;
grant execute on function public.admin_key_rotate(uuid, text) to service_role;
grant execute on function public.admin_devices(uuid) to service_role;
grant execute on function public.admin_devices_reset(uuid) to service_role;
grant execute on function public.admin_report() to service_role;
