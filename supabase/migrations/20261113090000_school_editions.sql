-- V3CT0R for schools, two apps (docs/ECOLES.md): the website checks a key before it downloads V3CT0R Lycée.
-- That check must not count a visit nor take a seat of a licence (key_open does both): key_check only says
-- whether the key opens V3CT0R now. Same rules as the other doors: one row, never an error for a bad key,
-- the global failure ceiling. How to apply it: docs/ADMIN.md.

-- state: active | expired | disabled | full | unknown | busy (full: a licence whose seats are all taken)
create or replace function public.key_check(p_key text)
returns table (state text, kind text, school_name text, ends_at timestamptz)
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
    return query select 'busy'::text, null::text, null::text, null::timestamptz;
    return;
  end if;
  if p_key is not null and char_length(p_key) <= 64 then
    select * into k from school.trial_keys t where t.key_hash = school.code_hash(p_key);
  end if;
  if k.id is null then
    perform school.fail('global');
    return query select 'unknown'::text, null::text, null::text, null::timestamptz;
    return;
  end if;
  select * into s from school.schools x where x.id = k.school_id;
  st := school.trial_state(k.ends_at, k.disabled, s.status);
  if st = 'active' and k.seats > 0 and school.seats_used(k.id) >= k.seats then
    st := 'full';
  end if;
  return query select st, k.kind, s.name, k.ends_at;
end
$$;

revoke execute on function public.key_check(text) from public, anon, authenticated;
grant execute on function public.key_check(text) to anon, authenticated;
