create extension if not exists pgcrypto;

create type public.occurrence_status as enum ('registrada', 'em_analise', 'concluida');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null check (char_length(trim(nome)) between 1 and 100),
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique check (char_length(trim(nome)) between 2 and 100),
  descricao text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  descricao text not null check (char_length(trim(descricao)) between 10 and 1000),
  endereco text not null check (char_length(trim(endereco)) between 5 and 300),
  latitude numeric(9,6) check (latitude between -90 and 90),
  longitude numeric(9,6) check (longitude between -180 and 180),
  photo_url text check (photo_url is null or (photo_url like user_id::text || '/%' and photo_url ~ '\.(jpg|png|webp)$')),
  status public.occurrence_status not null default 'registrada',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.occurrence_status_history (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references public.occurrences(id) on delete cascade,
  status public.occurrence_status not null,
  observacao text check (observacao is null or char_length(observacao) <= 500),
  created_at timestamptz not null default now()
);

create index occurrences_user_created_idx on public.occurrences(user_id, created_at desc);
create index occurrences_category_idx on public.occurrences(category_id);
create index status_history_occurrence_created_idx on public.occurrence_status_history(occurrence_id, created_at);

create function public.create_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, nome)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1)));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile();

create function public.record_occurrence_status() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.occurrence_status_history(occurrence_id, status) values (new.id, new.status);
  elsif new.status is distinct from old.status then
    insert into public.occurrence_status_history(occurrence_id, status) values (new.id, new.status);
  end if;
  return new;
end $$;
create trigger occurrence_status_recorded after insert or update of status on public.occurrences
  for each row execute function public.record_occurrence_status();

create function public.set_occurrence_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger occurrence_updated_at before update on public.occurrences
  for each row execute function public.set_occurrence_updated_at();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.occurrences enable row level security;
alter table public.occurrence_status_history enable row level security;

create policy "profiles own read" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "categories active read" on public.categories for select to authenticated using (ativo);
create policy "occurrences own read" on public.occurrences for select to authenticated using (user_id = (select auth.uid()));
create policy "occurrences own insert" on public.occurrences for insert to authenticated
  with check (
    user_id = (select auth.uid()) and status = 'registrada'
    and exists (select 1 from public.categories where id = category_id and ativo)
    and (photo_url is null or exists (
      select 1 from storage.objects where bucket_id = 'occurrence-photos' and name = photo_url
    ))
  );
create policy "history own read" on public.occurrence_status_history for select to authenticated
  using (exists (select 1 from public.occurrences where id = occurrence_id and user_id = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('occurrence-photos', 'occurrence-photos', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "own photo upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'occurrence-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own photo read" on storage.objects for select to authenticated
  using (bucket_id = 'occurrence-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own photo cleanup" on storage.objects for delete to authenticated
  using (bucket_id = 'occurrence-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

revoke all on public.profiles, public.categories, public.occurrences, public.occurrence_status_history from anon;
grant select on public.profiles, public.categories, public.occurrences, public.occurrence_status_history to authenticated;
grant insert (user_id, category_id, descricao, endereco, latitude, longitude, photo_url) on public.occurrences to authenticated;
