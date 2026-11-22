-- Itens iniciais. Rode depois do schema.sql.
-- Fraldas Huggies: cada tamanho pode ser escolhido até 40 vezes.
insert into public.items (name, category, link, max_claims, sort) values
  ('Fraldas Huggies RN', 'Fraldas Huggies', null, 40, 1),
  ('Fraldas Huggies P',  'Fraldas Huggies', null, 40, 2),
  ('Fraldas Huggies M',  'Fraldas Huggies', null, 40, 3),
  ('Fraldas Huggies G',  'Fraldas Huggies', null, 40, 4);

-- Mimos: cada um só pode ser escolhido uma vez (max_claims = 1).
-- Quando você enviar a lista, os mimos entram aqui, neste formato:
-- insert into public.items (name, category, link, max_claims, sort) values
--   ('Nome do mimo', 'Mimos', 'https://link-da-loja', 1, 10);
