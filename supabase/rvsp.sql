-- Confirmação de presença (fase 2). Rode uma vez no Supabase: SQL Editor > New query > Run.

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null check (char_length(guest_name) between 1 and 60),
  guests int not null default 1 check (guests between 1 and 10),
  created_at timestamptz not null default now()
);

-- Sem políticas: visitantes não leem nem escrevem direto na tabela.
-- Só você vê as confirmações, pelo Table Editor do Supabase.
alter table public.rsvps enable row level security;

create or replace function public.confirm_presence(p_name text, p_guests int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := btrim(p_name);
begin
  if v_name is null or char_length(v_name) < 1 or char_length(v_name) > 60 then
    raise exception 'nome_invalido';
  end if;
  if p_guests is null or p_guests < 1 or p_guests > 10 then
    raise exception 'quantidade_invalida';
  end if;
  insert into public.rsvps (guest_name, guests) values (v_name, p_guests);
end;
$$;
grant execute on function public.confirm_presence(text, int) to anon, authenticated;