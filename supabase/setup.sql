-- =============================================================
-- WomanTech — configuração do banco (Supabase)
-- Cole tudo no Supabase: SQL Editor → New query → Run.
-- Pode rodar de novo sem problema.
-- =============================================================

-- 1) Quem é administradora
create table if not exists public.admins (
    user_id uuid primary key references auth.users (id) on delete cascade,
    nome    text,
    criado_em timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "admin vê o próprio cadastro" on public.admins;
create policy "admin vê o próprio cadastro" on public.admins
    for select to authenticated
    using (user_id = auth.uid());

create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- 2) Projetos & Eventos
create table if not exists public.projetos (
    id         uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    titulo     text not null check (char_length(titulo) between 3 and 150),
    semestre   text not null check (semestre ~ '^[0-9]{4}/[12]$'),
    tipo       text not null,
    descricao  text not null check (char_length(descricao) <= 2000),
    tags       text[] not null default '{}',
    link       text,
    foto_url   text,
    icone      text,
    publicado  boolean not null default true,
    autor      uuid default auth.uid() references auth.users (id)
);

alter table public.projetos enable row level security;

drop policy if exists "todos leem projetos publicados" on public.projetos;
create policy "todos leem projetos publicados" on public.projetos
    for select to anon, authenticated
    using (publicado or public.eh_admin());

drop policy if exists "admins criam projetos" on public.projetos;
create policy "admins criam projetos" on public.projetos
    for insert to authenticated
    with check (public.eh_admin());

drop policy if exists "admins editam projetos" on public.projetos;
create policy "admins editam projetos" on public.projetos
    for update to authenticated
    using (public.eh_admin())
    with check (public.eh_admin());

drop policy if exists "admins apagam projetos" on public.projetos;
create policy "admins apagam projetos" on public.projetos
    for delete to authenticated
    using (public.eh_admin());

-- 3) Fotos dos projetos (Storage)
insert into storage.buckets (id, name, public)
values ('projetos', 'projetos', true)
on conflict (id) do nothing;

drop policy if exists "fotos de projetos são públicas" on storage.objects;
create policy "fotos de projetos são públicas" on storage.objects
    for select to anon, authenticated
    using (bucket_id = 'projetos');

drop policy if exists "admins enviam fotos" on storage.objects;
create policy "admins enviam fotos" on storage.objects
    for insert to authenticated
    with check (bucket_id = 'projetos' and public.eh_admin());

drop policy if exists "admins trocam fotos" on storage.objects;
create policy "admins trocam fotos" on storage.objects
    for update to authenticated
    using (bucket_id = 'projetos' and public.eh_admin());

drop policy if exists "admins apagam fotos" on storage.objects;
create policy "admins apagam fotos" on storage.objects
    for delete to authenticated
    using (bucket_id = 'projetos' and public.eh_admin());

-- =============================================================
-- 4) Tornar alguém administradora
--    a) Authentication → Users → "Add user" (e-mail + senha)
--    b) Rode a linha abaixo trocando o e-mail:
--
-- insert into public.admins (user_id, nome)
-- select id, 'Nome da pessoa' from auth.users where email = 'email@exemplo.com';
-- =============================================================
