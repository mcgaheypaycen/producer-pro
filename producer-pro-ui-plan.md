# Producer Pro — UI Plan & Style Guide

**Concept: "Footlights" · v1**

A backstage workspace for cabaret producers. The shell is the dark of the house; the work happens on the warm paper of the program book. Drama on the chrome, legibility on the page.

| | |
|---|---|
| **Dominant** | Oxblood Wine |
| **Accent** | Antique Brass |
| **Display type** | Fraunces |
| **UI type** | Hanken Grotesk |
| **Numerals / data** | Space Mono |

---

## 01 · The idea — theater on the outside, program book on the inside

Producer Pro lives entirely on one producer's machine and runs the whole arc of a show: roster, library, lineup, package, settlement. The interface should feel like the craft it serves — a little theatrical, deeply organized, and quiet where the real work gets done.

**Three principles**

1. **Dark house, lit stage.** Navigation and chrome sit in deep velvet ink. The content surface — where you build lineups and settle books — is warm parchment. The eye always knows where the work is.
2. **The lineup is the hero.** Everything orbits the running order. Acts read as velvet program cards with a brass marquee numeral; segments read as lighter paper inserts. A glance tells the whole show.
3. **Money is a ledger, not an alarm.** Revenue, expenses, and payouts use restrained ledger green and brick, never a panic red. A closeout should feel like balancing books, not defusing a bomb.

**What the interface should say.** Names come from the producer's world, not the database's. People manage a *roster*, build a *running order*, generate a *show package*, and *close out* the night. Buttons say exactly what they do and keep that name through the whole flow — `Generate package` produces a "Package ready" toast, never a generic "Success." The aesthetic is vintage variety show, executed with modern restraint. Glamour lives in the type and one brass flourish; everything else stays calm and usable for long planning sessions.

---

## 02 · Color system — one velvet curtain, one brass marquee

A dominant oxblood wine carries the brand and every primary action. Antique brass is the single contrasting accent — the marquee glow, active states, premium dividers. Everything else is structural ink, parchment, and a tightly scoped set of semantic tones.

### Dominant — Oxblood Wine

| Token | Hex | Usage |
|---|---|---|
| Wine 700 | `#5E1622` | Pressed buttons, deep accents |
| **Wine 600 · Primary** | `#7B1E2B` | Primary buttons, brand, active nav, card spine |
| Wine 500 | `#94283A` | Hover state for primary |
| Wine Tint | `#F3E3E5` | Focus ring fill, selected rows on paper |

### Accent — Antique Brass

| Token | Hex | Usage |
|---|---|---|
| Brass 700 | `#8A6A37` | Outlines, secondary button border |
| Brass 500 | `#BD9550` | Dividers, eyebrows, marquee frame |
| **Brass 400 · Glow** | `#D9B879` | Footlight glow, focus on dark, numerals, accents |
| Brass Tint | `#F1E7D2` | Soft highlight blocks on paper |

### Foundation — Ink & Parchment

| Token | Hex | Usage |
|---|---|---|
| Ink 900 | `#150F13` | Deepest backdrop, marquee numerals |
| Ink 800 | `#1C151A` | App background |
| Ink 700 | `#241B21` | Sidebar, raised dark surfaces |
| Ink 600 | `#2E2229` | Cards on dark |
| Ink line | `#3C2E36` | Hairlines on dark |
| **Paper 100** | `#F6F1E8` | The workspace — primary work surface |
| Paper 50 | `#FCFAF4` | Elevated cards, inputs, tables |
| Paper 200 | `#EFE7D8` | Segment hatch, table headers |
| Paper line | `#E3D9C7` | Hairlines on paper |

### Text

| Token | Hex | Usage |
|---|---|---|
| On dark | `#F1E8DC` | Parchment text on ink |
| On dark muted | `#B6A493` | Secondary text on ink |
| On paper | `#2A2025` | Ink text on parchment |
| On paper muted | `#6B5D62` | Secondary text on parchment |

### Semantic — Status & Ledger (use sparingly)

| Token | Hex | Usage |
|---|---|---|
| Draft · Graphite | `#7E8A93` | Show being planned — pencil grey |
| Packaged · Amber | `#B0823A` | Package generated, not yet closed |
| Closed / Revenue · Green | `#2F6F4F` | Settled & archived; positive money |
| Expense / Danger · Brick | `#9E3B2E` | Expenses, payouts, destructive actions |
| Peacock Teal *(tertiary)* | `#2C6E73` | Links & info only — never primary |

**Contrast.** Parchment text `#2A2025` on `#F6F1E8` and `#F1E8DC` on ink `#1C151A` both clear WCAG AA for body. Wine on white and brass-400 on ink both pass for large text and UI elements.

---

## 03 · Typography — a characterful serif, a clean voice, marquee numerals

No defaults. **Fraunces** brings old-show-business personality to anything titled. **Hanken Grotesk** keeps forms and data calm and readable. **Space Mono** turns positions, prices, and run times into little playbill numerals — the typographic signature.

- **Display — Fraunces** (9–144 optical sizing). Weights 300/400/500/600/700, italic for venues & taglines. Used only at title sizes — never body.
- **UI & Body — Hanken Grotesk.** Weights 300–800. Sentence case everywhere. Carries forms, tables, labels, helper text.
- **Numerals & Data — Space Mono.** Lineup positions, money, run times, file counts, timestamps. Tabular by nature, so columns align.

### Type scale

| Token | Face / Weight | Size / Line | Where |
|---|---|---|---|
| `display` | Fraunces 600 | 48–104 / .92 | App wordmark, marquee |
| `h1` | Fraunces 500 | 30–46 / 1.05 | Screen titles, show name |
| `h2 / card` | Fraunces 600 | 19–24 / 1.1 | Act & show card titles |
| `body` | Hanken 400 | 15 / 1.6 | Paragraphs, descriptions |
| `label` | Hanken 700 | 12 / .08em caps | Form labels, eyebrows |
| `data` | Space Mono 700 | 12–20 | Positions, money, times |

**Pairing rule.** A screen has exactly one Fraunces moment per zone (the title or the card name) and lets Hanken carry the rest. Mono appears only for things that are literally numbers or fixed-width data. Mixing all three in one line is reserved for the lineup row, on purpose.

---

## 04 · Layout & structure — a fixed backstage rail, a contextual top, a paper stage

One persistent shell across the whole app: a dark left rail for navigation, a slim contextual top bar for breadcrumb and the one primary action, and the parchment workspace where every screen renders.

```
┌──────────┬───────────────────────────────────────────────┐
│ Producer │  Shows / Vintage Variety Hour   [Generate pkg] │  ← top bar (ink)
│   Pro    ├───────────────────────────────────────────────┤
│          │  ╭───────────────────────────────────────────╮ │
│ ▸ Shows  │  │  Running order                            │ │
│   Perf.  │  │  9 entries · est. 1:42 · 6/7 have media    │ │  ← workspace
│   Venues │  │  ───────────────────────────────────────  │ │    (parchment,
│   Acts   │  │  [lineup rows…]                           │ │     lifted off
│          │  ╰───────────────────────────────────────────╯ │     the dark desk)
│ store.json│                                               │
└──────────┴───────────────────────────────────────────────┘
   ↑ rail (ink, 188px, fixed) — shows data path + last-saved time
```

**The shell**

- **Left rail (188px, fixed, ink).** Wordmark up top, four destinations — Shows, Performers, Venues, Acts — and a persistent footer showing the data file location and last-saved time, because this is a local-first tool and people should trust where their data lives. Active item fills with wine and lights its dot in brass.
- **Top bar (contextual).** Breadcrumb on the left (the Fraunces show title earns its place here), the single most important action on the right. One primary action per screen, never a row of competing buttons.
- **Workspace (parchment).** Inset with a soft radius and shadow so it reads as a page lifted off the dark desk. All list and detail content renders here.

**Spacing & grid.** An 8px base scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 72`. Section padding 72, card padding 18–30, control padding 11–13. Workspace content caps around 1080px and is left-aligned, not centered, so dense roster tables and the lineup builder get room.

**Radius & elevation.** Two radii: `10px` for controls and cards, `16px` for panels and the workspace. Elevation is expressed with warm, low shadows on paper and brass hairlines on dark — never hard drop shadows. Depth is light, not heavy.

**Responsive.** Desktop-first (this is a producer's workstation app). Below ~860px the rail collapses to an icon strip and the workspace goes full-bleed; the lineup row stacks its meta beneath the body.

---

## 05 · Core components — the working parts

A small, disciplined kit. Each piece does one job, keeps its name through the flow, and inherits the palette without inventing new colors.

**Buttons.** One **primary** (wine fill) per screen — the main verb. **Secondary** (brass outline) for supporting actions. **Ghost** (faint outline) for dismissals. **Danger** (brick outline, fills brick on hover) only for destructive, irreversible acts, and always behind a confirmation.

**Form fields.** Labels in caps Hanken 700. Inputs on Paper 50 with a paper-line border; focus shifts the border to wine with a wine-tint ring. Helper text in paper-muted (e.g. length is free text — "4:30" or "5 min" both work).

**Status badges.** A show's state, stamped like a ticket, mapping straight to the workflow: `Draft · lineup editable` (graphite), `Packaged · folder on disk` (amber), `Closed · settled & read-only` (green). Each pairs a tinted dot with a word — never color alone.

**Payment chips.** Pill chips with a small brand glyph for Venmo, CashApp, PayPal, Zelle, Cash, Check, Other. Used in performer rows and pre-filled payout rows.

**Cards.** Act and show cards carry a wine left-spine by default; show cards in a "packaged" state shift their spine to brass so the board reads at a glance. The card title is the screen's one Fraunces moment. Acts show performer (wine), tagline (italic), run time and a media indicator. Show cards show date/venue, ticket price, lineup count, runtime, and a status stamp.

**Tables.** Paper-50 surface, Paper-200 header in caps, paper-line dividers, hover lifts the row to Paper-100. Stage names render in Fraunces; handles and data in mono. Row-level actions sit in a trailing ghost button.

**Empty states.** Direction, not mood — a brass ring icon, a Fraunces line naming what the thing *is*, one sentence of plain explanation, and the single primary action that fills it (e.g. "No acts in the library yet → Add act").

---

## 06 · Signature element — the running order, read like a playbill

This is the heart of the app and the one place all three typefaces meet on purpose. Acts are velvet program cards with a brass marquee numeral and a media indicator; segments are lighter, dashed paper inserts. Position numbers count the full running order — segments included — exactly as the show package will name the files.

```
┌────┬──────────────────────────────────────────────┬──────────┐
│ ▓1 │ Host welcome · segment                       │   3:00   │  seg (dashed,
│    │ Big Gay Paycen — opening remarks & sponsors  │          │   hatched)
├────┼──────────────────────────────────────────────┼──────────┤
│ ▓3 │ Feathers & Fire                              │  4:30    │  act (wine
│    │ Velvet Thunder — "a slow burn…" red-wash     │ media ✓  │   border,
├────┼──────────────────────────────────────────────┼──────────┤  brass numeral)
│ ▓4 │ Neon Lullaby                                 │  3:45    │
│    │ Lady Lumen — "soft, glowing, slow." blue gels│ no media │
└────┴──────────────────────────────────────────────┴──────────┘
   ↑ marquee numeral = position in full order = media-file prefix
```

**How a row reads.** The **marquee numeral** (Space Mono, brass on ink) is the position in the full order — the same number that prefixes the media file. The **name** is Fraunces, the **performer** is wine, and the **aesthetic / notes** sit in italic paper-muted text. On the right, run time in mono and a media badge that's green when attached, brick when missing.

**Act vs segment, at a glance.** Acts get the wine left-border and solid paper; segments get a dashed border and a subtle diagonal hatch, like a handwritten insert in a printed program. You never have to read the label to know which is which — the texture already told you. Drag handles let the producer reorder freely until the show is closed.

**Live-data rule.** Act rows always resolve against the act library, so editing an act's lighting note or swapping its track updates everywhere it appears. Segments are embedded in the show alone.

---

## 07 · Closeout — the ledger

Settling the night should feel like balancing books. Three stacked groups — revenue, expenses, payouts — each a list of rows you can add to, with a running total. Net profit lands on an ink bar at the bottom in brass, the one number the whole night comes down to. Positive money is ledger green, money out is brick. No alarm reds.

```
Revenue · 137 tickets sold
  Door cash                                   +$1,420.00
  Venmo                                         +$885.00
  Eventbrite                                  +$1,120.00
  ─────────────────────────────────────────────────────
  Total revenue                               +$3,425.00

Expenses
  Venue rental                                  −$600.00
  DJ fee                                        −$250.00
  ─────────────────────────────────────────────────────
  Total expenses                                −$850.00

Performer payouts · pre-filled from lineup
  Velvet Thunder  [Venmo]                       −$150.00
  Lady Lumen      [CashApp]                      −$150.00
  ─────────────────────────────────────────────────────
  Total payouts                                 −$300.00

╔═════════════════════════════════════════════════════╗
║  NET PROFIT                              +$2,275.00  ║   ← ink bar, brass figure
╚═════════════════════════════════════════════════════╝
```

**What the screen does.** Closeout pre-populates a payout row for every unique performer in the lineup, using their saved payment method — the producer just fills in amounts. Totals recompute live as rows change. A closeout can be saved as a draft and returned to.

**Finalizing.** When the producer commits, the show moves to **Closed**, a timestamp is written, and everything goes read-only. Closed shows export to CSV — show metadata, every revenue and expense and payout row, and the summary — through a single `Export settlement` action. Read-only is shown, not hidden: closed screens dim their controls and replace the primary action with "Export settlement," so the state is always legible.

---

## 08 · Screen blueprints — where everything lands

Four destinations in the rail, one deep workspace for shows. Each screen has a single primary action and a consistent shape.

- **Shows (home).** A board of show cards, filterable by status (Draft / Packaged / Closed) and searchable by title, venue, or date. Primary action: **New show**. Each card shows date, venue, ticket price, lineup count, runtime estimate, and a status stamp.
- **Show workspace.** The deep screen. A header with title / date / venue / ticket price and status, then three zones: **Running order** (the lineup builder), **Package**, and **Closeout**. Primary action shifts with state — `Generate package` → `Close out` → `Export settlement`.
- **Performers & Venues.** Roster tables with search. Add / edit opens a side drawer on the parchment, not a hard modal, so the list stays in view. Performer rows surface payment chips; venue rows surface capacity and contact. Deleting is safe — it never cascades into historical shows.
- **Acts library.** A grid of act cards, searchable by act name, performer, aesthetic, or tagline. Each opens to its full record — aesthetic, length, tagline, lighting & stage notes, media attachment. New acts can also be created inline while planning a show.

**Package generation flow.** A focused dialog, not a page change. It states what will be produced before it touches the disk: pick a destination folder, "6 media files will be copied & renamed," "1 act has no media — will be skipped," "1 run sheet (RTF)." Missing-media files are reported, never fatal. On success: a "Package ready" toast with a `Reveal in folder` action, and the show moves to **Packaged**.

---

## 09 · The quiet rules — iconography, motion, accessibility

**Iconography.** Thin line icons, 1.5px stroke, rounded joins — drawn to sit beside Hanken without shouting. Icons support labels, they don't replace them in the rail or on primary actions. Status is carried by the badge system, not by icon color alone.

**Motion.** One orchestrated moment, the rest restrained. The footlight glow on app load. Lineup reorder animates with a 160ms ease. Drawers slide from the right at 200ms. Toasts rise and fade. Everything respects `prefers-reduced-motion` — under it, transitions become instant.

**Accessibility floor.** Body text meets WCAG AA on both ink and parchment. Every interactive element has a visible focus ring — brass on dark, wine-tint on paper. Targets are at least 40px. Color is never the only signal: status pairs a tinted dot with a word, money pairs sign with color, media pairs a checkmark with a label.

**Local-first honesty.** The rail always shows the data file path and last-saved time. Saves are atomic; if the store is ever unreadable, the app says so plainly and keeps the backup — the UI never pretends data loss didn't happen.

### Do & don't

| Do | Don't |
|---|---|
| Keep one wine primary action per screen, named for its verb | Stack competing primary buttons or invent new accent colors |
| Let Fraunces appear once per zone — the title or the card name | Set body copy or form fields in Fraunces |
| Use Space Mono for anything that is literally a number | Use alarm red for ordinary expenses or payouts |
| Render the workspace as lifted parchment over the dark desk | Float content directly on the dark with no paper surface |
| Pair every color signal with a word or shape | Hide the closed / read-only state — dim and relabel instead |
| Speak the producer's language: roster, running order, closeout | Let brass spread past accents into large fills |

---

*Footlights design system · oxblood & brass on ink & parchment · Fraunces / Hanken Grotesk / Space Mono. Drama on the chrome, legibility on the page.*
