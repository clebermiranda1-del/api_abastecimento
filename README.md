# Controle Abastecimento API

API local para o app Controle Abastecimento.

## Configurar

1. Instale dependências:

```bash
npm install
```

2. Crie o arquivo `.env` a partir do `.env.example` e ajuste `DATABASE_URL`.

3. Rode as migrations:

```bash
npm run migrate
```

4. Inicie a API:

```bash
npm run dev
```

A API fica em `http://localhost:3000`.

No emulador Android, use `http://10.0.2.2:3000` para acessar a API local do computador.

## Rotas principais

- `GET /health`
- `POST /abastecimentos`
- `POST /logs`
- `POST /auth/primeiro-acesso`
- `POST /auth/status`
- `POST /admin/revogar-acesso`
- `POST /admin/liberar-acesso`
- `GET /configuracoes/app`

## Deploy Render + Supabase

1. Crie/ajuste o banco no Supabase executando os SQLs da pasta `migrations/` no SQL Editor, em ordem.
2. Pegue a connection string do Supabase em Project Settings > Database. Use a URI com senha.
3. Suba este projeto para um repositório GitHub.
4. No Render, crie um Web Service conectado ao repositório.
5. Configure:

```text
Build Command: npm install
Start Command: npm start
Health Check Path: /health
```

6. Configure Environment Variables no Render:

```text
DATABASE_URL=<connection string do Supabase>
APP_TOKEN=TOKEN_APP_001
NODE_ENV=production
```

7. Depois do primeiro deploy, rode as migrations no Supabase se ainda não tiver rodado.
8. Troque a URL do app Android para a URL pública do Render.
