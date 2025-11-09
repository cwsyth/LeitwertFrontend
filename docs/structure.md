my-app/
├─ .env.local              # dev secrets (never commit)
├─ .env                    # non-secrets defaults
├─ next.config.ts
├─ package.json
├─ postcss.config.js
├─ tailwind.config.ts
├─ tsconfig.json
├─ public/                 # static assets (favicons, og images, fonts)
│  └─ robots.txt
├─ src/
│  ├─ app/                 # App Router pages/layouts
│  │  ├─ (marketing)/      # route groups for clarity
│  │  │  └─ page.tsx
│  │  ├─ (app)/            # authenticated app area
│  │  │  ├─ layout.tsx
│  │  │  └─ dashboard/
│  │  │     ├─ page.tsx
│  │  │     └─ @modals/   # parallel routes (e.g., modal)
│  │  ├─ api/              # route handlers (edge/node)
│  │  │  └─ hello/route.ts
│  │  ├─ sitemaps.xml/route.ts
│  │  ├─ robots.txt/route.ts
│  │  └─ globals.css
│  │
│  ├─ components/          # reusable UI
│  │  ├─ ui/               # shadcn/ui generated components live here
│  │  ├─ layout/           # navbar, footer, shell, sidebar
│  │  ├─ data-display/     # tables, charts, cards
│  │  └─ form/             # forms, inputs, zod-resolvers
│  │
│  ├─ features/            # feature-first modules (optional but powerful)
│  │  ├─ billing/
│  │  │  ├─ components/    # feature-specific UI
│  │  │  ├─ actions.ts     # server actions for this feature
│  │  │  ├─ queries.ts     # db/cache fetchers
│  │  │  ├─ types.ts
│  │  │  └─ index.ts
│  │  └─ auth/ …
│  │
│  ├─ lib/                 # framework-agnostic helpers
│  │  ├─ env.ts            # zod-validated process.env
│  │  ├─ utils.ts          # small shared utilities (cn(), formatters)
│  │  ├─ auth.ts           # auth config (e.g., next-auth)
│  │  ├─ db.ts             # db client (e.g., Prisma, Drizzle)
│  │  ├─ cache.ts          # react cache helpers
│  │  └─ image.ts          # next/image helpers
│  │
│  ├─ server/              # server-only code (never imported in client)
│  │  ├─ actions/          # co-located server actions when not feature-scoped
│  │  ├─ services/         # domain services (email, payments, search)
│  │  └─ repositories/     # persistence layer
│  │
│  ├─ hooks/               # client hooks (useTheme, useMediaQuery)
│  ├─ styles/              # extra css modules, tailwind addons
│  ├─ types/               # global types, api contracts
│  ├─ config/              # app-wide config (site, seo, nav items)
│  └─ test/                # unit tests (vitest/jest)
│
├─ e2e/                    # Playwright or Cypress tests
├─ scripts/                # dev/prod scripts (db seed, codegen)
└─ .vscode/                # editor settings (path aliases, format on save)
