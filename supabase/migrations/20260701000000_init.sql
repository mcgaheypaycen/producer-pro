-- Producer Pro SaaS: initial schema.
-- Collections mirror the desktop app's JSON store: each record is an opaque
-- JSONB document (the app spreads/merges whole objects), scoped per user with
-- row-level security.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user; holds billing + Drive state.
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  stripe_customer_id text unique,
  subscription_status text not null default 'none',
  price_id text,
  current_period_end timestamptz,
  drive_folder_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users may only write the Drive folder pointer; billing columns are written
-- exclusively by the Stripe webhook (service role bypasses these grants).
revoke update on public.profiles from authenticated;
grant update (drive_folder_id) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- App collections.
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['performers', 'venues', 'acts', 'shows'] loop
    execute format($sql$
      create table public.%1$I (
        id uuid primary key default gen_random_uuid(),
        user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
        data jsonb not null default '{}'::jsonb,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      create index %1$s_user_id_idx on public.%1$I (user_id);

      alter table public.%1$I enable row level security;

      create policy "%1$s_select_own" on public.%1$I
        for select using (auth.uid() = user_id);
      create policy "%1$s_insert_own" on public.%1$I
        for insert with check (auth.uid() = user_id);
      create policy "%1$s_update_own" on public.%1$I
        for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
      create policy "%1$s_delete_own" on public.%1$I
        for delete using (auth.uid() = user_id);

      create trigger %1$s_touch_updated_at
        before update on public.%1$I
        for each row execute function public.touch_updated_at();
    $sql$, t);
  end loop;
end;
$$;
