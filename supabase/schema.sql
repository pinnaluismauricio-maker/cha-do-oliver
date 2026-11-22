

create extension if not exists pgcrypto;

-- Itens da lista (fraldas e mimos)
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  link text,
  max_claims int not null default 1 check (max_claims > 0),
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- Escolhas dos convidados. O token permite que o próprio convidado desfaça a escolha dele.
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  guest_name text not null check (char_length(guest_name) between 1 and 60),
  token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);
create index if not exists claims_item_id_idx on public.claims(item_id);

alter table public.items enable row level security;
alter table public.claims enable row level security;

-- Todos podem ler os itens. Ninguém escreve direto: só o painel do Supabase (você).
drop policy if exists "itens visiveis para todos" on public.items;
create policy "itens visiveis para todos" on public.items
  for select to anon, authenticated using (true);

-- A tabela claims não tem política para visitantes (o token fica secreto).
-- Eles leem esta visão, que não mostra o token.
create or replace view public.claims_public as
  select id, item_id, guest_name, created_at from public.claims;
grant select on public.claims_public to anon, authenticated;

-- Escolher um item. Trava a linha do item para duas pessoas não passarem do limite ao mesmo tempo.
create or replace function public.claim_item(p_item_id uuid, p_name text)
returns table (claim_id uuid, claim_token uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item public.items;
  v_count int;
  v_name text := btrim(p_name);
begin
  if v_name is null or char_length(v_name) < 1 or char_length(v_name) > 60 then
    raise exception 'nome_invalido';
  end if;

  select * into v_item from public.items where id = p_item_id for update;
  if not found then
    raise exception 'item_inexistente';
  end if;

  select count(*) into v_count from public.claims where item_id = p_item_id;
  if v_count >= v_item.max_claims then
    raise exception 'item_esgotado';
  end if;

  return query
    insert into public.claims (item_id, guest_name)
    values (p_item_id, v_name)
    returning id, token;
end;
$$;
grant execute on function public.claim_item(uuid, text) to anon, authenticated;

-- Desfazer a própria escolha (só com o token que o navegador do convidado guardou).
create or replace function public.release_claim(p_claim_id uuid, p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
begin
  delete from public.claims where id = p_claim_id and token = p_token;
  get diagnostics v_deleted = row_count;
  return v_deleted > 0;
end;
$$;
grant execute on function public.release_claim(uuid, uuid) to anon, authenticated;
