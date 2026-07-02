# Handoff: Zelvem Design System

## Overview

**Zelvem** is a Personal Control System: a unified client that reads, organizes, and acts on a person's email, calendar, and (in future modules) finances, tasks, blog, and social media. The product thesis: **Zelvem handles background work silently and only surfaces what requires your decision**. The tone is calm, minimal, focused.

This package documents 3 base modules **closed at high-fidelity design level** - **Home, Email, Calendar** - plus the **Account/Settings screen** and the **brand sheet (logo)**.

## About the Design Files

The `.dc.html` files in this bundle are **HTML-based design references** - prototypes showing visual and behavioral intent, **not code to copy directly into production**.

The task is to **recreate these designs in the target codebase environment** (React, Vue, SwiftUI, or whatever applies) using its established patterns and libraries.

> Technical note on the format: the files use a custom runtime ("Design Components", loaded from `support.js`) with template syntax `{{ }}`, `<sc-if>`, `<sc-for>`, and a `Component extends DCLogic` class. **Do not port that runtime.** Read the files as markup + inline styles + logic describing states and interactions, then reimplement using the chosen stack. To see them render, open each `.dc.html` in a browser (needs `support.js` alongside, already included).

## Fidelity

**High fidelity (hi-fi).** Colors, typography, spacing, and interactions are final. Recreate the UI pixel-perfect using the codebase's libraries and patterns. Exact tokens are below.

---

## Design Tokens

Two themes (light by default + dark). The theme is applied to `:root` as CSS variables and **persisted in `localStorage` under the key `zelvem-theme`** (`"light"` | `"dark"`). All screens share the same base set; Email and Calendar add a few module-specific tokens.

### Base - Light
```
--paper:        #F2F0E9   /* app background */
--surface:      #FBFAF6   /* cards, panels */
--border:       #DAD7CB
--border-soft:  #E4E1D6   /* internal dividers */
--ink:          #14171A   /* primary text */
--ink2:         #5C584E   /* secondary text */
--muted:        #8A8579   /* labels, metadata */
--moss:         #3F5D42   /* primary accent (brand) */
--moss-hover:   #344C37
--on-moss:      #F2F0E9   /* text on moss */
--chip:         #EFECE3
--dot:          #C9C5B7
--avatar:       #E7E3D7
--tint:         rgba(63,93,66,.12)   /* soft hover/active background */
--tint2:        rgba(63,93,66,.07)   /* insight block background */
--accent-border:        rgba(63,93,66,.25)   /* insight block border */
```

### Base - Dark
```
--paper:#141110  --surface:#1E1A15  --border:#37312A  --border-soft:#241F1A
--ink:#F2F0E9    --ink2:#ABA08E     --muted:#7C7567
--moss:#6E9A73   --moss-hover:#7EAA83  --on-moss:#11140E
--chip:#262019   --dot:#463F35      --avatar:#262019
--tint:rgba(110,154,115,.16)   --tint2:rgba(110,154,115,.10)   --accent-border:rgba(110,154,115,.32)
--row-hover:#221D17
```

### Extra Tokens - Email
Light: `--row-hover:#F1EEE6  --cluster-head:#F4F2EB  --filter-on:#EAE7DD`
Dark: `--row-hover:#221D17  --cluster-head:#1B1712  --filter-on:#2A241D`

### Extra Tokens - Calendar
Light: `--surf2:#EAE7DD  --grid:#E8E5DA  --faint:#A8A293  --event-work-border:#D7D3C7  --event-work-bg:#FBFAF6  --personal:#EEEBE2  --personal-border:#DCD8CC  --free-border:#BBB6A8  --cat-meet:#5C584E  --cat-personal:#C9C5B7`
Dark: `--surf2:#2A241D  --grid:#241F1A  --faint:#5F594C  --event-work-border:#3A342C  --event-work-bg:#25211B  --personal:#262019  --personal-border:#37312A  --free-border:#4A4438  --cat-meet:#8E897A  --cat-personal:#463F35`

### Typography
- **Geist** (UI / body text). Google Fonts, weights 300-700.
- **Geist Mono** (section labels in uppercase, times, amounts, metadata). Weights 400-600.
- Observed scale: screen title 26-34px / 600, letter-spacing -0.02 to -0.025em. Subtitles 15-17px. Body 13-14px. Metadata/labels 10-12px. Section labels: 10-11px Geist Mono, `text-transform:uppercase`, `letter-spacing:.12-.14em`, color `--muted`.

### Radii
Icon rail 10px - buttons/pills 8-9px - chips 7-8px - cards 11-14px - large cards / modals 16-18px - avatars 50%.

### Shadows
Very contained. Modals/overlays: `0 30px 80px -24px rgba(0,0,0,.5)`. Popovers: `0 16px 44px -14px rgba(0,0,0,.4)`. Cards: no shadow or `0 1px 2px rgba(0,0,0,.04)`.

### Spacing
Fixed left rail **66px**. Card padding 14-22px. Gaps from 3px (dense lists) to 20px (card grids). Home limits content to **740px centered** ("zen" screen); Email and Calendar are **full-width**.

---

## Brand / Logo - "The Frame"

Symbol: a **rounded square with a centered hollow (transparent) square inside** - like a frame. Concept: the hollow is the user/their attention; Zelvem is the structure around it. See `Zelvem Logo.dc.html` and `screenshots/06-logo.png`.

**Construction (SVG, viewBox `0 0 100 100`):** outer frame `rect 8,8 84x84 rx 20`; hollow `rect 35,35 30x30 rx 9`. The hollow is achieved with `<mask>` (not fill), so it is **transparent and adapts to any background**. Fill color = `--moss` (light) / `#6E9A73` (dark).

```html
<svg viewBox="0 0 100 100">
  <defs><mask id="z"><rect x="8" y="8" width="84" height="84" rx="20" fill="#fff"/><rect x="35" y="35" width="30" height="30" rx="9" fill="#000"/></mask></defs>
  <rect x="8" y="8" width="84" height="84" rx="20" fill="#3F5D42" mask="url(#z)"/>
</svg>
```

**Usage:** replaces any logo at the top of the rail (~30px). Also serves as the **"Zelvem insight" marker** (see Insight Pattern).

**"Thinking" animation (rotation):** the frame rotates in sharp 90-degree steps with a pause, **only while Zelvem is processing** (cmd+K parsing, dictation, sync). Once resolved, it returns to the static state. The static state never rotates.
```css
@keyframes zrotate{0%,16%{transform:rotate(0)}25%,41%{transform:rotate(90deg)}50%,66%{transform:rotate(180deg)}75%,91%{transform:rotate(270deg)}100%{transform:rotate(360deg)}}
/* animation: zrotate 5.6s cubic-bezier(.7,0,.2,1) infinite; */
```
Do: flat, no shadow, transparent hollow, respect proportions. Don't: fill the hollow, add shadow/gradient/3D, sharp corners, animate the static state.

---

## App Shell (shared across all modules)

Root layout `display:flex; min-height:100vh`.

**Left rail** - `width:66px`, `--surface`, right border, `position:sticky; top:0; height:100vh`, centered column.
- Top: the **frame logo** (~30px).
- Navigation icons (40x40, radius 10px, icon 19px with `stroke`): **Home, Email, Calendar** (active - navigate between modules), **Finance, Todos, Blog, Social** (placeholders, no destination yet - future modules). The current module icon gets `color:--ink` and `background:--tint`; the rest get `color:--muted` with hover `color:--ink2; background:--tint`.
- Bottom (with `margin-top:auto`): **theme** toggle (moon/sun icon based on state), and the **avatar** "TR" (34px circle, `--avatar`) that **navigates to the Account screen** (hover: `box-shadow:0 0 0 2px --moss`).

**Iconography:** linear SVGs, `stroke-width` 1.6-1.8, `stroke-linecap/linejoin:round`, `fill:none`. No specific icon library dependency; recreate with Lucide/Feather or equivalent, maintaining the thin weight.

---

## Zelvem Insight Pattern (cross-cutting - use in all modules)

Whenever Zelvem "speaks" (summarizes, suggests, interprets) **always use the same stamp**:
- Container: `background:--tint2; border:1px solid --accent-border; border-radius:11-12px; padding:13px 15px`.
- Leading icon: the **frame (logo)** in `--moss`, ~14-17px (rotating if "thinking", static once resolved).
- Message text + (optional) action chips: primary chip `background:--moss; color:--on-moss`, secondary chips `background:--surface; border:1px solid --border; color:--ink2`.

Appears in: "In the background" (Home), overload banner (Calendar), read assist and "Zelvem drafted/understood" (Email), suggested slots in New Event, and cmd+K results.

---

## cmd+K - Command / Capture (cross-cutting)

Central overlay invocable with **cmd+K / Ctrl+K** (toggle) and dismissible with **Esc** or backdrop click. Backdrop `rgba(20,17,16,.38)` with `backdrop-filter:blur(3px)`, `z-index:80`. Panel `position:fixed; left:50%; top:13vh; width:min(660px,calc(100%-40px)); z-index:81`, card `--surface`, radius 16px, modal shadow. Transition opacity + translateY(-8px to 0), .18s.

Structure: input row (frame icon left - `<input>` 17px - microphone button right) -> body (interpretation / results / suggestions) -> footer (`↵ ... · esc close`, Geist Mono 10.5px `--muted`).

Has **three scope variants** (same visual shell):

1. **Home - universal.** Accepts any text and Zelvem **routes** to the correct module. An intent parser (via keywords and date/time patterns) classifies in real time as you type: **event / task / email / note / navigation**. Shows a "Zelvem understood" card with icon by type, title, chips (e.g. event -> day - time - calendar), a destination line ("Scheduled in your calendar", etc.) and a primary action. Empty state: 4 clickable example suggestions (one per type). Placeholder (UI string, keep in Spanish): *"Tirá cualquier cosa: una idea, un evento, un mail, una tarea..."*
2. **Calendar - events only.** Always interprets as an event; extracts day, time, and calendar (Work/Personal based on words like gym/almuerzo/café -> Personal). "Ajustar" button opens the New Event form with text pre-filled. Placeholder (UI string, keep in Spanish): *"Escribí o dictá un evento..."*
3. **Email - search + compose.** If the text matches a compose pattern (`mail a X`, `responder a X`, `redact...`) shows a "New Draft" card (To: X) that opens compose; otherwise **searches live** through messages (filters by sender/subject/preview/account) and lists clickable results. Placeholder (UI string, keep in Spanish): *"Buscar mensajes o redactar..."*

**Voice dictation:** the microphone button enters "Listening..." state (animated 5-bar waveform + rotating frame) and after ~1.7s fills the input with a phrase (simulated in the prototype - replace with real STT). Bars: `@keyframes zbar{0%,100%{transform:scaleY(.5)}50%{transform:scaleY(1)}}` with staggered delays.

Intent parser rules (to reimplement Home classification - patterns are Spanish, intentional):
- **email**: `/mail|email|correo|escrib|respond|contest|redact/`
- **task**: `/record|tarea|pendiente|comprar|pagar|renov|llamar a|antes del/`
- **nav**: opening verb (`abrí|ir a|andá a|mostrá`) + module name
- **event**: `/reuni|evento|almuerzo|gym|café|cita|llamada|demo|1:1|standup|cena|junta|entrevista/` **or** (day + time detected)
- fallback: **note**
> Note on accents: JS `\b` does not treat `á` as a word boundary - use root matching (substring), not `\b...\b`.

---

## Screens / Views

### 1) Home - `Zelvem Home.dc.html` (screenshot `01-home.png`)
**Purpose:** daily "zen" panel. Content at 740px centered.
- **Header:** date (Geist Mono uppercase, `--muted`), greeting H1 34px/600, and a status line in Zelvem's voice ("There are **3 things** waiting for your decision. The rest is already sorted.").
- **Your focus today:** `--surface` card with 3 rows (divider `--border-soft`). Each row: status dot (moss = priority, `--dot` = normal), title + subtitle, and CTA on the right. Primary CTA ("Review digest") = moss button -> **navigates to Email**; "View" (1:1) -> **navigates to Calendar**; "Review" (blog) stays inert (future module).
- **Your day:** agenda list (time in Geist Mono + event + optional PERSONAL tag), rows with divider.
- **In the background:** label + **insight block** (frame + "While you were away, Zelvem sorted everything silently...") + 3 stat cards (large Geist Mono number + label).
- **Capture bar:** at the bottom, field with microphone icon + placeholder + `cmd+K` - **opens cmd+K** on click.

### 2) Email - `Zelvem Email.dc.html` (screenshots `02-email-digest.png`, `03-email-lectura.png`)
Two views switchable via a **segmented control** in the topbar (Digest / Inbox). The topbar is shared by both views and includes: the segmented control, "Updated 8 min ago" + Refresh button, "Search cmd+K" (opens cmd+K), and "Compose" (opens compose).

- **Digest** (`view:'digest'`, default): H1 "47 new, already sorted", account filter chips, section **"Needs your reply"** (4 rows with dot, account, sender, subject, summary, topic chip, and **"Reply to all 4" button** that opens the batch flow). Tapping a row opens that email in Inbox. Below, **"By topic"**: collapsible clusters (Pull requests, Recruiting, Invoices...) grouping non-urgent messages.
- **Inbox** (`view:'inbox'`): **3-column layout** - (a) sidebar with inboxes/accounts/tags, (b) message list (selection checkbox, sender, star, time, subject, preview, tag chip; selected row highlighted with moss inset bar `inset 3px 0 0`), (c) **reading panel**: subject H2, tag chip + sender + "See N from X", **Zelvem assist** (insight block: 1-line summary + contextual action chips per email), message thread (avatar, from, time, body), and reply bar at the bottom ("Reply to X..." + Reply button).
- **Batch reply (Reply to 4):** full-screen overlay, **sequential** flow (1 of 4): header with 4-segment progress bar + "Skip"; original email card (context); **draft that Zelvem already wrote** (editable); tone chips (Direct / Shorter / More formal / Decline) that regenerate the draft; footer "Skip" / "Send and next ->". Closing screen counting sent vs. skipped.
- **Compose:** right side panel (`width:min(560px,...)`, slides in from the right) with backdrop. New/reply mode.
- **Tag management:** centered overlay to create/edit tags (name + color palette) and adopt "suggested" ones.

### 3) Calendar - `Zelvem Calendar.dc.html` (screenshot `04-calendar-semana.png`)
- **Header:** date range (clickable -> opens mini-month popover), subtitle, and on the right: Today < > navigation, **3 days / Week / Month** segmented control, **New event** button.
- **"This week" bar:** time distribution in a segmented bar (Meetings / Protected Focus / Personal) with legend and hours.
- **Insight banner:** Zelvem stamp ("Thursday overloaded: 6 back-to-back meetings... suggests moving Vendor demo") with Move / Dismiss actions.
- **Time grid** (3 days or week): hour column (07-19) + day columns (today highlighted with `--tint2`); events positioned absolutely by time. Event types with their own style: **work** (`--event-work-bg`/`--event-work-border`), **personal** (`--personal`), **focus** (`--tint2` + left moss border + FOCUS label), **free/slot** (dashed border, "+ ...", SUGGESTED SLOT label). Moss "now" line on today's column.
- **Month view:** 7xN grid with event chips per day (max 3 + "+N more"), today highlighted.
- **Bottom:** natural language capture bar (opens cmd+K) + free slots card ("2 slots - Tue and Fri 4:30pm - Assign tasks").
- **New event (modal):** editable title; calendar selector (Work/Focus/Personal with color-dot); date + "All day" toggle (hides the time row); start/end time range; **insight block with suggested slots** (chips "Today 4:30pm" / "Tomorrow 9:00am" that fill date+time); location/link, guests, notes fields; footer Cancel / Create event. Opens from "New event" and from "Adjust" in cmd+K.

### 4) Account / Settings - `Zelvem Cuenta.dc.html` (screenshot `05-cuenta.png`)
Accessible from the rail avatar. Layout: section nav on the left (196px, sticky) + content (tabs per section, no scroll).
- **Account:** profile (avatar, name, email, "Zelvem Pro" badge, Change photo) + fields (editable name, email, timezone).
- **Connected accounts:** list of email + calendar accounts (color-dot, provider, sync status, Manage) + "Connect account". (Reinforces multi-account.)
- **Zelvem** (signature section - AI behavior): toggles + segments - Morning digest (toggle), Auto-sort level (Gentle/Balanced/Aggressive), Draft tone (Direct/Formal/Warm), Focus protection (toggle), Voice capture (toggle).
- **Billing:** current plan (Zelvem Pro, US$12/mo, renewal) in insight block, Change plan / Cancel, payment method (card), invoice history (date, status, amount, download).
- **Appearance:** Light/Dark theme (segmented, connected to the real toggle + persistence).
- **Notifications:** Decision-only / Daily summary / Night silence (toggles).
- Bottom: "Sign out".

**Reusable controls:**
- **Toggle:** track `40x23px`, radius 99px, `--moss` (on) / `--dot` (off); white knob `19px`, `translateX(17px)` on; transition .16s.
- **Segmented:** container with `--border` border radius 9px; items `padding 8px 15px`, active `background:--moss; color:--on-moss`, inactive `color:--ink2`, divider `border-left:1px solid --border`.

---

## Interactions and Behavior

- **Module navigation:** via the rail (links) and CTAs; the avatar goes to Account.
- **Theme:** toggle in the rail and in Account -> Appearance; applies CSS vars to `:root` + `data-theme`, persists in `localStorage['zelvem-theme']`, re-reads on mount.
- **cmd+K:** see dedicated section (shortcut, parser, dictation, 3 scopes).
- **Email selection:** click on inbox row -> loads its thread + assist in the reading panel; active row highlighted.
- **Batch reply:** sequential flow with progress, draft editing, tone chips that regenerate, closing screen.
- **New event:** modal with all-day toggle, calendar selector, suggested slots that fill date/time.
- **Transitions:** overlays/modals opacity + translateY .18s; toggles/segments .16s; logo rotation 5.6s `cubic-bezier(.7,0,.2,1)`.
- **Hover:** rows -> `--row-hover`/`--tint`; secondary buttons -> `--tint`; rail icons -> `--tint`.

## State Management (per screen, to reimplement)

- **Global/persistent:** `theme` (`'light'|'dark'`, in localStorage).
- **Home:** `cmdOpen`, `cmdText` (cmd+K input), `listening` (dictation). Derived: intent interpretation from `cmdText`.
- **Email:** `view` (`'digest'|'inbox'`), `selectedMsg` (open email id), `selected` (checkbox map), `composeOpen`/`composeMode`, `tagsOpen` (+ tag editing), `cmdOpen`/`cmdText`/`listening`, and batch: `batchOpen`, `bi` (index 0-3), `batchTone`/`batchText`/`batchStatus` (per email).
- **Calendar:** `view` (`'3d'|'week'|'month'`), `monthOpen` (popover), `cmdOpen`/`cmdText`/`listening`, and New event: `newOpen`, `evTitle`, `evCal` (`'work'|'focus'|'personal'`), `evAllDay`, `evDate`/`evStart`/`evEnd`.
- **Account:** `sec` (active section), `digestOn`, `orderLvl`, `tone`, `focusOn`, `voiceOn`, `nDec`/`nDaily`/`nNight`.
- **Data:** all sample data is hardcoded in each file's logic (arrays of messages, events, accounts, invoices). Replace with real fetching. "Send", "create event", "update", etc. flows are no-ops in the prototype.

## Assets

- **Fonts:** Geist + Geist Mono (Google Fonts).
- **Icons:** hand-drawn inline SVGs (thin linear style). No library dependency; recreate with Lucide/Feather or equivalent.
- **Logo:** SVG generated with `<mask>` (see Brand section). No image file - pure vector.
- **Images:** none (no photos or illustrations used).

## Files

- `Zelvem Home.dc.html` - Home module.
- `Zelvem Email.dc.html` - Email module (digest, inbox/reading, compose, tags, batch).
- `Zelvem Calendar.dc.html` - Calendar module (3 views, insight, new event).
- `Zelvem Cuenta.dc.html` - Account/Settings (6 sections).
- `Zelvem Logo.dc.html` - Brand sheet (construction, color, scale, animation, do/don'ts).
- `support.js` - prototype runtime (needed only to open them in the browser; **do not port**).
- `screenshots/` - reference screenshots of each screen.
