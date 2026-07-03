# Zelvem - CLAUDE.md

This file is the source of truth for Claude Code. Every architectural, stack, and product decision documented here was made deliberately. Do not propose alternatives to decisions already made unless a concrete problem justifies it.

---

## What is Zelvem

Zelvem is **Life Infrastructure Software** and creates its own category: **Personal Control System (PCS)**. It is not a productivity app. It does not sell efficiency. It sells clarity, control, and operational calm.

A single app with toggleable modules that organizes the user's digital life without replacing them in it. The user is always in command. The system works in the background.

**Archetype: "The Architect"** - provides the blueprint, does not build for you.

**Core principle (affects both architecture and brand):**
> Deterministic code is the default. AI is only invoked where code cannot reach: text generation, embeddings, fuzzy classification. It does not decide, does not execute, does not automate outside the system. It handles the tedious and repetitive work; the human exists for creative tasks and those that require judgment.

Any feature that breaks this breaks the product's promise.

---

## Product Model

| Tier | Description |
|---|---|
| **Zelvem Community** | Source-available, BUSL 1.1 (Change Date 2099). Free for personal use and teams of up to 5 people. Self-hosted via `docker compose up`. No Stripe. No native mobile app. |
| **Zelvem Community Team License** | 6+ people self-hosting. Requires a paid commercial license. |
| **Zelvem Hosted** | SaaS operated by Zelvem. Includes native mobile app. Same code as Community; the difference is who operates the infrastructure. |

**Flavors are controlled by environment variables, not duplicated code or separate branches.**

```bash
# Community - these vars absent or false -> features disabled silently
ZELVEM_HOSTED=false
STRIPE_SECRET_KEY=       # absent -> billing does not initialize

# Hosted - Zelvem server
ZELVEM_HOSTED=true
STRIPE_SECRET_KEY=sk_live_...
```

---

## Coding Agent

This project uses **Ponytail** in `full` mode as a discipline layer. It applies YAGNI before writing any code. Rung 5 ("already-installed dependency") covers shadcn/ui and `@zelvem/*` utilities.

Zelvem-specific rules that override Ponytail live in `AGENTS.md` at the repo root. The most important ones:

- **UI (web/desktop):** always use shadcn/ui; never use native HTML inputs when a styled component exists. The landing (Astro) is the exception: artisanal components, light theme only, no shadcn — SEO and zero-JS take priority there.
- **Backend:** NestJS structure (modules, providers, DTOs) is required structure, not over-engineering; do not simplify it away
- **Packages:** reuse existing `@zelvem/*` packages before creating a new one
- **Privacy:** never send user content to external APIs

Never use `ultra` mode as the default for NestJS/backend code.

---

## Code Standards

All code, variable names, function names, file comments, and inline comments must be in **English**. No exceptions. This includes CSS custom property names (`--ink`, `--paper`, `--moss`, `--accent-border`, etc.) - no Spanish abbreviations in variable names.

When comments are necessary, follow **TSDoc** conventions:

```ts
/**
 * Resolves the Prisma client for a given user.
 * For Community (single-user), always returns the same instance.
 *
 * @param userId - The unique identifier of the user
 * @returns A PrismaClient scoped to the user's logical database
 */
export function getDb(userId: string): PrismaClient { ... }
```

Write comments only when the *why* is not obvious from the code. Do not comment what the code does; comment why it does it.

**Formatting: Prettier** (`.prettierrc.json` at root — do not override per package):
- No semicolons
- Single quotes
- Print width 100
- Trailing commas

`docs/` is excluded from both linting and formatting — design reference prototypes, not application code.

**Import order** — three groups, separated by blank lines, in this order:
1. Node built-ins and external packages
2. Internal monorepo packages (`@zelvem/*`)
3. Relative imports (`./`, `../`)

```ts
import { Injectable } from '@nestjs/common'
import { Result, ok, err } from 'neverthrow'

import { AppError } from '@zelvem/core'
import { getDb } from '@zelvem/database'

import { CreateEmailDto } from './email.dto'
import { EmailRepository } from './email.repository'
```

**Named exports only** — no default exports, except:
- React components (Next.js and Expo require default exports for pages/screens)
- Next.js `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`

```ts
// correct
export function createUser() { ... }
export class UserService { ... }

// never (outside the exceptions above)
export default function createUser() { ... }
```

**No `any`** — never use `any` as an escape hatch. If the type is genuinely unknown, use `unknown` and narrow it. A `// eslint-disable` on an `any` line requires an explicit comment explaining why no better type exists.

**No TypeScript `enum` keyword** — use `as const` + union type instead. TypeScript enums compile to runtime objects, break tree-shaking, and do not interop cleanly with Zod and Prisma types.

```ts
// never
enum TodoStatus { PENDING = 'PENDING', DONE = 'DONE' }

// correct
const TodoStatus = {
  PENDING: 'PENDING',
  DONE: 'DONE',
} as const

type TodoStatus = typeof TodoStatus[keyof typeof TodoStatus]
// → 'PENDING' | 'DONE' — works natively with Zod and Prisma
```

**NestJS module boundaries** — a module never imports a service or repository from another module directly. Cross-module access goes through the exporting module's public API (`exports` in `module.ts`). This keeps the modular monolith from becoming spaghetti.

```ts
// never — EmailService importing TodosRepository directly
import { TodosRepository } from '../todos/todos.repository'

// correct — import the module and use its exported provider
@Module({ imports: [TodosModule] })
export class EmailModule {}
```

---

## Internationalization (i18n)

The app ships with two locales: **Spanish (`es`)** and **English (`en`)**. Spanish is the primary voice of the product; English is the secondary locale.

All user-facing strings must go through the i18n layer. No hardcoded strings in components.

**Translation philosophy: free translation, never literal.** Each locale must sound natural and maintain the product's tone - calm, direct, in control. A string that works in Spanish does not translate word-for-word into English. Adapt for tone and meaning, not for dictionary equivalence.

```
es: "Vos seguís al mando."
en: "You're in control."  -- not: "You continue being in command."

es: "Recobra el control de tu vida."
en: "Take back control of your life."  -- not: "Recover the control of your life."
```

---

## Authentication

| Tier | Methods |
|---|---|
| **Community self-hosted** | Email + password (argon2) only. No external dependencies, no SMTP required. |
| **Hosted** | SSO Google, SSO Apple, magic link (fallback), Passkeys. |

OAuth integrations (Google, Apple), magic link, and Passkeys are Hosted-only. They are not implemented in Community.

---

## Functional Modules

1. **Email** - multi-account, daily digest, classification, reply assistance. **No auto-send, ever.**
2. **Blog** - drafts from audio or text. Audio -> transcription -> draft. **Always human review before publishing.**
3. **Todos/Projects** - multi-source capture: audio, email, loose ideas -> ingestion pipeline -> tasks. Not simple manual CRUD.
4. **Social** - LinkedIn and X only.
5. **Calendar** - management and optimization.
6. **Finance** - personal monthly expenses.

---

## Stack - Closed Decisions, Do Not Reopen

| Layer | Technology | Reason |
|---|---|---|
| Monorepo | **Turborepo + pnpm** | Vercel standard, simple, well documented |
| Landing | **Astro** | Zero JS by default, perfect Lighthouse scores, React islands for interactive components (Stripe form, pricing toggle). SEO-first by design. |
| Web | **Next.js (App Router)** | |
| Mobile | **React Native + Expo** | Zelvem Hosted only |
| Desktop | **Tauri** | Lightweight, no Rust required, points to the deployed web app |
| Backend | **NestJS - modular monolith** | Domain module separation within a single process. A microservice is only valid if the task load demands it (e.g. audio transcription at scale), not for business design reasons. |
| Workers | **BullMQ + Redis** | Only for genuinely async/heavy tasks: transcription, embeddings, daily digest |
| Database | **PostgreSQL + Prisma** | Real relations between modules, ACID for finance, `jsonb` for flexible fields, versioned migrations |
| Cache | **Redis** | Shared with BullMQ |
| UI Components | **shadcn/ui + Tailwind** | Owned code (not a package dependency), 100% customizable |
| AI | **Vercel AI SDK** | Provider-agnostic: Anthropic, self-hosted OpenAI-compatible (VPS), etc. |
| Embeddings | **bge-m3 via HuggingFace TEI** | Self-hosted, never an external API. User content never leaves the server. TEI (text-embeddings-inference) is used instead of Ollama — TEI is purpose-built for embedding throughput with automatic batching, critical for async ingestion via BullMQ. |
| Transcription | **faster-whisper (medium)** | Self-hosted Whisper via CTranslate2, ~4x faster than original with same accuracy. Runs as a Docker sidecar service (same pattern as TEI): internal only, workers call it over HTTP. `medium` model is the default for both Community and Hosted — best quality/resource balance for Spanish + English. Audio never leaves the server. |
| Billing | **Stripe** (Hosted only) | Encapsulated in `@zelvem/billing`, inactive if `STRIPE_SECRET_KEY` is absent |

---

## Monorepo Structure

```
zelvem/
├── apps/
│   ├── landing/                      # Astro - zelvem.com (public landing, SEO-first)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   └── components/           # artisanal landing components, not shadcn
│   │   └── astro.config.mjs
│   │
│   ├── web/                          # Next.js - app.zelvem.com (authenticated app)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx        # sidebar with active modules
│   │   │       ├── inbox/
│   │   │       ├── calendar/
│   │   │       ├── todos/
│   │   │       ├── blog/
│   │   │       ├── social/
│   │   │       └── finance/
│   │   ├── components/
│   │   └── lib/
│   │       └── api-client.ts         # typed with @zelvem/contracts
│   │
│   ├── mobile/                       # Expo - Zelvem Hosted only
│   │   ├── app/
│   │   │   └── (tabs)/
│   │   ├── components/               # native components, not shared with web
│   │   └── lib/
│   │       └── api-client.ts
│   │
│   ├── desktop/                      # Tauri - points to deployed web app
│   │   └── src-tauri/
│   │       ├── tauri.conf.json
│   │       └── Cargo.toml
│   │
│   ├── api/                          # NestJS - modular monolith
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── common/
│   │       │   ├── guards/
│   │       │   └── interceptors/
│   │       ├── modules/
│   │       │   ├── email/
│   │       │   │   ├── email.module.ts
│   │       │   │   ├── email.controller.ts
│   │       │   │   ├── email.service.ts
│   │       │   │   └── email.repository.ts
│   │       │   ├── calendar/
│   │       │   ├── todos/
│   │       │   ├── blog/
│   │       │   ├── social/
│   │       │   └── finance/
│   │       └── queue/                # enqueues jobs only, does not process them
│   │
│   └── workers/                      # BullMQ processors
│       └── src/
│           └── processors/
│               ├── transcription.processor.ts
│               ├── embeddings.processor.ts
│               └── email-digest.processor.ts
│
├── packages/
│   ├── @zelvem/database/             # Prisma schema + client factory
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       ├── client.ts             # getDb(userId) -> PrismaClient
│   │       ├── migrations.ts         # runs prisma migrate deploy programmatically on container start
│   │       └── pool.ts
│   │
│   ├── @zelvem/contracts/            # Zod schemas + DTOs - API contract
│   │   └── src/
│   │       ├── email.contracts.ts
│   │       ├── blog.contracts.ts
│   │       ├── todos.contracts.ts
│   │       ├── social.contracts.ts
│   │       ├── calendar.contracts.ts
│   │       └── finance.contracts.ts
│   │
│   ├── @zelvem/ui/                   # shadcn/ui + Tailwind - web and desktop only
│   │                                 # landing shares design tokens and palette only,
│   │                                 # not shadcn components (uses artisanal components)
│   │
│   ├── @zelvem/ai/                   # single AI entry point - never call AI APIs directly
│   │   ├── generation/               # text via Vercel AI SDK - may use external APIs
│   │   │   ├── providers/
│   │   │   │   ├── anthropic.ts
│   │   │   │   └── self-hosted.ts    # OpenAI-compatible VPS
│   │   │   ├── prompts/
│   │   │   │   ├── blog-from-transcript.ts
│   │   │   │   └── email-digest.ts
│   │   │   └── functions/            # the only thing the rest of the app imports
│   │   │       ├── generateBlogDraft.ts
│   │   │       ├── summarizeDigest.ts
│   │   │       └── classifyEmail.ts  # receives metadata, never the raw body
│   │   └── embeddings/               # NEVER external APIs - local TEI only
│   │       └── client.ts             # HTTP to HuggingFace TEI, bge-m3
│   │
│   ├── @zelvem/auth/                 # JWT / sessions
│   ├── @zelvem/core/                 # pure shared logic (no UI, no DB)
│   ├── @zelvem/billing/              # Stripe - inactive if STRIPE_SECRET_KEY is absent
│   │   └── src/
│   │       ├── stripe.client.ts
│   │       ├── webhooks.handler.ts
│   │       └── plans.ts
│   ├── config-eslint/
│   ├── config-tsconfig/
│   └── config-tailwind/
│
├── docker/
│   ├── docker-compose.yml            # Community: Postgres + Redis + TEI + whisper + api + workers
│   └── docker-compose.hosted.yml     # Hosted: same + pgbouncer
│
├── turbo.json
├── pnpm-workspace.yaml
├── LICENSE                           # BUSL 1.1, Change Date 2099
├── CLAUDE.md                         # this file
└── package.json
```

---

## Data Architecture (Zelvem Hosted)

- **Per-user DB**: same Postgres cluster, one isolated logical database per user (no `tenant_id`, no shared schema).
- **Connection pool**: pgbouncer in transaction mode.
- **Vectors**: pgvector as an extension inside the user's DB. No external vector store.
- **Embeddings inference**: HuggingFace TEI runs as a sidecar service (`http://tei:8080/embed`). Internal only — reachable from api (query-time embedding for semantic search) and workers (batch ingestion). Never exposed externally.
- **`getDb(userId)`**: the factory in `@zelvem/database` resolves the connection string. For Community (single user) it always returns the same client, compatible without changing any module code.
- **Embedding model tracking**: every embedding row stores the model and version that generated it. This makes model migrations a BullMQ job, not a catastrophe.

```prisma
model Embedding {
  id           String   @id @default(cuid())
  contentId    String
  contentType  String   // "email" | "todo" | "event"
  vector       Unsupported("vector(1024)")
  model        String   // "bge-m3"
  modelVersion String   // "v1.0"
  createdAt    DateTime @default(now())

  @@index([contentId, contentType])
}
```

The HNSW index on the vector column cannot be declared in the Prisma schema (`Unsupported` type) — it is created via raw SQL in the migration:

```sql
CREATE INDEX embedding_vector_hnsw_idx ON "Embedding"
  USING hnsw (vector vector_cosine_ops);
```

**Retrieval strategy (query router pattern):**
The retrieval layer in `@zelvem/ai` must implement a query router. The strategy is chosen by query type, not by entity type. The same `todos` table can be hit by both strategies depending on what is being asked.

- **Deterministic SQL:** structured or temporal queries ("my todos this week", "events with Juan in March", "expenses over $100"). Filter by userId, date range, module. No embeddings involved.
- **Hybrid semantic:** open-ended or fuzzy queries ("anything pending about the launch?", "what did we decide about X?"). BM25 + pgvector with Reciprocal Rank Fusion. bge-m3 handles Spanish and English without separate models.
- **Mixed:** SQL narrows the candidate set first (userId, module, date range), then hybrid re-ranks within that result. Never run a full-table semantic scan.

OKF is rejected as a retrieval engine. Accepted only as an export/portability format.

---

## Architecture Rules - Always Follow

1. **No module calls AI APIs directly.** Everything goes through functions in `@zelvem/ai/generation/functions/` or `@zelvem/ai/embeddings/client.ts`.
2. **User content (emails, notes, audio) is never sent to external APIs.** Embeddings are generated locally via HuggingFace TEI. Text generation prompts receive summaries or metadata, never the raw body.
3. **`repository.ts` is the only layer that talks to `@zelvem/database`.** `service.ts` files do not import Prisma directly.
4. **`@zelvem/contracts` is the contract between frontend and API.** The same Zod schemas validate at runtime and generate TypeScript types. If a contract changes and the frontend is not updated, the build breaks. That is intentional.
5. **Workers only process, they never expose HTTP.** The API enqueues, the worker processes.
6. **Minimum complexity.** If a mature library solves the problem, use it. Do not reinvent.
7. **Supply-chain security is non-negotiable.** All dependencies use exact versions (no `^` or `~`). Lifecycle scripts are disabled by default via `.npmrc`. Security settings in `.npmrc` and `pnpm-workspace.yaml` are never modified without explicit justification. See `AGENTS.md` for the full dependency checklist.
8. **Status fields are Prisma enums, not strings.** Any field with a finite set of valid values (e.g. `BlogDraft.status`, `Todo.status`, `SocialPost.status`) must be defined as a Prisma `enum`. The DB constrains the domain — not just the Zod layer. Running a migration to add a new value is the expected workflow.

---

## Design and UI

High-fidelity designs are organized by surface under `docs/design/`:

```
docs/design/
├── web/          # web app (app.zelvem.com) — Next.js
│   └── DESIGN.md
├── landing/      # landing (zelvem.com) — Astro
│   └── DESIGN.md
├── app/          # mobile app — Expo (Hosted only)
│   └── DESIGN.md
└── common/       # shared assets across surfaces (logo, favicons, SVGs)
```

Before touching any frontend component, read the DESIGN.md for the relevant surface.

Each DESIGN.md contains: design tokens, app shell, cross-cutting patterns, and full specs for the modules of that surface.

The `.dc.html` files are visual reference prototypes. Open them in a browser with `support.js` alongside.

**Rule:** any visual decision not covered in the relevant DESIGN.md requires confirmation before implementing.

---

## Visual Identity

**"Tinta + Musgo"** palette - the 4 brand tokens:

| CSS Variable | Light | Dark | Use |
|---|---|---|---|
| `--ink` | `#14171A` | `#F2F0E9` | Primary text |
| `--paper` | `#F2F0E9` | `#141110` | App background |
| `--moss` | `#3F5D42` | `#6E9A73` | Single brand accent |
| `--muted` | `#8A8579` | `#7C7567` | Secondary / labels |

The full token system (surfaces, borders, Email and Calendar modules, categorical tag palette) is in `docs/design/web/DESIGN.md`.

No generic tech blues. No AI gradients. No wellness/zen aesthetics.
References: Linear, Stripe, Figma, Cursor, Notion, Arc.

---

## Domain and Contact

- **Landing**: zelvem.com (Astro, public, SEO-first)
- **Web app**: app.zelvem.com (Next.js, authenticated)
- **Contact**: info@zelvem.com
