# Currículo Pro

Aplicação web para criar, salvar, editar, duplicar, excluir e exportar currículos.

## Arquitetura

- Frontend: HTML, CSS, JavaScript e Vite
- Autenticação: Better Auth
- Banco: PostgreSQL do Supabase
- E-mails: Resend
- Servidor e API: Node.js e Express

O Supabase Auth não é usado. O Supabase fornece somente o PostgreSQL.

## Recursos implementados

- Cadastro com e-mail e senha
- Verificação de e-mail
- Recuperação e redefinição de senha
- Login com Google
- Login com Facebook
- Login com LinkedIn
- Preenchimento do currículo com nome, e-mail e foto da conta social
- Sessão persistente por 30 dias
- Currículos separados por usuário
- Criar, abrir, editar, duplicar e excluir currículos
- Exportação para PDF pelo navegador
- Envio do currículo em PDF para o e-mail confirmado da conta

## 1. Instalação

```bash
npm install
cp .env.example .env.local
```

Preencha todas as variáveis necessárias em `.env.local`.

## 2. Banco Supabase

No painel do Supabase, copie a URI PostgreSQL em **Project Settings > Database**.
Para funções serverless, prefira o **Session Pooler** quando disponível.

Defina a URI em `DATABASE_URL`. O projeto ativa SSL na configuração do
`node-postgres`, portanto não é necessário adicionar `sslmode` à URI.

Crie primeiro as tabelas do Better Auth:

```bash
set -a
source .env.local
set +a
npm run auth:migrate
```

Depois abra o SQL Editor do Supabase e execute [supabase-schema.sql](./supabase-schema.sql).

Importante: a migration do Better Auth precisa rodar primeiro, porque `resumes.user_id`
referencia a tabela `user`.

## 3. Resend

1. Crie uma conta no Resend.
2. Valide seu domínio de envio.
3. Crie uma API key.
4. Configure `RESEND_API_KEY` e `EMAIL_FROM`.

Em desenvolvimento, use um remetente autorizado pela sua conta do Resend.

## 4. Google

Crie credenciais OAuth 2.0 do tipo **Aplicativo da Web** no Google Cloud e
configure:

```text
Local:      http://localhost:3000/api/auth/callback/google
Produção:   https://SEU-DOMINIO/api/auth/callback/google
```

Adicione as credenciais em `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.

## 5. Facebook

Crie um aplicativo no Meta for Developers e configure:

```text
Local:      http://localhost:3000/api/auth/callback/facebook
Produção:   https://SEU-DOMINIO/api/auth/callback/facebook
```

Adicione o App ID e App Secret em `FACEBOOK_CLIENT_ID` e
`FACEBOOK_CLIENT_SECRET`. Para acesso público, coloque o aplicativo em modo
Live e conclua as exigências da Meta.

## 6. LinkedIn

No LinkedIn Developer Portal:

1. Crie o aplicativo.
2. Adicione o produto **Sign In with LinkedIn using OpenID Connect**.
3. Configure as URLs:

```text
Local:      http://localhost:3000/api/auth/callback/linkedin
Produção:   https://SEU-DOMINIO/api/auth/callback/linkedin
```

Configure `LINKEDIN_CLIENT_ID` e `LINKEDIN_CLIENT_SECRET`.

O OpenID Connect do LinkedIn fornece somente o perfil básico: nome, foto e,
quando disponível, e-mail. Experiências, formação, habilidades, cargo e URL
pública do perfil não fazem parte desse produto e dependem de acesso aprovado
a APIs adicionais do LinkedIn.

## 7. Execução local

O servidor Express inicia a API, o Better Auth e o Vite na mesma porta:

```bash
npm run dev
```

O comando carrega `.env.local` automaticamente e abre
`http://localhost:3000`. Para trabalhar apenas no layout, sem API:

```bash
npm run dev
```

## 8. Publicação

O projeto pode ser publicado em Railway, Render ou outra hospedagem compatível
com Node.js 20:

1. Envie o projeto para o GitHub.
2. Crie um serviço Node.js usando o repositório.
3. Cadastre as variáveis do `.env.example`.
4. Ajuste `BETTER_AUTH_URL` para a URL final, sem barra no fim.
5. Use `npm run build` como comando de build e `npm start` como comando inicial.
6. Cadastre a URL final nos callbacks do Google, Facebook e LinkedIn.

Ao usar domínio próprio, atualize `BETTER_AUTH_URL` e os três provedores OAuth.

## Segurança

- As credenciais do banco, Resend, Google, Facebook e LinkedIn ficam apenas no servidor.
- Toda operação de currículo valida a sessão e usa `user.id` no filtro SQL.
- O frontend nunca recebe a senha do PostgreSQL.
- A tabela `resumes` não é acessada diretamente pelo SDK do Supabase.
- Não envie `.env` ou `.env.local` para o GitHub.

## Comandos

```bash
npm run build
npm run check
npm audit --omit=dev
```
