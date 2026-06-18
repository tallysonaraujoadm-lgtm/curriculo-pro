create extension if not exists pgcrypto;

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Curriculo',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists resumes_user_id_key on public.resumes (user_id);

alter table public.resumes enable row level security;

drop policy if exists "resumes_select_own" on public.resumes;
create policy "resumes_select_own"
  on public.resumes
  for select
  using (auth.uid() = user_id);

drop policy if exists "resumes_insert_own" on public.resumes;
create policy "resumes_insert_own"
  on public.resumes
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "resumes_update_own" on public.resumes;
create policy "resumes_update_own"
  on public.resumes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "resumes_delete_own" on public.resumes;
create policy "resumes_delete_own"
  on public.resumes
  for delete
  using (auth.uid() = user_id);
