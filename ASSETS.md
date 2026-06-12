# Producer Pro — Asset Specification Brief

Design asset requirements for polishing Producer Pro to an Adobe-grade desktop product. Specifications align with the current **Footlights** UI system (oxblood & brass on ink & parchment).

**LLM-ready copy-paste prompts (one asset per prompt, 97 total):** [ASSET_PROMPTS.md](./ASSET_PROMPTS.md)

---

## Design system reference

Give these values to any designer before work begins.

| Token | Value | Use |
|-------|-------|-----|
| Ink (deepest) | `#150F13` | Deepest backgrounds |
| Ink (rail) | `#1C151A` | Sidebar rail |
| Ink (elevated) | `#241B21` | Elevated dark panels |
| Wine primary | `#7B1E2B` | Primary accent, act borders |
| Wine deep | `#5E1622` | Hover / pressed accent |
| Brass primary | `#BD9550` | Secondary accent, active nav |
| Brass highlight | `#D9B879` | Active icons, badges |
| Paper (workspace) | `#FCFAF4` | Main workspace background |
| Paper (muted) | `#F6F1E8` | Cards, panels |
| Paper line | `#E3D9C7` | Borders |
| Text on dark | `#F1E8DC` | Rail labels, top bar |
| Text on dark muted | `#B6A493` | Secondary on dark |
| Text on paper | `#2A2025` | Body on workspace |
| Text on paper muted | `#6B5D62` | Labels, helper text |
| Status draft | `#7E8A93` | Draft badge |
| Status packaged | `#B0823A` | Packaged badge |
| Status closed | `#2F6F4F` | Closed / success |
| Ledger green | `#2F6F4F` | Positive ledger values |
| Ledger brick | `#9E3B2E` | Errors, danger |
| Control radius | `10px` | Buttons, inputs |
| Panel radius | `16px` | Cards, modals, workspace |
| Rail width | `188px` | Left navigation |
| UI font | Hanken Grotesk | Body, controls |
| Display font | Fraunces | Headlines, titles |
| Mono font | Space Mono | Stats, runtime, ledger |

**Icon grid standard:** 24 × 24 px artboard, 20 px optical size in UI, 1.75–2 px stroke, rounded caps.

---

## Priority overview

| Priority | Category | Asset count |
|----------|----------|-------------|
| **High** | App icon + ICO | 1 set |
| **High** | Logo + wordmark | 2 |
| **High** | UI icon set | ~25 icons |
| **High** | Empty state illustrations | 5 |
| **Medium** | Rail + paper textures | 2 |
| **Medium** | Font files (bundled) | 3 families |
| **Medium** | Splash + installer art | 3 |
| **Low** | Motion / loading | 2–3 |
| **Low** | Marketing / store | 4+ |

---

## 1. App logo (master mark)

| Spec | Value |
|------|--------|
| **ID** | `brand-logo-master` |
| **Purpose** | Primary brand mark; source for all icon sizes |
| **Format** | SVG (master) + PNG exports |
| **Artboard** | 1024 × 1024 px |
| **Safe zone** | 15% inset on all sides |
| **Style** | Simple mark readable at 16 px; works on dark (`#1C151A`) and light (`#FCFAF4`) |
| **Color** | Wine `#7B1E2B` + brass `#BD9550` on ink; include single-color white and black variants |
| **Variants** | Full lockup, icon-only, monochrome white, monochrome black |
| **Export PNG** | 1024, 512, 256, 128, 64, 32, 16 px |

---

## 2. Wordmark / logotype

| Spec | Value |
|------|--------|
| **ID** | `brand-wordmark` |
| **Purpose** | Rail header (replaces text “Producer Pro”) |
| **Format** | SVG |
| **Rendered width** | 140–160 px (rail is 188 px wide) |
| **Rendered height** | 28–32 px |
| **Variants** | Stacked (icon + “Producer Pro”), horizontal, tagline version (“Cabaret show manager”) |
| **Color** | `#F1E8DC` on dark rail; optional brass `#D9B879` accent on “Pro” |
| **Clear space** | 8 px minimum around mark |

---

## 3. App icon set (Electron / Windows)

| Spec | Value |
|------|--------|
| **ID** | `app-icon-set` |
| **Purpose** | Taskbar, title bar, `.exe`, installer, shortcuts |
| **Formats** | `.ico` (Windows), `.png` set; optional `.icns` (macOS) |
| **PNG sizes** | 16, 24, 32, 48, 64, 128, 256, 512, 1024 px |
| **ICO** | Multi-resolution embedded: 16, 32, 48, 64, 128, 256 |
| **Style** | Flat with subtle depth; no fine detail below 32 px |
| **Background** | Rounded square (Windows 11 style ~12% corner radius at 256 px) or transparent with 10% padding |
| **electron-builder path** | `build/icon.ico` (configure in `package.json` when added) |

---

## 4. Splash / launch screen (optional)

| Spec | Value |
|------|--------|
| **ID** | `splash-screen` |
| **Purpose** | Shown while Electron loads on cold start |
| **Size @1x** | 800 × 500 px |
| **Size @2x** | 1600 × 1000 px |
| **Format** | PNG |
| **Content** | Logo centered, subtle brass footlight glow, reserved area for version number (bottom-right, 80 × 24 px) |
| **Background** | `#150F13` or gradient ink `#150F13` → wine `#5E1622` at 15% opacity |

---

## 5. Navigation icons (rail)

One SVG per item; 24 × 24 px artboard; 20 × 20 px optical size in rail.

| ID | Label | States |
|----|-------|--------|
| `nav-shows` | Shows | default, active |
| `nav-performers` | Performers | default, active |
| `nav-venues` | Venues | default, active |
| `nav-acts` | Acts | default, active |

| Spec | Value |
|------|--------|
| **Format** | SVG (individual files or sprite sheet) |
| **Stroke** | 1.75–2 px |
| **Default color** | `#B6A493` |
| **Active color** | `#D9B879` |
| **Hover color** | `#F1E8DC` |
| **Delivery** | SVG + PNG @1x/@2x for each state |

---

## 6. Toolbar & action icons

24 × 24 px artboard; export at 16 px (small) and 20 px (default) where noted.

| ID | Purpose | Context | Size |
|----|---------|---------|------|
| `icon-add` | Add / plus | Top bar, forms, performer + button | 16 px, 20 px |
| `icon-delete` | Delete / trash | Cards, lineup | 16 px |
| `icon-edit` | Edit / pencil | Lineup, cards | 16 px |
| `icon-media` | Attach media / music | Acts, segments | 16 px |
| `icon-drag` | Drag handle / grip | Lineup reorder (replaces ⠿) | 12 × 16 px |
| `icon-search` | Search | Search fields | 16 px |
| `icon-chevron-up` | Move field up | Run sheet field order | 12 px |
| `icon-chevron-down` | Move field down | Run sheet field order | 12 px |
| `icon-folder-open` | Reveal in folder | Package, show folder | 16 px |
| `icon-export` | Generate / export | Package, CSV export | 20 px |
| `icon-close` | Close | Modals, drawers | 16 px |
| `icon-check` | Confirm / success | Toasts, dialogs | 16 px |
| `icon-warning` | Warning | Package missing files | 20 px |
| `icon-calendar` | Date | Show meta (optional) | 16 px |
| `icon-ticket` | Ticket price (optional) | Show meta | 16 px |

| Spec | Value |
|------|--------|
| **Format** | SVG |
| **Default (on paper)** | `#6B5D62` |
| **Hover (on paper)** | `#2A2025` |
| **On dark** | `#B6A493` |
| **Active / accent** | `#BD9550` |
| **Danger** | `#9E3B2E` |

---

## 7. Status & badge icons

| ID | Purpose | Size |
|----|---------|------|
| `status-draft` | Draft show | 8 px dot + optional 16 px icon |
| `status-packaged` | Packaged show | 16 px |
| `status-closed` | Closed / settled | 16 px |
| `badge-media-ok` | Media attached | 14 px |
| `badge-media-missing` | No media | 14 px |
| `badge-segment` | Segment type indicator (optional) | 14 px |

| Spec | Value |
|------|--------|
| **Format** | SVG |
| **Draft color** | `#7E8A93` |
| **Packaged color** | `#B0823A` |
| **Closed color** | `#2F6F4F` |
| **Warning color** | `#9E3B2E` |

---

## 8. Rail background texture

| Spec | Value |
|------|--------|
| **ID** | `texture-rail` |
| **Purpose** | Subtle depth on 188 px sidebar |
| **Size** | 188 × 900 px vertical tile (seamless) or 512 × 512 px seamless |
| **Format** | PNG @2x or SVG pattern |
| **Base color** | `#1C151A` |
| **Opacity** | 3–8% noise or velvet grain overlay |
| **Constraint** | Must not reduce contrast below WCAG AA for `#F1E8DC` text |

---

## 9. Workspace parchment texture

| Spec | Value |
|------|--------|
| **ID** | `texture-paper` |
| **Purpose** | Main workspace panel background |
| **Size** | 512 × 512 px seamless tile @2x |
| **Format** | PNG or WebP |
| **Base tone** | Warm, matching `#F6F1E8` |
| **Opacity** | 4–12% multiply overlay on `#FCFAF4` |
| **Style** | Very light paper fiber; no visible repeat at 1400 px width |

---

## 10. Elevation / shadow tokens

Reference specs for dev handoff (CSS tokens, not bitmaps).

| Level | Use | Shadow |
|-------|-----|--------|
| Elevation 1 | Cards, list rows | `0 1px 3px rgba(21, 15, 19, 0.06)` |
| Elevation 2 | Workspace, modals | `0 4px 24px rgba(21, 15, 19, 0.12), 0 1px 3px rgba(21, 15, 19, 0.06)` |
| Elevation 3 | Run sheet page preview | `0 1px 4px rgba(0, 0, 0, 0.2), 0 8px 28px rgba(0, 0, 0, 0.22)` |
| Footlight glow | Brand moments (optional) | `0 0 40px rgba(217, 184, 121, 0.15)` |

---

## 11. Focus ring (optional SVG reference)

| Spec | Value |
|------|--------|
| **ID** | `focus-ring` |
| **Purpose** | Keyboard focus indicator |
| **Corner radius** | 9–10 px (matches `--radius-ctrl`) |
| **Stroke** | 2 px `#BD9550` outside element border |
| **Offset** | 2 px from control edge |
| **Format** | SVG or CSS spec sheet |

---

## 12. Empty state illustrations

| ID | Screen | Subject |
|----|--------|---------|
| `empty-shows` | No shows | Empty stage / curtain |
| `empty-performers` | No performers | Spotlight, microphone |
| `empty-venues` | No venues | Marquee / venue facade |
| `empty-acts` | No acts | Feather, sequins, music motif |
| `empty-lineup` | Empty running order | Clipboard + running order list |

| Spec | Value |
|------|--------|
| **Format** | SVG (preferred) + PNG |
| **PNG @1x** | 320 × 240 px |
| **PNG @2x** | 640 × 480 px |
| **Palette** | Wine, brass, ink, parchment only (max 4 colors + neutrals) |
| **Style** | Adobe Illustrator–style line + flat fill; not cartoonish |
| **Background** | Transparent |
| **Max file size** | SVG < 50 KB each |

---

## 13. Onboarding / first-run hero (optional)

| Spec | Value |
|------|--------|
| **ID** | `onboarding-hero` |
| **Purpose** | First-run welcome or help panel |
| **Size @1x** | 600 × 400 px |
| **Size @2x** | 1200 × 800 px |
| **Format** | PNG or SVG |
| **Content** | Three-step flow: Build → Package → Close out |
| **Text** | None baked in (localization-friendly) |

---

## 14. UI font — Hanken Grotesk

| Spec | Value |
|------|--------|
| **ID** | `font-hanken-grotesk` |
| **Purpose** | Body, buttons, labels, tables, forms |
| **Weights** | 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold) |
| **Formats** | `.woff2` (primary), `.woff` (fallback) |
| **Install path** | `assets/fonts/hanken-grotesk/` |
| **License** | SIL Open Font License — confirm redistribution in desktop app |
| **Subset** | Latin extended |

---

## 15. Display font — Fraunces

| Spec | Value |
|------|--------|
| **ID** | `font-fraunces` |
| **Purpose** | Headlines, show titles, card titles, rail wordmark fallback |
| **Weights** | 600 (SemiBold), 700 (Bold) |
| **Formats** | `.woff2` |
| **Install path** | `assets/fonts/fraunces/` |
| **License** | SIL Open Font License |
| **Variant** | Use soft or default optical size per designer review |

---

## 16. Monospace font — Space Mono

| Spec | Value |
|------|--------|
| **ID** | `font-space-mono` |
| **Purpose** | Runtime, stats, ledger numbers, position badges, data table mono cells |
| **Weights** | 400 (Regular), 700 (Bold) |
| **Formats** | `.woff2` |
| **Install path** | `assets/fonts/space-mono/` |
| **License** | SIL Open Font License |

---

## 17. Run sheet page chrome

| Spec | Value |
|------|--------|
| **ID** | `runsheet-page-chrome` |
| **Purpose** | Document preview “desk” and page edge in Running order |
| **Page aspect ratio** | 8.5 × 11 in (US Letter) |
| **Desk gradient** | `#6e6e6e` → `#5a5a5a` (vertical or radial) |
| **Desk texture (optional)** | 400 × 300 px PNG, 10% opacity overlay |
| **Page shadow PNG** | 8 px blur, 15% black, Y offset 4 px |
| **Paper texture tile** | Seamless; proportional to letter page; 2% off-white grain |
| **Page border** | 1 px `#555555` |

---

## 18. Run sheet “Sample” watermark (optional)

| Spec | Value |
|------|--------|
| **ID** | `runsheet-sample-watermark` |
| **Text** | `SAMPLE` |
| **Width** | ~120 px rendered |
| **Opacity** | 40% |
| **Color** | `#BD9550` |
| **Format** | SVG |
| **Font** | Space Mono 700 or brand mono |

---

## 19. Installer sidebar banner (NSIS)

| Spec | Value |
|------|--------|
| **ID** | `installer-sidebar` |
| **Format** | BMP, 24-bit, no alpha |
| **Size** | 164 × 314 px |
| **Content** | Logo, wine/brass vertical band, subtle texture |
| **Background** | `#1C151A` |

---

## 20. Installer header banner (NSIS)

| Spec | Value |
|------|--------|
| **ID** | `installer-header` |
| **Format** | BMP, 24-bit |
| **Size** | 150 × 57 px |
| **Content** | Horizontal logo + “Producer Pro” wordmark |
| **Background** | `#FCFAF4` or `#1C151A` depending on installer theme |

---

## 21. Portable / executable icon

| Spec | Value |
|------|--------|
| **ID** | `exe-icon` |
| **Format** | `.ico` |
| **Master size** | 256 × 256 px embedded in multi-size ICO |
| **Use** | `ProducerPro.exe` via electron-builder |
| **Source** | Derived from **App icon set** (#3) |

---

## 22. File type association icon (optional)

| Spec | Value |
|------|--------|
| **ID** | `filetype-show` |
| **Purpose** | Associated document icon for show/project files |
| **Extension** | e.g. `.producershow` (if implemented) |
| **Sizes** | 48, 256 px PNG + ICO entry |
| **Style** | Document sheet with small Producer mark corner badge |
| **Badge size** | 10 × 10 px at 48 px icon size |

---

## 23. Loading spinner

| Spec | Value |
|------|--------|
| **ID** | `motion-spinner` |
| **Purpose** | Data load, package generation in progress |
| **Sizes** | 24 × 24 px, 32 × 32 px |
| **Format** | SVG (CSS `animate-transform`) or Lottie JSON |
| **Duration** | 1.2 s loop |
| **Style** | Brass `#BD9550` arc on transparent; 270° arc, 2 px stroke |
| **Reduced motion** | Static brass dot fallback |

---

## 24. Toast micro-icons

| ID | Purpose | Size | Color |
|----|---------|------|-------|
| `toast-success` | Success toast | 20 px | `#2F6F4F` |
| `toast-error` | Error toast | 20 px | `#9E3B2E` |
| `toast-info` | Info toast | 20 px | `#2C6E73` |

| Spec | Value |
|------|--------|
| **Format** | SVG |
| **Style** | Circle + icon centered; 2 px stroke icons |

---

## 25. Package generation progress (optional)

| Spec | Value |
|------|--------|
| **ID** | `motion-package-progress` |
| **Purpose** | Generate package modal / progress state |
| **Size** | 48 × 48 px |
| **Frames** | idle, copying media, writing RTF, complete (3–5 states) |
| **Format** | SVG sprite sheet or Lottie JSON |
| **Duration per transition** | 0.3 s ease |

---

## 26. Product hero screenshot frame

| Spec | Value |
|------|--------|
| **ID** | `marketing-hero` |
| **Purpose** | Website, README, release notes |
| **Size** | 1920 × 1080 px |
| **Format** | PNG |
| **Content** | Full app UI screenshot inside optional device frame; stage-lighting vignette at edges |
| **Safe area** | Keep UI legible in center 80% |

---

## 27. Feature tiles

| ID | Topic | Size |
|----|-------|------|
| `feature-running-order` | Running order + drag-drop | 600 × 400 px |
| `feature-package` | Package export (media + RTF) | 600 × 400 px |
| `feature-typography` | Run sheet typography + preview | 600 × 400 px |
| `feature-closeout` | Closeout ledger + settlement | 600 × 400 px |

| Spec | Value |
|------|--------|
| **Format** | PNG @1x; optional @2x 1200 × 800 px |
| **Style** | Cropped UI callouts with brass accent borders |
| **Text** | Optional caption area 600 × 48 px below image |

---

## Suggested folder structure

```
assets/
├── brand/
│   ├── logo-master.svg
│   ├── wordmark.svg
│   └── wordmark-tagline.svg
├── icons/
│   ├── nav/
│   ├── actions/
│   └── status/
├── illustrations/
│   └── empty-states/
├── textures/
│   ├── rail.png
│   └── paper.png
├── fonts/
│   ├── hanken-grotesk/
│   ├── fraunces/
│   └── space-mono/
├── installer/
│   ├── sidebar.bmp
│   └── header.bmp
├── motion/
│   ├── spinner.svg
│   └── package-progress.json
└── build/
    ├── icon.ico
    ├── icon.png
    └── splash.png
```

---

## Integration checklist (dev)

When assets are delivered, wire them in this order:

- [ ] `build/icon.ico` → `package.json` → `build.win.icon`
- [ ] SVG icons → replace Unicode characters in `LineupDragList`, `ActsPage`, `ShowEditor`, `ui.jsx`
- [ ] Wordmark SVG → `App.jsx` rail brand
- [ ] Empty state SVGs → `EmptyState` component per page
- [ ] Font files → `@font-face` in `styles.css`; remove Google Fonts CDN from `index.html`
- [ ] Textures → `styles.css` background on `.rail` and `.workspace`
- [ ] Splash → Electron `BrowserWindow` splash or `ready-to-show` delay screen
- [ ] Installer BMPs → electron-builder `nsis` config

---

## Delivery format for designers

| Item | Requirement |
|------|-------------|
| Source files | Figma, Illustrator, or Affinity; share edit link or `.fig` / `.ai` export |
| SVG export | Outline strokes; no embedded raster; `viewBox="0 0 24 24"` for icons |
| Naming | kebab-case matching IDs in this document |
| Color profile | sRGB |
| Handoff | Zip or shared drive matching **Suggested folder structure** above |

---

*Producer Pro v1.0.0 — Footlights design system*
