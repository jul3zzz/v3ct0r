-- V3CT0R for schools, phase 1: schools, trial keys and trial tracking (docs/ECOLES.md).
--
-- Security model:
--   - the tables live in schema `school`, which the API (PostgREST) does not expose;
--   - row level security is on for every table, with no policy at all: everything is denied;
--   - the only doors are the `public.*` functions below: security definer, search_path = ''
--     (every name qualified), EXECUTE granted to the one role that needs it;
--   - keys are never stored in clear: sha256 of the normalized code (Crockford base32).
-- How to apply it: docs/ADMIN.md.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists school;
revoke all on schema school from public;
revoke all on schema school from anon, authenticated;

-- ── tables ─────────────────────────────────────────────────────────────

create table if not exists school.schools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,39}$'),
  name text not null check (char_length(name) between 2 and 80),
  -- data URL of an SVG or PNG, checked by tools/school.ts (src/school/logo.ts) and shown by <img> only
  logo text check (logo is null or (octet_length(logo) <= 210000 and logo ~ '^data:image/(svg\+xml|png);base64,[A-Za-z0-9+/=]+$')),
  accent text not null default '#ffffff' check (accent ~ '^#[0-9a-f]{6}$'),
  -- the route the app opens on (#/learn/riemann, #/4d/polytopes, #/atlas/integrals), '' = ATLAS
  start_route text not null default '' check (start_route ~ '^(#/[a-z0-9/_-]{1,80})?$'),
  status text not null default 'trial' check (status in ('trial', 'pilot', 'licensed', 'disabled')),
  seats integer not null default 0 check (seats >= 0),
  created_at timestamptz not null default now()
);

create table if not exists school.trial_keys (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references school.schools (id) on delete cascade,
  key_hash bytea not null unique check (octet_length(key_hash) = 32),
  -- a note for the admin (who received the key), never shown in the app
  label text not null default '' check (char_length(label) <= 120),
  ends_at timestamptz not null,
  disabled boolean not null default false,
  created_at timestamptz not null default now(),
  -- tracking: no personal data, no IP address
  first_opened_at timestamptz,
  last_seen_at timestamptz,
  visits integer not null default 0,
  seconds integer not null default 0
);
create index if not exists trial_keys_school on school.trial_keys (school_id);

-- failed code checks per minute ('global' bucket; later phases add one bucket per user)
create table if not exists school.attempts (
  bucket text not null,
  minute timestamptz not null,
  failures integer not null default 0,
  primary key (bucket, minute)
);

alter table school.schools enable row level security;
alter table school.trial_keys enable row level security;
alter table school.attempts enable row level security;
revoke all on all tables in schema school from public;
revoke all on all tables in schema school from anon, authenticated;

-- ── helpers (schema school: not reachable through the API) ─────────────

-- Crockford base32: anything but ASCII letters and digits dropped, then upper case, O → 0,
-- I and L → 1 (same rule as normCode in src/school/codes.ts)
create or replace function school.norm_code(p_code text)
returns text
language sql
immutable
set search_path = ''
as $$
  select translate(upper(regexp_replace(coalesce(p_code, ''), '[^0-9A-Za-z]', '', 'g')), 'OIL', '011')
$$;

create or replace function school.code_hash(p_code text)
returns bytea
language sql
immutable
set search_path = ''
as $$
  select extensions.digest(school.norm_code(p_code), 'sha256')
$$;

create or replace function school.trial_state(p_ends_at timestamptz, p_disabled boolean, p_status text)
returns text
language sql
stable
set search_path = ''
as $$
  select case
    when p_disabled or p_status = 'disabled' then 'disabled'
    when now() >= p_ends_at then 'expired'
    else 'active'
  end
$$;

-- too many failed checks in this minute
create or replace function school.too_many(p_bucket text, p_max integer)
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select a.failures from school.attempts a where a.bucket = p_bucket and a.minute = date_trunc('minute', now())), 0) >= p_max
$$;

-- count a failed check (kept one hour)
create or replace function school.fail(p_bucket text)
returns void
language sql
set search_path = ''
as $$
  delete from school.attempts where minute < now() - interval '1 hour';
  insert into school.attempts as a (bucket, minute, failures) values (p_bucket, date_trunc('minute', now()), 1)
  on conflict (bucket, minute) do update set failures = a.failures + 1;
$$;

revoke execute on all functions in schema school from public;

-- ── API: trial (anonymous) ─────────────────────────────────────────────

-- Opens a trial: always exactly one row. state: active | expired | disabled | unknown | busy.
-- Counts a visit. Never raises for a bad key (a raise would roll back the failure count).
create or replace function public.trial_open(p_key text)
returns table (state text, school_name text, logo text, accent text, start_route text, ends_at timestamptz, server_now timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  k school.trial_keys;
  s school.schools;
begin
  if school.too_many('global', 30) then
    return query select 'busy'::text, null::text, null::text, null::text, null::text, null::timestamptz, now();
    return;
  end if;
  if p_key is not null and char_length(p_key) <= 64 then
    select * into k from school.trial_keys t where t.key_hash = school.code_hash(p_key);
  end if;
  if k.id is null then
    perform school.fail('global');
    return query select 'unknown'::text, null::text, null::text, null::text, null::text, null::timestamptz, now();
    return;
  end if;
  select * into s from school.schools x where x.id = k.school_id;
  update school.trial_keys t
     set first_opened_at = coalesce(t.first_opened_at, now()), last_seen_at = now(), visits = t.visits + 1
   where t.id = k.id;
  return query select school.trial_state(k.ends_at, k.disabled, s.status), s.name, s.logo, s.accent, s.start_route, k.ends_at, now();
end
$$;

-- Time spent: adds at most 900 s, and never more than the time elapsed since the last contact
-- (+ 60 s). Always exactly one row, with the state, so a disabled key stops a running session.
create or replace function public.trial_ping(p_key text, p_seconds integer)
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

revoke execute on function public.trial_open(text) from public, anon, authenticated;
revoke execute on function public.trial_ping(text, integer) from public, anon, authenticated;
grant execute on function public.trial_open(text) to anon, authenticated;
grant execute on function public.trial_ping(text, integer) to anon, authenticated;

-- ── API: admin (service_role only, used by tools/school.ts) ────────────

-- Creates a school, or updates the fields given (null: unchanged). Returns its id.
create or replace function public.admin_school_upsert(
  p_slug text,
  p_name text default null,
  p_logo text default null,
  p_accent text default null,
  p_start_route text default null,
  p_clear_logo boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  select x.id into v_id from school.schools x where x.slug = p_slug;
  if v_id is null then
    if p_name is null then
      raise exception 'name_required';
    end if;
    insert into school.schools (slug, name, logo, accent, start_route)
    values (p_slug, p_name, p_logo, coalesce(p_accent, '#ffffff'), coalesce(p_start_route, ''))
    returning id into v_id;
  else
    update school.schools x
       set name = coalesce(p_name, x.name),
           logo = case when p_clear_logo then null else coalesce(p_logo, x.logo) end,
           accent = coalesce(p_accent, x.accent),
           start_route = coalesce(p_start_route, x.start_route)
     where x.id = v_id;
  end if;
  return v_id;
end
$$;

-- trial | pilot | licensed | disabled
create or replace function public.admin_school_status(p_slug text, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update school.schools x set status = p_status where x.slug = p_slug;
  if not found then
    raise exception 'unknown_school';
  end if;
end
$$;

-- A new trial key: the script sends its sha256 (hex), never the key itself.
create or replace function public.admin_trial_create(p_slug text, p_key_hash text, p_days integer, p_label text default '')
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
  if p_days is null or p_days < 1 or p_days > 366 then
    raise exception 'bad_days';
  end if;
  return query
    insert into school.trial_keys (school_id, key_hash, ends_at, label)
    values (v_school, decode(p_key_hash, 'hex'), now() + make_interval(days => p_days), coalesce(p_label, ''))
    returning id, ends_at;
end
$$;

-- Moves the end of a key by p_days (from now if it has already ended). Returns the new end.
create or replace function public.admin_trial_extend(p_key_id uuid, p_days integer)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_end timestamptz;
begin
  if p_days is null or p_days < 1 or p_days > 366 then
    raise exception 'bad_days';
  end if;
  update school.trial_keys t
     set ends_at = greatest(t.ends_at, now()) + make_interval(days => p_days)
   where t.id = p_key_id
  returning t.ends_at into v_end;
  if v_end is null then
    raise exception 'unknown_key';
  end if;
  return v_end;
end
$$;

-- Same for every key of a school. Returns the number of keys moved.
create or replace function public.admin_school_extend(p_slug text, p_days integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  if p_days is null or p_days < 1 or p_days > 366 then
    raise exception 'bad_days';
  end if;
  update school.trial_keys t
     set ends_at = greatest(t.ends_at, now()) + make_interval(days => p_days)
    from school.schools x
   where x.id = t.school_id and x.slug = p_slug;
  get diagnostics n = row_count;
  return n;
end
$$;

create or replace function public.admin_trial_disable(p_key_id uuid, p_disabled boolean default true)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update school.trial_keys t set disabled = p_disabled where t.id = p_key_id;
  if not found then
    raise exception 'unknown_key';
  end if;
end
$$;

-- Everything the admin needs for follow-ups, one row per key.
create or replace function public.admin_trial_report()
returns table (
  school_slug text, school_name text, school_status text, key_id uuid, label text, created_at timestamptz,
  ends_at timestamptz, state text, first_opened_at timestamptz, last_seen_at timestamptz, visits integer, seconds integer
)
language sql
security definer
set search_path = ''
as $$
  select x.slug, x.name, x.status, t.id, t.label, t.created_at, t.ends_at, school.trial_state(t.ends_at, t.disabled, x.status),
         t.first_opened_at, t.last_seen_at, t.visits, t.seconds
    from school.schools x
    left join school.trial_keys t on t.school_id = x.id
   order by x.slug, t.created_at
$$;

revoke execute on function public.admin_school_upsert(text, text, text, text, text, boolean) from public, anon, authenticated;
revoke execute on function public.admin_school_status(text, text) from public, anon, authenticated;
revoke execute on function public.admin_trial_create(text, text, integer, text) from public, anon, authenticated;
revoke execute on function public.admin_trial_extend(uuid, integer) from public, anon, authenticated;
revoke execute on function public.admin_school_extend(text, integer) from public, anon, authenticated;
revoke execute on function public.admin_trial_disable(uuid, boolean) from public, anon, authenticated;
revoke execute on function public.admin_trial_report() from public, anon, authenticated;
grant execute on function public.admin_school_upsert(text, text, text, text, text, boolean) to service_role;
grant execute on function public.admin_school_status(text, text) to service_role;
grant execute on function public.admin_trial_create(text, text, integer, text) to service_role;
grant execute on function public.admin_trial_extend(uuid, integer) to service_role;
grant execute on function public.admin_school_extend(text, integer) to service_role;
grant execute on function public.admin_trial_disable(uuid, boolean) to service_role;
grant execute on function public.admin_trial_report() to service_role;
