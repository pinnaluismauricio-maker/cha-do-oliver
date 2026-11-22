# Chá de Bebê do Oliver

Site com a lista de presentes. Cada convidado escolhe um item e deixa o nome. Você recebe um e-mail a cada escolha.

- Fraldas Huggies RN, P, M e G: cada tamanho pode ser escolhido até 40 vezes.
- Mimos: cada um só pode ser escolhido uma vez (dois deles aceitam até 3 pessoas), com link de onde comprar.
- Stack: React + Vite + TypeScript, Supabase (banco e função de e-mail), Vercel (hospedagem), Resend (e-mail). Tudo no plano gratuito.

## 1. Banco de dados (Supabase)

1. Crie uma conta em https://supabase.com e um projeto novo (guarde a senha do banco).
2. Abra **SQL Editor > New query**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. Faça o mesmo com `supabase/seed.sql` (cria as fraldas Huggies) e depois com `supabase/seed-mimos.sql` (os 30 mimos).
4. Em **Project Settings > API**, copie a **Project URL** e a chave **anon public**.

## 2. Rodar no seu computador

```bash
npm install
cp .env.example .env     # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev
```

Abra o endereço que aparece no terminal, escolha um item e confira se ele aparece na tela.
Para limpar os testes: no Supabase, **Table Editor > claims**, apague as linhas.

## 3. Aviso por e-mail (Resend + função do Supabase)

1. Crie uma conta em https://resend.com **usando o e-mail que vai receber os avisos** (pinnaluismauricio@gmail.com).
   Sem domínio próprio, o Resend só envia para o e-mail da própria conta, e é isso que queremos aqui.
2. Em **API Keys**, crie uma chave e copie.
3. No terminal, dentro da pasta do projeto:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF     # está na URL do projeto: https://SEU_PROJECT_REF.supabase.co
npx supabase secrets set RESEND_API_KEY=cole_a_chave NOTIFY_EMAIL=pinnaluismauricio@gmail.com WEBHOOK_SECRET=invente_uma_senha_longa
npx supabase functions deploy notify-claim --no-verify-jwt
```

4. No painel do Supabase: **Database > Webhooks > Create a new hook**.
   - Table: `claims`, evento: **Insert**
   - Type: **Supabase Edge Functions**, função `notify-claim`
   - Em HTTP Headers, adicione `x-webhook-secret` com a mesma senha do passo 3.
5. Escolha um item no site e veja se o e-mail chega (olhe o spam na primeira vez).

## 4. Publicar na Vercel

1. Suba a pasta para um repositório no GitHub (o `.env` não vai junto, está no `.gitignore`).
2. Em https://vercel.com, **Add New > Project**, importe o repositório.
3. Em **Environment Variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Em **Settings > Domains**, use `chadooliver.vercel.app`. Endereços da Vercel não aceitam acento, então é `chadooliver` sem acento.
   Se já estiver em uso, tente `cha-do-oliver`.
5. Mande o link para os convidados. Eles escolhem sem criar conta.

## Dia a dia

- **Adicionar ou editar mimos:** Supabase > Table Editor > `items`. Colunas: `name`, `category` (use `Mimos`), `link`, `max_claims` (1) e `sort` (ordem na tela).
- **Ver quem escolheu o quê:** Table Editor > `claims`.
- **Remover uma escolha:** apague a linha em `claims`. O item volta a ficar disponível.
- **Projeto gratuito pausa com pouca atividade:** o Supabase pausa projetos gratuitos que ficam uma semana quase sem uso. Os dados não se perdem, mas o site para até você reativar no painel. Perto da data do chá, abra o site ou o painel de vez em quando.

## Segurança

- Visitantes só leem os itens e a lista de escolhas (sem o token) e só escrevem pelas funções `claim_item` e `release_claim`.
- A função de e-mail só aceita chamadas com o cabeçalho `x-webhook-secret` correto.
- A chave `anon` pode ficar no site. Nunca coloque a chave `service_role` nem a chave do Resend no front-end.

## Foto de fundo, data e local

- A foto de fundo está em `public/fundo.jpg`. Para trocar, substitua o arquivo mantendo o mesmo nome.
- A data e o endereço ficam no topo da página, em `src/App.tsx` (procure por "23 de janeiro").
