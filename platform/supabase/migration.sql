create extension if not exists pgcrypto;
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  contractor_id text not null,
  endpoint text not null unique,
  subscription jsonb not null,
  user_agent text,
  site_origin text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
alter table public.push_subscriptions add column if not exists site_origin text;
create index if not exists push_subscriptions_contractor_id_idx on public.push_subscriptions(contractor_id);
alter table public.push_subscriptions enable row level security;
grant all on table public.push_subscriptions to service_role;
