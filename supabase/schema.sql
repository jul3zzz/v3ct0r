-- V3CT0R : table de progression des comptes. À exécuter une fois dans Supabase
-- (Dashboard → SQL Editor → New query → coller → Run).
-- Chaque joueur ne peut lire et écrire que sa propre ligne (row level security).

create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

drop policy if exists "progress: lire la sienne" on public.progress;
drop policy if exists "progress: créer la sienne" on public.progress;
drop policy if exists "progress: modifier la sienne" on public.progress;
drop policy if exists "progress: supprimer la sienne" on public.progress;

create policy "progress: lire la sienne" on public.progress for select using (auth.uid() = user_id);
create policy "progress: créer la sienne" on public.progress for insert with check (auth.uid() = user_id);
create policy "progress: modifier la sienne" on public.progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress: supprimer la sienne" on public.progress for delete using (auth.uid() = user_id);
