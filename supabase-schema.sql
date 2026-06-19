create extension if not exists pgcrypto;

-- As tabelas user, session, account e verification são criadas pelo Better Auth:
-- npm run auth:migrate

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user"(id) on delete cascade,
  title text not null default 'Currículo sem título',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resumes_user_updated_idx
  on public.resumes (user_id, updated_at desc);

-- O navegador nunca acessa esta tabela diretamente.
-- Todas as operações passam por /api/resumes, que valida a sessão Better Auth.
alter table public.resumes enable row level security;

revoke all on table public.resumes from anon, authenticated;
