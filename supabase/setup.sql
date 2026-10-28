-- =============================================================
-- WomanTech — configuração do banco (Supabase)
-- Cole tudo no Supabase: SQL Editor → New query → Run.
-- Pode rodar de novo sem problema.
--
-- PAPÉIS (cada um inclui tudo do anterior):
--   aluna (1) → integrante (2) → lider (3) → admin (4)
--
-- PERMISSÕES EXTRAS (dadas a pessoas específicas, sem precisar ser admin):
--   publicar_projetos  → publica em Projetos & Eventos
--   mentora_carreira   → posta avisos/dicas e modera a comunidade de Carreira
--   aprovar_vagas      → aprova vagas indicadas no portal de Carreira
--   postar_aulas       → publica aulas e provas nos cursos
-- =============================================================

-- 1) Perfis -----------------------------------------------------
create table if not exists public.perfis (
    user_id          uuid primary key references auth.users (id) on delete cascade,
    email            text not null,
    nome             text not null default '',
    papel            text not null default 'aluna'
                     check (papel in ('aluna', 'integrante', 'lider', 'admin')),
    permissoes       text[] not null default '{}'
                     check (permissoes <@ array['publicar_projetos', 'mentora_carreira', 'aprovar_vagas', 'postar_aulas']),
    grupo            text,
    consentimento_em timestamptz,
    criado_em        timestamptz not null default now()
);

alter table public.perfis enable row level security;

-- Nível numérico do papel
create or replace function public.nivel_do_papel(p text)
returns int language sql immutable as $$
    select case p when 'aluna' then 1 when 'integrante' then 2 when 'lider' then 3 when 'admin' then 4 else 0 end;
$$;

-- Nível de quem está logado (0 = visitante)
create or replace function public.meu_nivel()
returns int language sql stable security definer set search_path = public as $$
    select coalesce((select public.nivel_do_papel(papel) from public.perfis where user_id = auth.uid()), 0);
$$;

create or replace function public.eh_admin()
returns boolean language sql stable security definer set search_path = public as $$
    select public.meu_nivel() = 4;
$$;

-- Admin tem todas as permissões automaticamente
create or replace function public.tem_permissao(p text)
returns boolean language sql stable security definer set search_path = public as $$
    select public.eh_admin()
        or exists (select 1 from public.perfis where user_id = auth.uid() and p = any (permissoes));
$$;

-- Cada pessoa vê o próprio perfil; admin vê todos
drop policy if exists "ver perfil" on public.perfis;
create policy "ver perfil" on public.perfis
    for select to authenticated
    using (user_id = auth.uid() or public.eh_admin());

-- Só admin muda papel, permissões e grupo
drop policy if exists "admin edita perfis" on public.perfis;
create policy "admin edita perfis" on public.perfis
    for update to authenticated
    using (public.eh_admin())
    with check (public.eh_admin());

-- A própria pessoa só pode trocar o nome (por esta função)
create or replace function public.atualizar_meu_nome(novo_nome text)
returns void language sql security definer set search_path = public as $$
    update public.perfis set nome = left(trim(novo_nome), 80) where user_id = auth.uid();
$$;

-- Nunca deixar o site sem nenhuma admin
create or replace function public.proteger_ultima_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
    if old.papel = 'admin' and new.papel <> 'admin'
       and (select count(*) from public.perfis where papel = 'admin' and user_id <> old.user_id) = 0 then
        raise exception 'Não é possível remover a última administradora.';
    end if;
    return new;
end $$;

drop trigger if exists perfis_ultima_admin on public.perfis;
create trigger perfis_ultima_admin before update on public.perfis
    for each row execute function public.proteger_ultima_admin();

-- Toda conta nova vira "aluna" automaticamente
create or replace function public.criar_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
    insert into public.perfis (user_id, email, nome, consentimento_em)
    values (
        new.id,
        new.email,
        coalesce(left(trim(new.raw_user_meta_data ->> 'nome'), 80), ''),
        case when (new.raw_user_meta_data ->> 'consentimento') = 'true' then now() end
    )
    on conflict (user_id) do nothing;
    return new;
end $$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users
    for each row execute function public.criar_perfil();

-- Contas que já existiam antes deste script
insert into public.perfis (user_id, email)
select id, email from auth.users
on conflict (user_id) do nothing;

-- Versão anterior usava a tabela "admins": migra e remove
do $$
begin
    if to_regclass('public.admins') is not null then
        update public.perfis p set papel = 'admin', nome = coalesce(nullif(p.nome, ''), a.nome, '')
        from public.admins a where a.user_id = p.user_id;
        drop table public.admins cascade;
    end if;
end $$;

-- 2) Projetos & Eventos ------------------------------------------
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
    autor      uuid default auth.uid() references auth.users (id) on delete set null
);

alter table public.projetos enable row level security;

drop policy if exists "todos leem projetos publicados" on public.projetos;
create policy "todos leem projetos publicados" on public.projetos
    for select to anon, authenticated
    using (publicado or public.tem_permissao('publicar_projetos'));

drop policy if exists "admins criam projetos" on public.projetos;
drop policy if exists "publicadoras criam projetos" on public.projetos;
create policy "publicadoras criam projetos" on public.projetos
    for insert to authenticated
    with check (public.tem_permissao('publicar_projetos'));

drop policy if exists "admins editam projetos" on public.projetos;
drop policy if exists "publicadoras editam projetos" on public.projetos;
create policy "publicadoras editam projetos" on public.projetos
    for update to authenticated
    using (public.tem_permissao('publicar_projetos'))
    with check (public.tem_permissao('publicar_projetos'));

drop policy if exists "admins apagam projetos" on public.projetos;
drop policy if exists "publicadoras apagam projetos" on public.projetos;
create policy "publicadoras apagam projetos" on public.projetos
    for delete to authenticated
    using (public.tem_permissao('publicar_projetos'));

-- 3) Fotos dos projetos (Storage) --------------------------------
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
    with check (bucket_id = 'projetos' and public.tem_permissao('publicar_projetos'));

drop policy if exists "admins trocam fotos" on storage.objects;
create policy "admins trocam fotos" on storage.objects
    for update to authenticated
    using (bucket_id = 'projetos' and public.tem_permissao('publicar_projetos'));

drop policy if exists "admins apagam fotos" on storage.objects;
create policy "admins apagam fotos" on storage.objects
    for delete to authenticated
    using (bucket_id = 'projetos' and public.tem_permissao('publicar_projetos'));

-- =============================================================
-- 4) PRIMEIRA ADMINISTRADORA (rode uma vez só)
--    a) Crie sua conta pelo site (Entrar → Criar conta) ou em
--       Authentication → Users → Add user.
--    b) Rode a linha abaixo com o seu e-mail.
--    Depois disso, as próximas admins são definidas pela página
--    "Usuários" do próprio site.
--
-- update public.perfis set papel = 'admin' where email = 'seu@email.com';
-- =============================================================
