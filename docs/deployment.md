# Deployment

The backend is a Node web service on Render. The frontend is a Vite app on Vercel. Both use the existing Supabase project. Prod is a third schema, `prod`, next to `dev` and `test`.

Deploy Render first, then Vercel, then set `CORS_ORIGIN` on Render to the Vercel URL and redeploy. Seed prod once the Render build has created the schema. Details are below, and the checklist is at the end.

## Supabase

Do not create a new Supabase project. Do not create the `prod` schema in the SQL editor.

Use the same connection string as dev and test. Change the query string to `?schema=prod`. The first `prisma migrate deploy` (the Render build, below) creates the schema and then applies the migrations.

## Render

Create a Node web service from this repository.

- Root directory: `backend`
- Build command: `npm install && npm run build && npm run db:deploy`
- Start command: `npm start`
- Health check path: `/api/health`

`package.json` asks for Node `>=22`. If Render does not pick that up, set the service's Node version to 22.

`npm run build` compiles `src/` to `dist/` with `tsconfig.build.json`. `npm start` runs `node dist/server.js`. `npm run db:deploy` runs `prisma migrate deploy` against the `DATABASE_URL` on the service, which is the prod schema.

Environment variables:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | The Supabase connection string with `?schema=prod` |
| `JWT_SECRET` | A new random secret, not the dev or test one. Generate it with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `1h` |
| `ADMIN_EMAIL` | The admin account the seed creates |
| `ADMIN_PASSWORD` | That account's password |
| `DEMO_USER_EMAIL` | The demo customer the seed creates |
| `DEMO_USER_PASSWORD` | That account's password |
| `CORS_ORIGIN` | The Vercel origin (scheme and host, no path). See the order below: the first deploy can use `http://localhost:5173`, then replace it with the Vercel URL |

`CORS_ORIGIN` may be several origins separated by commas, for example `https://your-app.vercel.app, http://localhost:5173`. Each value is trimmed.

The service reads these once at startup, so a change needs a redeploy. On startup it logs the schema name from `DATABASE_URL` and nothing else from that URL.

Render's free tier sleeps when idle. The first request after that can take up to a minute. The frontend shows a banner while it waits.

Do not run `npm run db:deploy` on your machine against `backend/.env`. That file points at the dev schema.

## Seed prod once

After the Render deploy is healthy, the `prod` schema exists and is empty. Seed it once from your machine.

1. Copy `backend/.env.example` to `backend/.env.prod`. Git ignores `backend/.env.prod`.
2. Set every variable. `loadConfig` rejects a missing one. Use the same `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DEMO_USER_EMAIL` and `DEMO_USER_PASSWORD` as the Render service. `PORT` can stay `4000`. `CORS_ORIGIN` can be the placeholder until you know the Vercel URL; the seed does not send browser requests.
3. From the `backend/` directory, run:

```
npx tsx --env-file=.env.prod prisma/seed.ts
```

`--env-file` sets the variables first. The script also loads `.env`, which does not override variables already set, so this uses the prod URL. Put every variable in `.env.prod` anyway. A key left out would be filled from `.env` (the dev database) or fail validation.

The script logs the target schema and never prints the connection string. It exits with an error if `DATABASE_URL` contains `schema=test`.

Run it once. Running it again updates the two accounts and does not add a second copy of the sample vehicles.

## Vercel

Create a project from this repository.

- Root directory: `frontend`
- Framework preset: Vite

`frontend/vercel.json` rewrites every path to `/index.html`, so a refresh of `/showroom` or `/login` loads the app.

Environment variables (set them before the first build; Vite inlines `VITE_*` at build time, so a later change needs a redeploy):

| Name | Value |
| --- | --- |
| `VITE_API_URL` | The Render origin, with no trailing slash, for example `https://your-service.onrender.com` |
| `VITE_DEMO_USER_EMAIL` | The same value as `DEMO_USER_EMAIL` |
| `VITE_DEMO_USER_PASSWORD` | The same value as `DEMO_USER_PASSWORD` |
| `VITE_DEMO_ADMIN_EMAIL` | The same value as `ADMIN_EMAIL` |
| `VITE_DEMO_ADMIN_PASSWORD` | The same value as `ADMIN_PASSWORD` |

These four demo values are public in the frontend bundle. Use the disposable seed passwords, never a password you use anywhere else.

## Order of operations

1. **Render.** Deploy the backend with the variables above. For this first deploy, `CORS_ORIGIN` can be `http://localhost:5173`. Wait until `GET https://<your-service>.onrender.com/api/health` returns `{ "status": "ok" }`. That build creates the `prod` schema. Then seed prod once, as above.
2. **Vercel.** Deploy the frontend with `VITE_API_URL` set to the Render origin and the four `VITE_DEMO_*` variables set to the seed accounts.
3. **CORS.** On Render, set `CORS_ORIGIN` to the Vercel origin (for example `https://your-app.vercel.app`) and redeploy. The API reads it only at startup. The browser can call the API after this redeploy finishes.
