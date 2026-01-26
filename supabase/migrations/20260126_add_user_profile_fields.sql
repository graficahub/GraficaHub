-- Add minimal profile fields and supplier flags to public.users
alter table public.users
  add column if not exists cpf_cnpj text,
  add column if not exists phone text,
  add column if not exists receive_orders_enabled boolean default false,
  add column if not exists dismiss_receive_orders_banner boolean default false;

-- Indexes
create index if not exists users_receive_orders_enabled_idx
  on public.users (receive_orders_enabled);

create unique index if not exists users_cpf_cnpj_unique
  on public.users (cpf_cnpj)
  where cpf_cnpj is not null;

-- Ensure RLS is enabled
alter table public.users enable row level security;

-- Policies for authenticated users to read/update their own profile
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
      and policyname = 'Users can select own profile'
  ) then
    create policy "Users can select own profile"
      on public.users
      for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
      and policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile"
      on public.users
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end $$;
