# Producer Pro — LLM Asset Prompts (One Asset Per Prompt)

Every prompt below generates **exactly one file / one variant**. Do not combine prompts.

**Spec reference:** [ASSETS.md](./ASSETS.md)

---

## How to use

1. Work in **numeric order** (P001 → P086) unless noted.
2. **Attach reference files** listed in “Depends on” before pasting the prompt.
3. Copy the entire fenced block for that prompt — cohesion rules are included in each.
4. **Approve P001** before all other brand/icon work.

---

## Prompt index

| ID | Asset ID | Output file | Depends on |
|----|----------|-------------|------------|
| P001 | `brand-logo-full-color` | `assets/brand/logo-full-color.svg` | — |
| P002 | `brand-logo-icon-only` | `assets/brand/logo-icon-only.svg` | P001 |
| P003 | `brand-logo-monochrome-white` | `assets/brand/logo-monochrome-white.svg` | P001 |
| P004 | `brand-logo-monochrome-black` | `assets/brand/logo-monochrome-black.svg` | P001 |
| P005 | `brand-wordmark-horizontal` | `assets/brand/wordmark-horizontal.svg` | P002 |
| P006 | `brand-wordmark-stacked` | `assets/brand/wordmark-stacked.svg` | P002 |
| P007 | `brand-wordmark-tagline` | `assets/brand/wordmark-tagline.svg` | P005 |
| P008 | `app-icon-1024` | `assets/build/icon-1024.png` | P002 |
| P009 | `app-icon-ico` | `assets/build/icon.ico` | P008 |
| P010 | `splash-800x500` | `assets/build/splash-800x500.png` | P002, P005 |
| P011 | `splash-1600x1000` | `assets/build/splash-1600x1000.png` | P010 |
| P012 | `nav-shows-default` | `assets/icons/nav/nav-shows-default.svg` | P002 |
| P013 | `nav-shows-active` | `assets/icons/nav/nav-shows-active.svg` | P012 |
| P014 | `nav-performers-default` | `assets/icons/nav/nav-performers-default.svg` | P012 |
| P015 | `nav-performers-active` | `assets/icons/nav/nav-performers-active.svg` | P014 |
| P016 | `nav-venues-default` | `assets/icons/nav/nav-venues-default.svg` | P012 |
| P017 | `nav-venues-active` | `assets/icons/nav/nav-venues-active.svg` | P016 |
| P018 | `nav-acts-default` | `assets/icons/nav/nav-acts-default.svg` | P012 |
| P019 | `nav-acts-active` | `assets/icons/nav/nav-acts-active.svg` | P018 |
| P020 | `icon-add` | `assets/icons/actions/icon-add.svg` | P012 |
| P021 | `icon-delete` | `assets/icons/actions/icon-delete.svg` | P020 |
| P022 | `icon-edit` | `assets/icons/actions/icon-edit.svg` | P020 |
| P023 | `icon-media` | `assets/icons/actions/icon-media.svg` | P020 |
| P024 | `icon-drag` | `assets/icons/actions/icon-drag.svg` | P020 |
| P025 | `icon-search` | `assets/icons/actions/icon-search.svg` | P020 |
| P026 | `icon-chevron-up` | `assets/icons/actions/icon-chevron-up.svg` | P020 |
| P027 | `icon-chevron-down` | `assets/icons/actions/icon-chevron-down.svg` | P020 |
| P028 | `icon-folder-open` | `assets/icons/actions/icon-folder-open.svg` | P020 |
| P029 | `icon-export` | `assets/icons/actions/icon-export.svg` | P020 |
| P030 | `icon-close` | `assets/icons/actions/icon-close.svg` | P020 |
| P031 | `icon-check` | `assets/icons/actions/icon-check.svg` | P020 |
| P032 | `icon-warning` | `assets/icons/actions/icon-warning.svg` | P020 |
| P033 | `icon-calendar` | `assets/icons/actions/icon-calendar.svg` | P020 |
| P034 | `icon-ticket` | `assets/icons/actions/icon-ticket.svg` | P020 |
| P035 | `status-draft-dot` | `assets/icons/status/status-draft-dot.svg` | P020 |
| P036 | `status-draft-icon` | `assets/icons/status/status-draft-icon.svg` | P035 |
| P037 | `status-packaged` | `assets/icons/status/status-packaged.svg` | P020 |
| P038 | `status-closed` | `assets/icons/status/status-closed.svg` | P020 |
| P039 | `badge-media-ok` | `assets/icons/status/badge-media-ok.svg` | P020 |
| P040 | `badge-media-missing` | `assets/icons/status/badge-media-missing.svg` | P020 |
| P041 | `badge-segment` | `assets/icons/status/badge-segment.svg` | P020 |
| P042 | `texture-rail` | `assets/textures/texture-rail.png` | P001 |
| P043 | `texture-paper` | `assets/textures/texture-paper.png` | P042 |
| P044 | `elevation-1-cards` | `assets/docs/elevation-1-cards.css` | — |
| P045 | `elevation-2-modals` | `assets/docs/elevation-2-modals.css` | P044 |
| P046 | `elevation-3-runsheet` | `assets/docs/elevation-3-runsheet.css` | P044 |
| P047 | `footlight-glow` | `assets/docs/footlight-glow.css` | P044 |
| P048 | `focus-ring` | `assets/icons/focus-ring.svg` | P020 |
| P049 | `empty-shows-svg` | `assets/illustrations/empty-shows.svg` | P001 |
| P050 | `empty-shows-320x240` | `assets/illustrations/empty-shows-320x240.png` | P049 |
| P051 | `empty-shows-640x480` | `assets/illustrations/empty-shows-640x480.png` | P049 |
| P052 | `empty-performers-svg` | `assets/illustrations/empty-performers.svg` | P049 |
| P053 | `empty-performers-320x240` | `assets/illustrations/empty-performers-320x240.png` | P052 |
| P054 | `empty-performers-640x480` | `assets/illustrations/empty-performers-640x480.png` | P052 |
| P055 | `empty-venues-svg` | `assets/illustrations/empty-venues.svg` | P049 |
| P056 | `empty-venues-320x240` | `assets/illustrations/empty-venues-320x240.png` | P055 |
| P057 | `empty-venues-640x480` | `assets/illustrations/empty-venues-640x480.png` | P055 |
| P058 | `empty-acts-svg` | `assets/illustrations/empty-acts.svg` | P049 |
| P059 | `empty-acts-320x240` | `assets/illustrations/empty-acts-320x240.png` | P058 |
| P060 | `empty-acts-640x480` | `assets/illustrations/empty-acts-640x480.png` | P058 |
| P061 | `empty-lineup-svg` | `assets/illustrations/empty-lineup.svg` | P049 |
| P062 | `empty-lineup-320x240` | `assets/illustrations/empty-lineup-320x240.png` | P061 |
| P063 | `empty-lineup-640x480` | `assets/illustrations/empty-lineup-640x480.png` | P061 |
| P064 | `onboarding-hero-svg` | `assets/illustrations/onboarding-hero.svg` | P049 |
| P065 | `onboarding-hero-600x400` | `assets/illustrations/onboarding-hero-600x400.png` | P064 |
| P066 | `onboarding-hero-1200x800` | `assets/illustrations/onboarding-hero-1200x800.png` | P064 |
| P067 | `font-hanken-grotesk-400` | `assets/fonts/hanken-grotesk-400.woff2` | — |
| P068 | `font-hanken-grotesk-500` | `assets/fonts/hanken-grotesk-500.woff2` | P067 |
| P069 | `font-hanken-grotesk-600` | `assets/fonts/hanken-grotesk-600.woff2` | P067 |
| P070 | `font-hanken-grotesk-700` | `assets/fonts/hanken-grotesk-700.woff2` | P067 |
| P071 | `font-fraunces-600` | `assets/fonts/fraunces-600.woff2` | — |
| P072 | `font-fraunces-700` | `assets/fonts/fraunces-700.woff2` | P071 |
| P073 | `font-space-mono-400` | `assets/fonts/space-mono-400.woff2` | — |
| P074 | `font-space-mono-700` | `assets/fonts/space-mono-700.woff2` | P073 |
| P075 | `runsheet-desk-texture` | `assets/textures/runsheet-desk-texture.png` | P043 |
| P076 | `runsheet-paper-tile` | `assets/textures/runsheet-paper-tile.png` | P043 |
| P077 | `runsheet-sample-watermark` | `assets/brand/runsheet-sample-watermark.svg` | P074 |
| P078 | `installer-sidebar` | `assets/installer/sidebar.bmp` | P002, P042 |
| P079 | `installer-header-light` | `assets/installer/header-light.bmp` | P005 |
| P080 | `installer-header-dark` | `assets/installer/header-dark.bmp` | P005 |
| P081 | `filetype-show-48` | `assets/icons/filetype-show-48.png` | P008, P076 |
| P082 | `filetype-show-256` | `assets/icons/filetype-show-256.png` | P081 |
| P083 | `motion-spinner-24` | `assets/motion/spinner-24.svg` | P002 |
| P084 | `motion-spinner-32` | `assets/motion/spinner-32.svg` | P083 |
| P085 | `motion-spinner-static` | `assets/motion/spinner-static.svg` | P083 |
| P086 | `toast-success` | `assets/icons/status/toast-success.svg` | P020 |
| P087 | `toast-error` | `assets/icons/status/toast-error.svg` | P020 |
| P088 | `toast-info` | `assets/icons/status/toast-info.svg` | P020 |
| P089 | `package-progress-idle` | `assets/motion/package-progress-idle.svg` | P029 |
| P090 | `package-progress-copying` | `assets/motion/package-progress-copying.svg` | P089 |
| P091 | `package-progress-writing-rtf` | `assets/motion/package-progress-writing-rtf.svg` | P089 |
| P092 | `package-progress-complete` | `assets/motion/package-progress-complete.svg` | P089 |
| P093 | `marketing-hero-1920x1080` | `assets/marketing/hero-1920x1080.png` | UI integrated |
| P094 | `feature-running-order-600x400` | `assets/marketing/feature-running-order-600x400.png` | P093 |
| P095 | `feature-package-600x400` | `assets/marketing/feature-package-600x400.png` | P093 |
| P096 | `feature-typography-600x400` | `assets/marketing/feature-typography-600x400.png` | P093 |
| P097 | `feature-closeout-600x400` | `assets/marketing/feature-closeout-600x400.png` | P093 |

**Total: 97 prompts — one asset each.**

---

## Cohesion text (included in every prompt below)

Every copy-paste block starts with this paragraph:

```
FOOTLIGHTS COHESION — Producer Pro: professional Electron desktop app for cabaret/theatre producers. Adobe Creative Cloud / InDesign level polish — precise, calm, typographic, never cartoonish. Design system: oxblood & brass on ink & parchment. Colors only: ink #150F13 #1C151A #241B21, wine #7B1E2B #5E1622, brass #BD9550 #D9B879, paper #FCFAF4 #F6F1E8 #E3D9C7, on-dark #F1E8DC #B6A493, on-paper #2A2025 #6B5D62, draft #7E8A93, packaged #B0823A, closed #2F6F4F, danger #9E3B2E, info #2C6E73. Type ref: Hanken Grotesk UI, Fraunces display, Space Mono data. Control radius 10px, panel radius 16px. Icons: 24×24 artboard, 1.75–2px stroke, rounded caps, single-color SVG, currentColor. Illustrations: Adobe vector line + flat fill, theatre motifs, transparent background. sRGB. One file output only.
```

---

<!-- PROMPTS START -->

## P001 — `brand-logo-full-color`

**Depends on:** —  
**Output:** `assets/brand/logo-full-color.svg`

```
FOOTLIGHTS COHESION — Producer Pro: professional Electron desktop app for cabaret/theatre producers. Adobe Creative Cloud / InDesign level polish — precise, calm, typographic, never cartoonish. Design system: oxblood & brass on ink & parchment. Colors only: ink #150F13 #1C151A #241B21, wine #7B1E2B #5E1622, brass #BD9550 #D9B879, paper #FCFAF4 #F6F1E8 #E3D9C7, on-dark #F1E8DC #B6A493, on-paper #2A2025 #6B5D62, draft #7E8A93, packaged #B0823A, closed #2F6F4F, danger #9E3B2E, info #2C6E73. Type ref: Hanken Grotesk UI, Fraunces display, Space Mono data. Control radius 10px, panel radius 16px. Icons: 24×24 artboard, 1.75–2px stroke, rounded caps, single-color SVG, currentColor. Illustrations: Adobe vector line + flat fill, theatre motifs, transparent background. sRGB. One file output only.

ASSET: brand-logo-full-color
OUTPUT FILE ONLY: assets/brand/logo-full-color.svg

Create the full-color master logo symbol for Producer Pro.
- Artboard 1024×1024, 15% safe zone inset
- Colors: wine #7B1E2B + brass #BD9550 on transparent (must read on #1C151A and #FCFAF4)
- One clear motif: footlight OR curtain OR stylized P — not cluttered
- Readable at 16px when simplified later
- Vector SVG only, no raster embed
```

---

## P002 — `brand-logo-icon-only`

**Depends on:** P001 (`logo-full-color.svg` attached)  
**Output:** `assets/brand/logo-icon-only.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: brand-logo-icon-only
OUTPUT FILE ONLY: assets/brand/logo-icon-only.svg
REFERENCE: Attach logo-full-color.svg — extract symbol only, no wordmark text.

Create icon-only version of Producer Pro logo mark.
- Same symbol as reference, centered in 1024×1024
- No typography
- Full color wine + brass
- SVG vector
```

---

## P003 — `brand-logo-monochrome-white`

**Depends on:** P002  
**Output:** `assets/brand/logo-monochrome-white.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: brand-logo-monochrome-white
OUTPUT FILE ONLY: assets/brand/logo-monochrome-white.svg
REFERENCE: logo-icon-only.svg

Single-color white #F1E8DC logo mark for dark backgrounds (#1C151A).
SVG only. No other colors.
```

---

## P004 — `brand-logo-monochrome-black`

**Depends on:** P002  
**Output:** `assets/brand/logo-monochrome-black.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: brand-logo-monochrome-black
OUTPUT FILE ONLY: assets/brand/logo-monochrome-black.svg
REFERENCE: logo-icon-only.svg

Single-color near-black #2A2025 logo mark for light backgrounds (#FCFAF4).
SVG only.
```

---

## P005 — `brand-wordmark-horizontal`

**Depends on:** P002  
**Output:** `assets/brand/wordmark-horizontal.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: brand-wordmark-horizontal
OUTPUT FILE ONLY: assets/brand/wordmark-horizontal.svg
REFERENCE: logo-icon-only.svg

Horizontal lockup: icon + text "Producer Pro" for 188px-wide sidebar.
- Target render ~150×30px
- Text #F1E8DC; optional "Pro" in brass #D9B879
- Display serif feel (Fraunces-like)
- 8px clear space around mark
- SVG
```

---

## P006 — `brand-wordmark-stacked`

**Depends on:** P002  
**Output:** `assets/brand/wordmark-stacked.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: brand-wordmark-stacked
OUTPUT FILE ONLY: assets/brand/wordmark-stacked.svg
REFERENCE: logo-icon-only.svg

Stacked lockup: icon above "Producer Pro" text.
- Text #F1E8DC on transparent (for dark rail)
- SVG only
```

---

## P007 — `brand-wordmark-tagline`

**Depends on:** P005  
**Output:** `assets/brand/wordmark-tagline.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: brand-wordmark-tagline
OUTPUT FILE ONLY: assets/brand/wordmark-tagline.svg
REFERENCE: wordmark-horizontal.svg

Add tagline below lockup: "Cabaret show manager" in smaller UI sans (#B6A493).
Keep horizontal lockup from reference.
SVG only.
```

---

## P008 — `app-icon-1024`

**Depends on:** P002  
**Output:** `assets/build/icon-1024.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: app-icon-1024
OUTPUT FILE ONLY: assets/build/icon-1024.png (1024×1024 PNG)
REFERENCE: logo-icon-only.svg

App icon for Windows/Electron.
- Rounded square background, 12% corner radius, ink #150F13 or wine gradient subtle
- Centered logo from reference, no fine detail
- sRGB PNG 1024×1024 exactly
```

---

## P009 — `app-icon-ico`

**Depends on:** P008  
**Output:** `assets/build/icon.ico`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: app-icon-ico
OUTPUT FILE ONLY: assets/build/icon.ico
REFERENCE: icon-1024.png

Convert to Windows ICO with embedded sizes 16, 32, 48, 64, 128, 256.
Do not redesign — export only.
```

---

## P010 — `splash-800x500`

**Depends on:** P002, P005  
**Output:** `assets/build/splash-800x500.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: splash-800x500
OUTPUT FILE ONLY: assets/build/splash-800x500.png (800×500)
REFERENCE: logo-icon-only.svg, wordmark-horizontal.svg

Splash screen: logo centered on #150F13, subtle brass glow rgba(217,184,121,0.15).
Reserve empty 80×24px bottom-right for version text.
No tagline. PNG sRGB exactly 800×500.
```

---

## P011 — `splash-1600x1000`

**Depends on:** P010  
**Output:** `assets/build/splash-1600x1000.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: splash-1600x1000
OUTPUT FILE ONLY: assets/build/splash-1600x1000.png (1600×1000)
REFERENCE: splash-800x500.png

2× upscale of P010 composition — sharper, same layout. PNG sRGB.
```

---

## P012 — `nav-shows-default`

**Depends on:** P002  
**Output:** `assets/icons/nav/nav-shows-default.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: nav-shows-default
OUTPUT FILE ONLY: assets/icons/nav/nav-shows-default.svg

Navigation icon "Shows" — DEFAULT state for dark rail.
- viewBox 0 0 24 24, stroke 1.75–2px, rounded caps
- Color #B6A493 (use fill/stroke attribute, not currentColor if needed)
- Metaphor: playbill / stage / calendar — pick one clear symbol
- This icon sets the style for all nav icons
```

---

## P013 — `nav-shows-active`

**Depends on:** P012  
**Output:** `assets/icons/nav/nav-shows-active.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: nav-shows-active
OUTPUT FILE ONLY: assets/icons/nav/nav-shows-active.svg
REFERENCE: nav-shows-default.svg

Same geometry as nav-shows-default, ACTIVE state only.
- Color #D9B879
- SVG only
```

---

## P014 — `nav-performers-default`

**Depends on:** P012  
**Output:** `assets/icons/nav/nav-performers-default.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: nav-performers-default
OUTPUT FILE ONLY: assets/icons/nav/nav-performers-default.svg
REFERENCE: nav-shows-default.svg (match stroke weight exactly)

"Performers" nav icon, DEFAULT #B6A493.
Metaphor: performer silhouette / spotlight / mask.
viewBox 0 0 24 24.
```

---

## P015 — `nav-performers-active`

**Depends on:** P014  
**Output:** `assets/icons/nav/nav-performers-active.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: nav-performers-active
OUTPUT FILE ONLY: assets/icons/nav/nav-performers-active.svg
REFERENCE: nav-performers-default.svg

Same paths as default, color #D9B879 only.
```

---

## P016 — `nav-venues-default`

**Depends on:** P012  
**Output:** `assets/icons/nav/nav-venues-default.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: nav-venues-default
OUTPUT FILE ONLY: assets/icons/nav/nav-venues-default.svg
REFERENCE: nav-shows-default.svg

"Venues" nav icon DEFAULT #B6A493. Metaphor: building / marquee / pin.
viewBox 0 0 24 24.
```

---

## P017 — `nav-venues-active`

**Depends on:** P016  
**Output:** `assets/icons/nav/nav-venues-active.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: nav-venues-active
OUTPUT FILE ONLY: assets/icons/nav/nav-venues-active.svg
REFERENCE: nav-venues-default.svg

Same paths, color #D9B879.
```

---

## P018 — `nav-acts-default`

**Depends on:** P012  
**Output:** `assets/icons/nav/nav-acts-default.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: nav-acts-default
OUTPUT FILE ONLY: assets/icons/nav/nav-acts-default.svg
REFERENCE: nav-shows-default.svg

"Acts" nav icon DEFAULT #B6A493. Metaphor: feather / music note / performance.
viewBox 0 0 24 24.
```

---

## P019 — `nav-acts-active`

**Depends on:** P018  
**Output:** `assets/icons/nav/nav-acts-active.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: nav-acts-active
OUTPUT FILE ONLY: assets/icons/nav/nav-acts-active.svg
REFERENCE: nav-acts-default.svg

Same paths, color #D9B879.
```

---

## P020 — `icon-add`

**Depends on:** P012  
**Output:** `assets/icons/actions/icon-add.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: icon-add
OUTPUT FILE ONLY: assets/icons/actions/icon-add.svg
REFERENCE: nav-shows-default.svg

Plus/add icon. viewBox 0 0 24 24, stroke 1.75–2px.
Use currentColor (designed for #6B5D62 on paper).
Sets style for all action icons.
```

---

## P021 — `icon-delete`

**Depends on:** P020  
**Output:** `assets/icons/actions/icon-delete.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: icon-delete
OUTPUT FILE ONLY: assets/icons/actions/icon-delete.svg
REFERENCE: icon-add.svg

Trash/delete icon, same stroke style. currentColor. Danger context #9E3B2E.
```

---

## P022 — `icon-edit`

**Depends on:** P020  
**Output:** `assets/icons/actions/icon-edit.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: icon-edit
OUTPUT FILE ONLY: assets/icons/actions/icon-edit.svg
REFERENCE: icon-add.svg

Pencil/edit icon. currentColor. viewBox 0 0 24 24.
```

---

## P023 — `icon-media`

**Depends on:** P020  
**Output:** `assets/icons/actions/icon-media.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: icon-media
OUTPUT FILE ONLY: assets/icons/actions/icon-media.svg
REFERENCE: icon-add.svg

Music note / attach media icon. currentColor.
```

---

## P024 — `icon-drag`

**Depends on:** P020  
**Output:** `assets/icons/actions/icon-drag.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: icon-drag
OUTPUT FILE ONLY: assets/icons/actions/icon-drag.svg
REFERENCE: icon-add.svg

6-dot drag grip, optical 12×16 in 24×24 viewBox. currentColor.
```

---

## P025 — `icon-search`

**Depends on:** P020  
**Output:** `assets/icons/actions/icon-search.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: icon-search
OUTPUT FILE ONLY: assets/icons/actions/icon-search.svg
REFERENCE: icon-add.svg

Magnifying glass search icon. currentColor.
```

---

## P026 — `icon-chevron-up`

**Depends on:** P020  
**Output:** `assets/icons/actions/icon-chevron-up.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: icon-chevron-up
OUTPUT FILE ONLY: assets/icons/actions/icon-chevron-up.svg
REFERENCE: icon-add.svg

Chevron up, small optical 12px. currentColor.
```

---

## P027 — `icon-chevron-down`

**Depends on:** P020  
**Output:** `assets/icons/actions/icon-chevron-down.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: icon-chevron-down
OUTPUT FILE ONLY: assets/icons/actions/icon-chevron-down.svg
REFERENCE: icon-add.svg

Chevron down. currentColor.
```

---

## P028 — `icon-folder-open`

**Depends on:** P020  
**Output:** `assets/icons/actions/icon-folder-open.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: icon-folder-open
OUTPUT FILE ONLY: assets/icons/actions/icon-folder-open.svg
REFERENCE: icon-add.svg

Open folder icon for "reveal in folder". currentColor.
```

---

## P029 — `icon-export`

**Depends on:** P020  
**Output:** `assets/icons/actions/icon-export.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: icon-export
OUTPUT FILE ONLY: assets/icons/actions/icon-export.svg
REFERENCE: icon-add.svg

Export/generate/package icon (arrow leaving tray or document). currentColor.
```

---

## P030 — `icon-close`

**Depends on:** P020  
**Output:** `assets/icons/actions/icon-close.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: icon-close
OUTPUT FILE ONLY: assets/icons/actions/icon-close.svg
REFERENCE: icon-add.svg

X close icon for modals. currentColor.
```

---

## P031 — `icon-check`

**Depends on:** P020  
**Output:** `assets/icons/actions/icon-check.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: icon-check
OUTPUT FILE ONLY: assets/icons/actions/icon-check.svg
REFERENCE: icon-add.svg

Checkmark confirm icon. currentColor.
```

---

## P032 — `icon-warning`

**Depends on:** P020  
**Output:** `assets/icons/actions/icon-warning.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: icon-warning
OUTPUT FILE ONLY: assets/icons/actions/icon-warning.svg
REFERENCE: icon-add.svg

Warning triangle alert. Designed for #9E3B2E. currentColor.
```

---

## P033 — `icon-calendar`

**Depends on:** P020  
**Output:** `assets/icons/actions/icon-calendar.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: icon-calendar
OUTPUT FILE ONLY: assets/icons/actions/icon-calendar.svg
REFERENCE: icon-add.svg

Calendar icon for show date. currentColor.
```

---

## P034 — `icon-ticket`

**Depends on:** P020  
**Output:** `assets/icons/actions/icon-ticket.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: icon-ticket
OUTPUT FILE ONLY: assets/icons/actions/icon-ticket.svg
REFERENCE: icon-add.svg

Ticket icon for ticket price. currentColor.
```

---

## P035 — `status-draft-dot`

**Depends on:** P020  
**Output:** `assets/icons/status/status-draft-dot.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: status-draft-dot
OUTPUT FILE ONLY: assets/icons/status/status-draft-dot.svg

8px circle dot, fill #7E8A93, viewBox 0 0 8 8.
```

---

## P036 — `status-draft-icon`

**Depends on:** P035  
**Output:** `assets/icons/status/status-draft-icon.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: status-draft-icon
OUTPUT FILE ONLY: assets/icons/status/status-draft-icon.svg
REFERENCE: status-draft-dot.svg

16px draft status icon incorporating dot + document outline. Color #7E8A93.
viewBox 0 0 24 24.
```

---

## P037 — `status-packaged`

**Depends on:** P020  
**Output:** `assets/icons/status/status-packaged.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: status-packaged
OUTPUT FILE ONLY: assets/icons/status/status-packaged.svg

Packaged show status icon, 16px optical, color #B0823A.
```

---

## P038 — `status-closed`

**Depends on:** P020  
**Output:** `assets/icons/status/status-closed.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: status-closed
OUTPUT FILE ONLY: assets/icons/status/status-closed.svg

Closed/settled status — checkmark or seal, color #2F6F4F.
```

---

## P039 — `badge-media-ok`

**Depends on:** P020  
**Output:** `assets/icons/status/badge-media-ok.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: badge-media-ok
OUTPUT FILE ONLY: assets/icons/status/badge-media-ok.svg

14px optical media-attached badge (check + note). Color #2F6F4F.
```

---

## P040 — `badge-media-missing`

**Depends on:** P020  
**Output:** `assets/icons/status/badge-media-missing.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: badge-media-missing
OUTPUT FILE ONLY: assets/icons/status/badge-media-missing.svg

14px optical no-media badge. Color #9E3B2E or #6B5D62 muted.
```

---

## P041 — `badge-segment`

**Depends on:** P020  
**Output:** `assets/icons/status/badge-segment.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: badge-segment
OUTPUT FILE ONLY: assets/icons/status/badge-segment.svg

14px segment type badge — clipboard or dashed line motif. #6B5D62.
```

---

## P042 — `texture-rail`

**Depends on:** P001  
**Output:** `assets/textures/texture-rail.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: texture-rail
OUTPUT FILE ONLY: assets/textures/texture-rail.png

Seamless 512×512 @2x noise/grain tile for sidebar #1C151A.
3–8% opacity velvet grain, warm undertone, WCAG-safe with #F1E8DC text.
PNG sRGB seamless all edges.
```

---

## P043 — `texture-paper`

**Depends on:** P042  
**Output:** `assets/textures/texture-paper.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: texture-paper
OUTPUT FILE ONLY: assets/textures/texture-paper.png
REFERENCE: texture-rail.png (same grain family, lighter)

Seamless 512×512 parchment fiber for #FCFAF4 workspace.
4–12% multiply strength. No visible repeat at 1400px.
PNG sRGB.
```

---

## P044 — `elevation-1-cards`

**Depends on:** —  
**Output:** `assets/docs/elevation-1-cards.css`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: elevation-1-cards
OUTPUT FILE ONLY: assets/docs/elevation-1-cards.css

Single CSS rule:
--shadow-elevation-1: 0 1px 3px rgba(21, 15, 19, 0.06);
Comment: cards, list rows on paper.
```

---

## P045 — `elevation-2-modals`

**Depends on:** P044  
**Output:** `assets/docs/elevation-2-modals.css`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: elevation-2-modals
OUTPUT FILE ONLY: assets/docs/elevation-2-modals.css

Single CSS rule:
--shadow-elevation-2: 0 4px 24px rgba(21, 15, 19, 0.12), 0 1px 3px rgba(21, 15, 19, 0.06);
Comment: workspace, modals.
```

---

## P046 — `elevation-3-runsheet`

**Depends on:** P044  
**Output:** `assets/docs/elevation-3-runsheet.css`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: elevation-3-runsheet
OUTPUT FILE ONLY: assets/docs/elevation-3-runsheet.css

Single CSS rule:
--shadow-elevation-3: 0 1px 4px rgba(0, 0, 0, 0.2), 0 8px 28px rgba(0, 0, 0, 0.22);
Comment: run sheet page preview.
```

---

## P047 — `footlight-glow`

**Depends on:** P044  
**Output:** `assets/docs/footlight-glow.css`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: footlight-glow
OUTPUT FILE ONLY: assets/docs/footlight-glow.css

Single CSS rule:
--shadow-footlight: 0 0 40px rgba(217, 184, 121, 0.15);
Comment: brand accent glow.
```

---

## P048 — `focus-ring`

**Depends on:** P020  
**Output:** `assets/icons/focus-ring.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: focus-ring
OUTPUT FILE ONLY: assets/icons/focus-ring.svg

Focus ring demo: 120×40 rounded rect (radius 10px) with 2px #BD9550 ring offset 2px outside.
SVG showing keyboard focus spec.
```

---

## P049 — `empty-shows-svg`

**Depends on:** P001  
**Output:** `assets/illustrations/empty-shows.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: empty-shows-svg
OUTPUT FILE ONLY: assets/illustrations/empty-shows.svg

Empty state illustration: empty stage with curtain.
Adobe vector line + flat fill. Palette wine/brass/ink/paper only.
Transparent background. Sets style for all empty states.
```

---

## P050 — `empty-shows-320x240`

**Depends on:** P049  
**Output:** `assets/illustrations/empty-shows-320x240.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: empty-shows-320x240
OUTPUT FILE ONLY: assets/illustrations/empty-shows-320x240.png
REFERENCE: empty-shows.svg

Rasterize reference to exactly 320×240 PNG, sRGB, transparent background.
```

---

## P051 — `empty-shows-640x480`

**Depends on:** P049  
**Output:** `assets/illustrations/empty-shows-640x480.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: empty-shows-640x480
OUTPUT FILE ONLY: assets/illustrations/empty-shows-640x480.png
REFERENCE: empty-shows.svg

Rasterize reference to exactly 640×480 PNG @2x, sRGB, transparent.
```

---

## P052 — `empty-performers-svg`

**Depends on:** P049  
**Output:** `assets/illustrations/empty-performers.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: empty-performers-svg
OUTPUT FILE ONLY: assets/illustrations/empty-performers.svg
REFERENCE: empty-shows.svg (match line weight)

Spotlight + microphone empty state. Same illustration style as reference.
```

---

## P053 — `empty-performers-320x240`

**Depends on:** P052  
**Output:** `assets/illustrations/empty-performers-320x240.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: empty-performers-320x240
OUTPUT FILE ONLY: assets/illustrations/empty-performers-320x240.png
REFERENCE: empty-performers.svg

Rasterize to 320×240 PNG transparent.
```

---

## P054 — `empty-performers-640x480`

**Depends on:** P052  
**Output:** `assets/illustrations/empty-performers-640x480.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: empty-performers-640x480
OUTPUT FILE ONLY: assets/illustrations/empty-performers-640x480.png
REFERENCE: empty-performers.svg

Rasterize to 640×480 PNG transparent.
```

---

## P055 — `empty-venues-svg`

**Depends on:** P049  
**Output:** `assets/illustrations/empty-venues.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: empty-venues-svg
OUTPUT FILE ONLY: assets/illustrations/empty-venues.svg
REFERENCE: empty-shows.svg

Theatre marquee / venue facade empty state. Match reference style.
```

---

## P056 — `empty-venues-320x240`

**Depends on:** P055  
**Output:** `assets/illustrations/empty-venues-320x240.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: empty-venues-320x240
OUTPUT FILE ONLY: assets/illustrations/empty-venues-320x240.png
REFERENCE: empty-venues.svg

Rasterize 320×240 PNG transparent.
```

---

## P057 — `empty-venues-640x480`

**Depends on:** P055  
**Output:** `assets/illustrations/empty-venues-640x480.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: empty-venues-640x480
OUTPUT FILE ONLY: assets/illustrations/empty-venues-640x480.png
REFERENCE: empty-venues.svg

Rasterize 640×480 PNG transparent.
```

---

## P058 — `empty-acts-svg`

**Depends on:** P049  
**Output:** `assets/illustrations/empty-acts.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: empty-acts-svg
OUTPUT FILE ONLY: assets/illustrations/empty-acts.svg
REFERENCE: empty-shows.svg

Feather / sequins / sheet music — act library empty state. Match reference style.
```

---

## P059 — `empty-acts-320x240`

**Depends on:** P058  
**Output:** `assets/illustrations/empty-acts-320x240.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: empty-acts-320x240
OUTPUT FILE ONLY: assets/illustrations/empty-acts-320x240.png
REFERENCE: empty-acts.svg

Rasterize 320×240 PNG transparent.
```

---

## P060 — `empty-acts-640x480`

**Depends on:** P058  
**Output:** `assets/illustrations/empty-acts-640x480.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: empty-acts-640x480
OUTPUT FILE ONLY: assets/illustrations/empty-acts-640x480.png
REFERENCE: empty-acts.svg

Rasterize 640×480 PNG transparent.
```

---

## P061 — `empty-lineup-svg`

**Depends on:** P049  
**Output:** `assets/illustrations/empty-lineup.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: empty-lineup-svg
OUTPUT FILE ONLY: assets/illustrations/empty-lineup.svg
REFERENCE: empty-shows.svg

Clipboard / cue sheet with empty numbered lines. Match reference style.
```

---

## P062 — `empty-lineup-320x240`

**Depends on:** P061  
**Output:** `assets/illustrations/empty-lineup-320x240.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: empty-lineup-320x240
OUTPUT FILE ONLY: assets/illustrations/empty-lineup-320x240.png
REFERENCE: empty-lineup.svg

Rasterize 320×240 PNG transparent.
```

---

## P063 — `empty-lineup-640x480`

**Depends on:** P061  
**Output:** `assets/illustrations/empty-lineup-640x480.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: empty-lineup-640x480
OUTPUT FILE ONLY: assets/illustrations/empty-lineup-640x480.png
REFERENCE: empty-lineup.svg

Rasterize 640×480 PNG transparent.
```

---

## P064 — `onboarding-hero-svg`

**Depends on:** P049  
**Output:** `assets/illustrations/onboarding-hero.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: onboarding-hero-svg
OUTPUT FILE ONLY: assets/illustrations/onboarding-hero.svg
REFERENCE: empty-shows.svg

Three-step visual without text: Build order → Package → Closeout.
Adobe vector style, transparent background.
```

---

## P065 — `onboarding-hero-600x400`

**Depends on:** P064  
**Output:** `assets/illustrations/onboarding-hero-600x400.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: onboarding-hero-600x400
OUTPUT FILE ONLY: assets/illustrations/onboarding-hero-600x400.png
REFERENCE: onboarding-hero.svg

Rasterize exactly 600×400 PNG sRGB.
```

---

## P066 — `onboarding-hero-1200x800`

**Depends on:** P064  
**Output:** `assets/illustrations/onboarding-hero-1200x800.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: onboarding-hero-1200x800
OUTPUT FILE ONLY: assets/illustrations/onboarding-hero-1200x800.png
REFERENCE: onboarding-hero.svg

Rasterize exactly 1200×800 PNG @2x sRGB.
```

---

## P067 — `font-hanken-grotesk-400`

**Depends on:** —  
**Output:** `assets/fonts/hanken-grotesk-400.woff2`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: font-hanken-grotesk-400
OUTPUT FILE ONLY: assets/fonts/hanken-grotesk-400.woff2

Source Hanken Grotesk Regular 400, SIL OFL licensed, Latin extended subset, woff2 only.
Include license text snippet in response.
```

---

## P068 — `font-hanken-grotesk-500`

**Depends on:** P067  
**Output:** `assets/fonts/hanken-grotesk-500.woff2`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: font-hanken-grotesk-500
OUTPUT FILE ONLY: assets/fonts/hanken-grotesk-500.woff2

Hanken Grotesk Medium 500, woff2, same subset as P067.
```

---

## P069 — `font-hanken-grotesk-600`

**Depends on:** P067  
**Output:** `assets/fonts/hanken-grotesk-600.woff2`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: font-hanken-grotesk-600
OUTPUT FILE ONLY: assets/fonts/hanken-grotesk-600.woff2

Hanken Grotesk SemiBold 600, woff2.
```

---

## P070 — `font-hanken-grotesk-700`

**Depends on:** P067  
**Output:** `assets/fonts/hanken-grotesk-700.woff2`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: font-hanken-grotesk-700
OUTPUT FILE ONLY: assets/fonts/hanken-grotesk-700.woff2

Hanken Grotesk Bold 700, woff2.
```

---

## P071 — `font-fraunces-600`

**Depends on:** —  
**Output:** `assets/fonts/fraunces-600.woff2`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: font-fraunces-600
OUTPUT FILE ONLY: assets/fonts/fraunces-600.woff2

Fraunces SemiBold 600, SIL OFL, woff2, Latin extended.
```

---

## P072 — `font-fraunces-700`

**Depends on:** P071  
**Output:** `assets/fonts/fraunces-700.woff2`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: font-fraunces-700
OUTPUT FILE ONLY: assets/fonts/fraunces-700.woff2

Fraunces Bold 700, woff2.
```

---

## P073 — `font-space-mono-400`

**Depends on:** —  
**Output:** `assets/fonts/space-mono-400.woff2`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: font-space-mono-400
OUTPUT FILE ONLY: assets/fonts/space-mono-400.woff2

Space Mono Regular 400, SIL OFL, woff2.
```

---

## P074 — `font-space-mono-700`

**Depends on:** P073  
**Output:** `assets/fonts/space-mono-700.woff2`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: font-space-mono-700
OUTPUT FILE ONLY: assets/fonts/space-mono-700.woff2

Space Mono Bold 700, woff2.
```

---

## P075 — `runsheet-desk-texture`

**Depends on:** P043  
**Output:** `assets/textures/runsheet-desk-texture.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: runsheet-desk-texture
OUTPUT FILE ONLY: assets/textures/runsheet-desk-texture.png

Gray desk surface for run sheet preview. 400×300 PNG.
Gradient #6e6e6e → #5a5a5a, optional 10% grain matching texture-paper family.
```

---

## P076 — `runsheet-paper-tile`

**Depends on:** P043  
**Output:** `assets/textures/runsheet-paper-tile.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: runsheet-paper-tile
OUTPUT FILE ONLY: assets/textures/runsheet-paper-tile.png

Seamless white paper grain tile for US Letter page preview. 256×256 PNG seamless.
2% off-white fiber on #FFFFFF.
```

---

## P077 — `runsheet-sample-watermark`

**Depends on:** P074  
**Output:** `assets/brand/runsheet-sample-watermark.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: runsheet-sample-watermark
OUTPUT FILE ONLY: assets/brand/runsheet-sample-watermark.svg

Text "SAMPLE" in Space Mono Bold style, fill #BD9550, ~120px wide, for 40% opacity overlay use.
SVG only.
```

---

## P078 — `installer-sidebar`

**Depends on:** P002, P042  
**Output:** `assets/installer/sidebar.bmp`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: installer-sidebar
OUTPUT FILE ONLY: assets/installer/sidebar.bmp
REFERENCE: logo-icon-only.svg, texture-rail.png

NSIS sidebar BMP 164×314, 24-bit no alpha.
Background #1C151A, wine/brass vertical band, logo mark, subtle grain.
```

---

## P079 — `installer-header-light`

**Depends on:** P005  
**Output:** `assets/installer/header-light.bmp`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: installer-header-light
OUTPUT FILE ONLY: assets/installer/header-light.bmp
REFERENCE: wordmark-horizontal.svg

NSIS header BMP 150×57, 24-bit. Light background #FCFAF4, horizontal wordmark.
```

---

## P080 — `installer-header-dark`

**Depends on:** P005  
**Output:** `assets/installer/header-dark.bmp`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: installer-header-dark
OUTPUT FILE ONLY: assets/installer/header-dark.bmp
REFERENCE: wordmark-horizontal.svg

NSIS header BMP 150×57, 24-bit. Dark background #1C151A, wordmark for light text variant.
```

---

## P081 — `filetype-show-48`

**Depends on:** P008, P076  
**Output:** `assets/icons/filetype-show-48.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: filetype-show-48
OUTPUT FILE ONLY: assets/icons/filetype-show-48.png (48×48)
REFERENCE: icon-1024.png, runsheet-paper-tile.png

Windows document icon: US Letter page with app mark badge 10×10 bottom-right #BD9550.
PNG 48×48 sRGB.
```

---

## P082 — `filetype-show-256`

**Depends on:** P081  
**Output:** `assets/icons/filetype-show-256.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: filetype-show-256
OUTPUT FILE ONLY: assets/icons/filetype-show-256.png (256×256)
REFERENCE: filetype-show-48.png

Upscale same composition to 256×256 sharper PNG. Do not redesign.
```

---

## P083 — `motion-spinner-24`

**Depends on:** P002  
**Output:** `assets/motion/spinner-24.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: motion-spinner-24
OUTPUT FILE ONLY: assets/motion/spinner-24.svg

Loading spinner 24×24: 270° arc, 2px stroke #BD9550, transparent center.
Include CSS @keyframes rotate 1.2s linear infinite in comment.
```

---

## P084 — `motion-spinner-32`

**Depends on:** P083  
**Output:** `assets/motion/spinner-32.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: motion-spinner-32
OUTPUT FILE ONLY: assets/motion/spinner-32.svg
REFERENCE: spinner-24.svg

Same arc design scaled to 32×32 viewBox.
```

---

## P085 — `motion-spinner-static`

**Depends on:** P083  
**Output:** `assets/motion/spinner-static.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: motion-spinner-static
OUTPUT FILE ONLY: assets/motion/spinner-static.svg
REFERENCE: spinner-24.svg

Reduced-motion fallback: static brass #BD9550 dot 6px centered in 24×24.
```

---

## P086 — `toast-success`

**Depends on:** P020  
**Output:** `assets/icons/status/toast-success.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: toast-success
OUTPUT FILE ONLY: assets/icons/status/toast-success.svg

20px optical success icon: circle + check, color #2F6F4F, viewBox 0 0 24 24, 2px stroke.
```

---

## P087 — `toast-error`

**Depends on:** P020  
**Output:** `assets/icons/status/toast-error.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: toast-error
OUTPUT FILE ONLY: assets/icons/status/toast-error.svg

20px optical error icon: circle + X, color #9E3B2E.
```

---

## P088 — `toast-info`

**Depends on:** P020  
**Output:** `assets/icons/status/toast-info.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: toast-info
OUTPUT FILE ONLY: assets/icons/status/toast-info.svg

20px optical info icon: circle + i, color #2C6E73.
```

---

## P089 — `package-progress-idle`

**Depends on:** P029  
**Output:** `assets/motion/package-progress-idle.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: package-progress-idle
OUTPUT FILE ONLY: assets/motion/package-progress-idle.svg
REFERENCE: icon-export.svg

48×48 idle state for package generation — export icon static, brass #BD9550 accent.
```

---

## P090 — `package-progress-copying`

**Depends on:** P089  
**Output:** `assets/motion/package-progress-copying.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: package-progress-copying
OUTPUT FILE ONLY: assets/motion/package-progress-copying.svg
REFERENCE: package-progress-idle.svg

48×48 copying media state — add motion lines or stacked files indicator.
```

---

## P091 — `package-progress-writing-rtf`

**Depends on:** P089  
**Output:** `assets/motion/package-progress-writing-rtf.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: package-progress-writing-rtf
OUTPUT FILE ONLY: assets/motion/package-progress-writing-rtf.svg
REFERENCE: package-progress-idle.svg

48×48 writing run sheet state — document + pen lines motif.
```

---

## P092 — `package-progress-complete`

**Depends on:** P089  
**Output:** `assets/motion/package-progress-complete.svg`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: package-progress-complete
OUTPUT FILE ONLY: assets/motion/package-progress-complete.svg
REFERENCE: package-progress-idle.svg

48×48 complete state — checkmark #2F6F4F over export icon.
```

---

## P093 — `marketing-hero-1920x1080`

**Depends on:** Integrated UI  
**Output:** `assets/marketing/hero-1920x1080.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: marketing-hero-1920x1080
OUTPUT FILE ONLY: assets/marketing/hero-1920x1080.png (1920×1080)

Marketing screenshot of Producer Pro UI: dark rail #1C151A, parchment workspace, running order + run sheet preview.
Subtle stage vignette at edges. Center 80% legible. Realistic cabaret show names. PNG sRGB.
```

---

## P094 — `feature-running-order-600x400`

**Depends on:** P093  
**Output:** `assets/marketing/feature-running-order-600x400.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: feature-running-order-600x400
OUTPUT FILE ONLY: assets/marketing/feature-running-order-600x400.png
REFERENCE: hero-1920x1080.png (match style)

Cropped feature tile: running order with drag handles. Brass #BD9550 callout border. 600×400 PNG.
```

---

## P095 — `feature-package-600x400`

**Depends on:** P093  
**Output:** `assets/marketing/feature-package-600x400.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: feature-package-600x400
OUTPUT FILE ONLY: assets/marketing/feature-package-600x400.png

Package export UI crop, 600×400 PNG, match hero style.
```

---

## P096 — `feature-typography-600x400`

**Depends on:** P093  
**Output:** `assets/marketing/feature-typography-600x400.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: feature-typography-600x400
OUTPUT FILE ONLY: assets/marketing/feature-typography-600x400.png

Run sheet page preview + typography panel crop. SAMPLE badge visible. 600×400 PNG.
```

---

## P097 — `feature-closeout-600x400`

**Depends on:** P093  
**Output:** `assets/marketing/feature-closeout-600x400.png`

```
FOOTLIGHTS COHESION — [same block as P001]

ASSET: feature-closeout-600x400
OUTPUT FILE ONLY: assets/marketing/feature-closeout-600x400.png

Closeout ledger UI crop, green #2F6F4F totals. 600×400 PNG.
```

---

*Producer Pro v1.0.0 — 97 single-asset prompts — Footlights design system*
