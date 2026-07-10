# design-sync notes — @zelvem/ui

- The package ships NO build and NO compiled CSS by design (apps consume it as source via
  Next `transpilePackages`). The converter runs in synth-entry mode:
  `--entry ./packages/@zelvem/ui/src/index.ts`, `--node-modules apps/web/node_modules`
  (react/react-dom live there; the ui package's own node_modules has neither).
- CSS is compiled by `buildCmd` (`node .design-sync/build-css.mjs`) from the Tailwind v4
  source into `packages/@zelvem/ui/.ds-preview.css` (gitignored; `cssEntry` points at it —
  cssEntry is bounded to the package dir). The entry file is written inside `.ds-sync/` so
  `@import 'tailwindcss'` resolves from the sandbox node_modules. Requires the fresh-clone
  symlink: `ln -sfn ../.ds-sync/node_modules .design-sync/node_modules`.
- `[ZERO_MATCH]` without `componentSrcMap`: no `.d.ts` tree, so the three components are
  pinned explicitly in config. Add new components there as `@zelvem/ui` grows.
- Fonts: Geist/Geist Mono ship via a remote Google Fonts `@import` in the compiled CSS
  (`[FONT_REMOTE]`, accepted) and `:root` bridges `--font-geist`/`--font-geist-mono`
  (next/font defines those at runtime in the apps).
- The token utility vocabulary (bg-tint2, bg-chip, border-border-soft, font-mono, …) is
  safelisted via `@source inline()` in build-css.mjs — Tailwind won't emit unused utilities,
  and the design agent needs the full palette. Keep the safelist in step with globals.css.
- Button/Input shadcn primitives are deliberately NOT exported (AGENTS.md: apps consume
  Zelvem* only) — don't add them to componentSrcMap.
- Known render warns: none.

## Re-sync risks

- `.ds-preview.css` is generated — if globals.css tokens change, `buildCmd` regenerates it,
  but a converter run WITHOUT the buildCmd first ships stale CSS. Always run buildCmd first
  (the driver does via cfg.buildCmd).
- The remote Google Fonts @import means previews need network at render-check time; offline
  runs fall back silently to system sans.
- tailwindcss/@tailwindcss/postcss versions live in `.ds-sync/package.json` (gitignored) —
  a fresh clone reinstalls latest; a Tailwind v5 breaking change would surface in buildCmd.
- Preview compositions mirror apps/web usage (login form, rail) — if ZelvemButton/Input APIs
  change, update `.design-sync/previews/*.tsx` accordingly (grades invalidate automatically).
