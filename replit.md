# Crown Capital

Crown Capital is a premium wealth and investment landing experience for people building something meant to last.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/crown-capital/src/App.tsx` — single-page landing experience and interactions
- `artifacts/crown-capital/src/index.css` — Crown Capital visual system, typography, texture, and responsive styles
- `artifacts/crown-capital/package.json` — React/Vite app scripts and dependencies

## Architecture decisions

- The first release is presentation-first and intentionally has no backend.
- The app uses a single-page route with anchor navigation so the brand story stays continuous.
- Primary conversation CTAs use a lightweight in-page dialog and local submission state.

## Product

- A responsive Crown Capital brand site with a premium editorial feel.
- Sections covering the firm's approach, portfolio operating view, perspective notes, relationship principles, and FAQs.
- Working mobile navigation, FAQ accordion, smooth section navigation, and private-conversation CTA flow.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
