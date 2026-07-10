# Zelvem - AGENTS.md

Always-on rules for Claude Code. Read CLAUDE.md for full architectural context.

---

## Dependency Management

**No carets or tildes in `dependencies` or `devDependencies`.** Ever. All non-peer dependencies must use exact versions.

```json
// correct
"dependencies": { "neverthrow": "8.1.1" }
"devDependencies": { "vitest": "3.2.4" }

// never
"dependencies": { "neverthrow": "^8.1.1" }
```

**Exception — `peerDependencies` use ranges intentionally.** A peer range expresses compatibility, not pinning. Forcing an exact version in a peer would break consumers on any patch release.

```json
// correct in peerDependencies
"peerDependencies": { "@nestjs/common": "^11.0.0" }
```

**pnpm 11 reads security config from `pnpm-workspace.yaml`, not `package.json`.** The effective controls are:
- `saveExact: true` in `pnpm-workspace.yaml` — enforces exact versions on `pnpm add`
- `allowBuilds` in `pnpm-workspace.yaml` — allowlist for lifecycle scripts (replaces `onlyBuiltDependencies` in package.json, which pnpm 11 ignores)

`.npmrc` stays intact for the other security settings (`ignore-scripts=true`, `registry`, etc.). Never modify either file without flagging it in the session report.

**Adding a new dependency checklist:**
1. Check if an existing `@zelvem/*` package or already-installed dependency covers the need (Ponytail rung 2 and 5)
2. Use exact version: `pnpm add package@x.y.z`
3. Verify no `^` or `~` was introduced in `dependencies` or `devDependencies`
4. If the package needs lifecycle scripts, add it to `allowBuilds` in `pnpm-workspace.yaml` and document why in the session report

---

## File and Component Naming

**NestJS files:** `[name].[type].ts` — always suffix with the role.
```
email.controller.ts
email.service.ts
email.module.ts
email.repository.ts
```

**Custom shadcn/ui components:** PascalCase prefixed with `Zelvem`. The prefix signals it is a Zelvem-customized component, not a raw shadcn primitive.
```
ZelvemInput.tsx
ZelvemButton.tsx
ZelvemDatePicker.tsx
```
These live in `packages/@zelvem/ui/`. Never modify shadcn primitives in place — extend them into a `Zelvem*` component instead.

**Feature flags beyond `ZELVEM_HOSTED`:** follow the `ZELVEM_` prefix convention.
```bash
ZELVEM_HOSTED=true
ZELVEM_SOCIAL_ENABLED=false   # module-level flag
ZELVEM_DIGEST_CRON=0 7 * * *  # configurable behavior
```
All flags must have a corresponding entry in `.env.example` with a descriptive comment.

---

## Prompt Conventions (`@zelvem/ai`)

No prompt frameworks. No LangChain. The Vercel AI SDK + Zod + TypeScript cover everything needed.

Each prompt file in `generation/prompts/` exports three things co-located:
1. An input interface (typed metadata only — never raw content)
2. A Zod schema for the structured output
3. A builder function that constructs the prompt string

```ts
// generation/prompts/email-digest.ts

/** Metadata accepted by this prompt. Raw email bodies are never passed. */
export interface EmailDigestInput {
  account: string
  emailCount: number
  summaries: Array<{ subject: string; from: string; oneLiner: string }>
}

/** Structured output schema validated by Vercel AI SDK */
export const emailDigestSchema = z.object({
  digest: z.string(),
  actionRequired: z.array(z.string()),
})

/** Builds the prompt from metadata only */
export function buildEmailDigestPrompt(input: EmailDigestInput): string {
  return `...`
}
```

Functions in `generation/functions/` orchestrate the call:

```ts
// generation/functions/summarizeDigest.ts
export async function summarizeDigest(input: EmailDigestInput) {
  return generateObject({
    model: getModel(),
    schema: emailDigestSchema,
    prompt: buildEmailDigestPrompt(input),
  })
}
```

The rest of the app only ever imports from `generation/functions/`. Prompts and schemas are internal to `@zelvem/ai`.

---

## Engineering Conventions

**Testing: Vitest**
All unit and integration tests use Vitest. NestJS module tests use `@nestjs/testing` with Vitest as the runner. Test files live alongside the code they test (`*.spec.ts`). Follow TDD via Superpowers: write the failing test first, then implement.

**Environment variables**
Validate all required env vars at startup using `@nestjs/config` with a Zod schema. The app must refuse to start if a required var is missing — no silent failures.
Keep `.env.example` updated every time a new env var is introduced. It is the canonical reference for what variables the project needs. Every new var gets an entry with a descriptive comment.

```ts
// Example: new var added to code
TEI_BASE_URL=http://tei:8080  # Base URL for the local HuggingFace TEI instance (bge-m3)
```

**Error handling: Result pattern**
Use `neverthrow` for non-critical errors. Services and repositories return `Result<T, AppError>` instead of throwing. Only unexpected/unrecoverable errors bubble up as NestJS exceptions.

`AppError` lives in `@zelvem/core` — import it from there across all packages and apps.

```ts
import { AppError } from '@zelvem/core'

// repository
return ok(user)
return err(new AppError('USER_NOT_FOUND'))

// service — chain without throwing
const result = await userRepo.findById(id)
if (result.isErr()) return err(result.error)
```

NestJS exception filters handle the truly exceptional layer. Business logic errors are resolved, not thrown.

**Validation pipes**
`ValidationPipe` registered globally in `main.ts` with `whitelist: true` and `forbidNonWhitelisted: true`. DTOs in `@zelvem/contracts` are the single source of validation.

**Linting and formatting**
- `pnpm lint` — ESLint flat config (eslint recommended + typescript-eslint recommended + react-hooks scoped to web and @zelvem/ui). Run from root, covers the whole monorepo.
- `pnpm format` — Prettier, writes in place.
- `pnpm format:check` — Prettier check, CI-ready, fails on drift.

Three gates must pass before marking any task complete (in order):
```
pnpm format:check   # style
pnpm lint           # errors
pnpm build          # types + compilation
```

`docs/` is excluded from both lint and format — design reference prototypes, not application code.

**Logging: nestjs-pino**
Use `nestjs-pino` with `pino-pretty` in development. JSON structured output in production. Register as a global logger in `app.module.ts`. No `console.log` in application code.

---

## Non-Negotiable Rules

These are hard stops. No exceptions regardless of task scope.

- **No module calls AI APIs directly.** All AI goes through `@zelvem/ai/generation/functions/` or `@zelvem/ai/embeddings/client.ts`.
- **User content never leaves the server.** No emails, notes, audio, or transcripts sent to external APIs. Embeddings run locally via HuggingFace TEI.
- **`repository.ts` is the only Prisma layer.** `service.ts` files never import `PrismaClient` directly.
- **Workers never expose HTTP.** The API enqueues jobs; workers only process them.
- **No auto-send on email, no auto-publish on blog.** These actions always require explicit human confirmation.

---

## Stack Rules

- **UI (web/desktop):** always `shadcn/ui` components. Never native HTML inputs (`<input type="date">`, `<select>`, etc.) when a styled component exists in `@zelvem/ui`.
- **UI (landing):** artisanal components, light theme only, no shadcn and no dark mode. Zero-JS and SEO take priority. Shares design tokens and the "Tinta + Musgo" palette, not components.
- **Backend:** NestJS modules, providers, controllers, DTOs, and repositories are required structure, not over-engineering. Do not simplify them away.
- **Packages:** check existing `@zelvem/*` packages before creating anything new. Reuse first.
- **New package:** only justified if the abstraction is needed by 2+ apps and has no existing home.
- **Microservice:** only justified if task load demands it (e.g. audio transcription at scale). Never for business design reasons.
- **Assets:** if a file is consumed by an `import` or `<img src>`, it lives in `packages/@zelvem/assets/`. If it is visual reference for humans, it lives in `docs/design/`. Application code never imports from `docs/`. App `public/` folders hold derived copies for direct-URL serving (favicons, manifest) — `@zelvem/assets` is always the canonical source.
- **Database:** `repository.ts` handles all Prisma calls. `service.ts` handles business logic only.

---

## Code Standards

- All code, variable names, and comments in **English**.
- Comments follow **TSDoc**. Only comment the *why*, never the *what*.
- CSS custom properties use English names: `--ink`, `--paper`, `--moss`, `--accent-border`, etc.
- All user-facing strings go through the **i18n layer**. No hardcoded strings in components.
- **Import order**: (1) external packages, (2) `@zelvem/*`, (3) relative imports — blank line between groups.
- **Named exports only** — no default exports except React page/screen components and Next.js special files (`layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`).
- **No `any`** — use `unknown` and narrow it. Any `eslint-disable` on an `any` requires an explicit comment explaining why.
- **No TypeScript `enum` keyword** — use `as const` + union type. Interops cleanly with Zod and Prisma.
- **NestJS module boundaries** — never import a service or repository from another module directly. Cross-module access goes through `exports` in `module.ts`.

---

## Ponytail Mode

Mode: **`full`**. Never default to `ultra` on NestJS/backend code.

Ponytail's rung 5 ("already-installed dependency") applies to:
- `shadcn/ui` components over native inputs
- `@zelvem/*` utilities over new implementations
- Existing NestJS patterns over custom solutions

**Deliberate shortcut annotation:** when taking a conscious simplification that may need upgrading later, annotate it inline:
```ts
// ponytail: global in-memory lock — switch to Redis-backed lock if multi-instance
// ponytail: linear scan — add index on userId+createdAt if list grows beyond 10k rows
```
These comments are the source of truth for future upgrades. Never leave shortcuts silent.

**Commands and when to use them:**

| Command | When |
|---|---|
| `/ponytail-review` | Before marking any task complete - finds over-engineering in the current diff |
| `/ponytail-audit` | At the start of a new module - scans the whole repo for existing bloat first |
| `/ponytail-debt` | At the end of every session - harvests all `ponytail:` comments into a debt ledger |
| `/ponytail lite\|full\|ultra\|off` | Use `off` temporarily only if a task genuinely requires upfront structure |
| `/ponytail-help` | Quick command reference |

---

## Superpowers Integration

**Before starting any new feature or module:**
Use `/brainstorming` to clarify requirements, edge cases, and design decisions before writing a single line of code. Skip this only for trivial changes (typo fixes, config updates).

**For implementation tasks:**
Use `/execute-plan` to batch the work into reviewable checkpoints. The code-reviewer agent will evaluate against this AGENTS.md and CLAUDE.md automatically.

**For all non-trivial code:**
Follow TDD - write the failing test first (red), implement the minimum to pass (green), then refactor. Tests live alongside the module they test.

**For debugging:**
Follow the 4-phase methodology: reproduce, root cause, hypothesis, fix. If three fix attempts fail, stop and flag for architectural review before continuing.

---

## Security

The **security-guidance** plugin runs automatically as a pre-tool hook on every Write/Edit/MultiEdit. It catches generic code-level vulnerabilities (command injection, XSS, unsafe `eval()`, `child_process.exec()`, etc.) before changes are applied. Treat its warnings as **blockers**, not suggestions - do not proceed until the pattern is resolved.

The plugin does not cover Zelvem's architectural security rules. These are enforced here:

- **Credentials never touch application code.** OAuth tokens (Gmail, LinkedIn, X), API keys, and secrets live in environment variables only. Never log them, never include them in BullMQ job payloads, never pass them through the request context.
- **BullMQ jobs carry IDs, not content.** A job payload may contain `{ userId, emailId }` but never the email body, audio buffer, or any user content. The worker fetches the content itself from the DB.
- **Every API route goes through NestJS guards.** No ad-hoc `if (!user) throw` checks in controllers. Auth and authorization live in `common/guards/`.
- **TEI endpoint is internal only.** Never expose the HuggingFace TEI port externally. It is reachable from the api container (query-time embeddings) and the workers container (batch ingestion) at `http://tei:8080/embed` — nothing else.
- **faster-whisper endpoint is internal only.** Same pattern as TEI: never exposed externally, reachable from the workers container only (transcription is always an async job, never in the request path).
- **pgbouncer in transaction mode.** Never use session-mode features (prepared statements, advisory locks, `SET` commands) - they break under pgbouncer transaction mode.
- **No user content in LLM prompts.** Prompts receive summaries or metadata. Raw email bodies, notes, or audio transcripts never go into a generation prompt.

---

## Session Discipline

Each session targets a single, scoped task completable in ~3 hours.

**Start of session:**
1. State the task and its scope explicitly.
2. If the task could exceed 3 hours, split it and confirm the boundary before starting.
3. Read the relevant module files before touching them.

**During session:**
- One thing at a time. Finish and test before moving to the next file.
- If something unexpected requires a significant architectural decision, stop and surface it rather than improvising.

**End of session:**
Produce a structured report in this exact format:

---
## Session Report

### Skills activated this session
| Skill / Plugin | Moment | Result |
|---|---|---|
| Ponytail full | pre-hook every turn | active |
| security-guidance | pre-tool hook on Write/Edit | active |
| /brainstorming | before starting task | [ used / skipped — reason ] |
| /execute-plan | implementation | [ used / skipped — reason ] |
| TDD | non-trivial code | [ used / skipped — reason ] |
| /ponytail-review | before marking complete | [ used / skipped — reason ] |
| /ponytail-debt | end of session | [ used / skipped — reason ] |
| /ponytail-audit | new module start | [ used / skipped — reason ] |

### What happened
- [ short bullet list of what was completed, one line each ]

### Pending
- [ what was not finished and why, if applicable ]

### Decisions made
- [ any architectural or implementation decision taken during the session that was not pre-defined ]

### Docs to update
Flag any file that needs updating as a result of this session:
- **CLAUDE.md** — [ what needs to be added or changed, or "none" ]
- **AGENTS.md** — [ what needs to be added or changed, or "none" ]
- **DESIGN.md** — [ what needs to be added or changed, or "none" ]

### Suggestions
- [ optional: patterns observed, risks spotted, things worth discussing before the next session. Omit section if nothing to flag ]

### Next task
[ single sentence describing the logical next step ]
---

## Build Order (reference)

Base infrastructure before any module. Do not start a module until the base is solid.

1. Monorepo scaffold (Turborepo + pnpm workspaces, `@zelvem/*` package structure)
2. `@zelvem/database` (Prisma schema skeleton + `getDb(userId)` factory)
3. `@zelvem/contracts` (Zod schema structure, empty per module)
4. `@zelvem/auth` (JWT, session handling)
5. `apps/api` shell (NestJS app module, guards, interceptors, queue setup)
6. `@zelvem/ui` (shadcn/ui setup, design tokens wired)
7. `apps/web` shell (Next.js App Router, auth flow, dashboard layout, rail)
8. `docker/docker-compose.yml` (Postgres + Redis + TEI + faster-whisper + api + workers)
9. Modules: one at a time, decided at session start.
10. `apps/landing` (Astro, zelvem.com) — independent of module progress, can be built any time after step 1. Light theme only, artisanal components, shares design tokens.
