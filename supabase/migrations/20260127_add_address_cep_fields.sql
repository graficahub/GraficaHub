-- Add address and cep fields to public.users for complete profile
-- These fields are required for basic profile completion

alter table public.users
  add column if not exists address text,
  add column if not exists cep text;

-- Index for cep (optional, but useful for searches)
create index if not exists users_cep_idx
  on public.users (cep)
  where cep is not null;
