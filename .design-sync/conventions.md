# Zelvem UI — build conventions

Zelvem is a Personal Control System: calm, minimal, focused. Tone: Linear/Stripe/Notion —
**never** generic tech blues, AI gradients, or wellness aesthetics. Primary UI language is
Spanish (rioplatense voice: "Entrá", "Ver agenda").

## Setup

No provider needed — components work standalone. Theming: light is the default; dark applies
by setting `data-theme="dark"` on the document root (`:root`). All tokens flip automatically.

## Styling idiom: Tailwind utilities mapped to Zelvem tokens

Style layout glue with Tailwind classes using the Zelvem color names (defined in `styles.css`):

| Family | Classes |
|---|---|
| Backgrounds | `bg-paper` (app bg), `bg-surface` (cards/panels), `bg-moss` (brand accent), `bg-tint` (soft hover/active), `bg-tint2` (insight blocks), `bg-chip`, `bg-avatar` |
| Text | `text-ink` (primary), `text-ink2` (secondary), `text-muted` (labels/meta), `text-on-moss` (on moss) |
| Borders | `border-border`, `border-border-soft` (internal dividers), `border-accent-border` (insight blocks) |
| Fonts | `font-sans` (Geist — UI/body), `font-mono` (Geist Mono — uppercase section labels, times, amounts) |

Radii scale (arbitrary values): buttons/pills `rounded-[9px]`, icon cells `rounded-[10px]`,
cards `rounded-[11px]`–`rounded-[14px]`, modals `rounded-2xl`, avatars `rounded-full`.
Section labels: `font-mono text-[10px] uppercase tracking-[0.13em] text-muted`.
Shadows: nearly none — cards flat or `shadow-[0_1px_2px_rgba(0,0,0,.04)]`.

## Components

`ZelvemButton` — props: `variant` (`default` moss | `outline` | `ghost`), `size` (`default` | `sm` | `icon`), standard button props.
`ZelvemInput` — standard input props, pre-styled (surface bg, border, muted placeholder). Never use a bare `<input>`.
`ZelvemLogo` — the brand frame mark; props: `size` (px, ~30 in rails), `thinking` (rotates ONLY while processing — never animate at rest).

## Where the truth lives

Read `styles.css` (tokens for both themes + compiled utilities) before inventing a class —
if a color isn't a token there, it isn't Zelvem. Per-component API: each `<Name>.d.ts`.

## Idiomatic example

```tsx
<div className="min-h-screen bg-paper p-8 font-sans text-ink">
  <div className="flex w-[360px] flex-col gap-4 rounded-2xl border border-border bg-surface p-8">
    <ZelvemLogo size={34} />
    <h1 className="text-[26px] font-semibold tracking-[-0.02em]">Volvé a tu centro de control</h1>
    <ZelvemInput type="email" placeholder="Email" />
    <ZelvemButton>Entrar</ZelvemButton>
  </div>
</div>
```
