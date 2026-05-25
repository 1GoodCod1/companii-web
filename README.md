# companii-web

Faber Companii frontend — **Zustand** (client state) + **TanStack Query** (server state). No Redux.

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5174` — proxies `/api` to `companii-api` when configured.

## Structure

- `src/api/client.ts` — fetch + `x-company-id`
- `src/stores/` — auth, companyContext, ui
- `src/features/*/api/` — TanStack hooks
- Routes: public, `/company/*`, `/portal/*`, `/admin/*`
