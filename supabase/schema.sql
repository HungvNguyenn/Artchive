create extension if not exists "pgcrypto";

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(excluded.display_name, public.profiles.display_name);
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.containers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text not null default '',
  status text not null default 'Unfinished' check (status in ('Finished', 'Unfinished', 'Archived')),
  medium text not null default '',
  preview_scale double precision not null default 1,
  preview_offset_x integer not null default 0,
  preview_offset_y integer not null default 0,
  preview_rotation integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.containers add column if not exists preview_scale double precision not null default 1;
alter table public.containers add column if not exists preview_offset_x integer not null default 0;
alter table public.containers add column if not exists preview_offset_y integer not null default 0;
alter table public.containers add column if not exists preview_rotation integer not null default 0;

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  container_id uuid not null references public.containers (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  type text not null check (type in ('reference', 'sketch', 'final', 'note')),
  image_path text,
  note text,
  is_primary boolean not null default false,
  x integer not null default 32,
  y integer not null default 44,
  rotation integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, name)
);

create table if not exists public.container_tags (
  container_id uuid not null references public.containers (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (container_id, tag_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists containers_set_updated_at on public.containers;
create trigger containers_set_updated_at
before update on public.containers
for each row
execute function public.set_updated_at();

drop trigger if exists assets_set_updated_at on public.assets;
create trigger assets_set_updated_at
before update on public.assets
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.containers enable row level security;
alter table public.assets enable row level security;
alter table public.tags enable row level security;
alter table public.container_tags enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id);

create policy "Users can view their own containers"
on public.containers
for select
using (auth.uid() = user_id);

create policy "Users can insert their own containers"
on public.containers
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own containers"
on public.containers
for update
using (auth.uid() = user_id);

create policy "Users can delete their own containers"
on public.containers
for delete
using (auth.uid() = user_id);

create policy "Users can view their own assets"
on public.assets
for select
using (auth.uid() = user_id);

create policy "Users can insert their own assets"
on public.assets
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own assets"
on public.assets
for update
using (auth.uid() = user_id);

create policy "Users can delete their own assets"
on public.assets
for delete
using (auth.uid() = user_id);

create policy "Users can view their own tags"
on public.tags
for select
using (auth.uid() = user_id);

create policy "Users can insert their own tags"
on public.tags
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own tags"
on public.tags
for update
using (auth.uid() = user_id);

create policy "Users can delete their own tags"
on public.tags
for delete
using (auth.uid() = user_id);

create policy "Users can view their own container tags"
on public.container_tags
for select
using (
  exists (
    select 1
    from public.containers
    where public.containers.id = public.container_tags.container_id
      and public.containers.user_id = auth.uid()
  )
);

create policy "Users can insert their own container tags"
on public.container_tags
for insert
with check (
  exists (
    select 1
    from public.containers
    where public.containers.id = public.container_tags.container_id
      and public.containers.user_id = auth.uid()
  )
);

create policy "Users can delete their own container tags"
on public.container_tags
for delete
using (
  exists (
    select 1
    from public.containers
    where public.containers.id = public.container_tags.container_id
      and public.containers.user_id = auth.uid()
  )
);
