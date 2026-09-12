# Design

Visual system for AnonLetter. One dark editorial house, five lit rooms inside it.

Shell tokens never change. Room tokens swap wholesale at the `data-mood` root, so a single
CSS-variable flip re-skins every component.

## Theme

**Dark shell, light rooms.** The scene: someone alone at night, phone in hand, about to say a
thing they have not been able to say. The shell is that room with the lights off — near-black,
one warm gold light source, a lot of air. The letter itself is the lit object in it.

Four of the five rooms invert to light because a letter is paper, and paper is not a dark
surface. Night Thought is the one dark room, and it is the only one that reads as the shell's
own interior.

Color strategy: **Committed** in the shell (one gold accent against near-black, ≤10% coverage,
the rest is void and air), **Drenched** in each room (the room's background IS the color, 100%
of the surface).

## Color

### Shell — the house

| Token | Value | Role |
|---|---|---|
| `--void` | `#0b0a08` | Page base |
| `--void-raised` | `#141210` | Cards, sheets, toasts |
| `--paper` | `#f2ede6` | Primary text |
| `--gold` | `#c8a96e` | Accent, seal, focus |
| `--gold-lift` | `#e2c99a` | Hover only |
| `--wax` | `#8a3020` | Seal body, error base |
| `--success` | `#7fae86` | Desaturated to sit beside gold. Used once — send confirmation |
| `--error` | `#c9705c` | Wax red lifted to pass 4.5:1 on void. Never pure red |

Text ramp on void: body `rgba(242,237,230,.72)`, secondary `.55`, metadata `.38`. Nothing a
reader must read goes below `.55` — the design-system draft allowed `.45`, which fails 4.5:1
on `#0b0a08` at body sizes. Raised to `.55` as the floor.

Hairline is one weight everywhere: `rgba(242,237,230,.09)`, 1px, no exceptions.

### Rooms — the five moods

`bg` / `accent` / `text` are locked by the template registry. Surface, border, muted and states
are derived: surface is the bg lifted toward white (toward its own hue in Night Thought), border
is the accent mixed into bg at 30–40%.

| Room | bg | accent | text | muted |
|---|---|---|---|---|
| Soft Bloom | `#fdf0f5` | `#f0a0ba` | `#4a2030` | `#8b6070` |
| Old Letter | `#fdf6ec` | `#c4976a` | `#3a2410` | `#7b6045` |
| Night Thought | `#1a1b2e` | `#8b90d0` | `#c8caf0` | `#7a7fa6` |
| Quiet Garden | `#eaf7f0` | `#3b6d11` | `#1a3208` | `#5d7a4c` |
| Confetti Love | `#fff8e7` | `#e8c99a` | `#4a3010` | `#8a6b3e` |

**Contrast rule.** The accent is never a text color on its own background — Confetti Love's
`#e8c99a` on `#fff8e7` is 1.4:1. Accents carry *objects*: rules, seals, petals, underlines,
focus rings. Text stays on `text` and `muted`, both ≥4.5:1 in all five rooms.

## Typography

### Families

| Role | Family | Notes |
|---|---|---|
| Shell display | Cormorant Garamond 300 | Hero, section heads. Italic half-line in gold |
| Shell UI | DM Sans 300/500 | Buttons, labels, prose |
| Shell mono | Courier Prime | Token names, counters, timestamps |
| Soft Bloom | Playfair Display italic / Lato 300 | |
| Old Letter | Courier Prime (typed) / Georgia (set) | Courier for the message, Georgia for chrome |
| Night Thought | Cormorant Garamond italic / DM Sans 300 | |
| Quiet Garden | Playfair Display italic / Inter 300 | |
| **Confetti Love** | **Bricolage Grotesque 800 / Archivo 400** | **Changed — see below** |

### Confetti Love: Teko → Bricolage Grotesque

Teko was wrong for the room. It is a condensed signage/sports face — cold, narrow, utilitarian.
On warm cream `#fff8e7` with a terracotta seal it read as a gym poster, not a celebration, and
its condensed rhythm fought the generosity the room is supposed to have. Rajdhani had the same
squared-off coldness in the body role.

**Bricolage Grotesque** (display, 800, `opsz` 96) is a variable grotesque with deliberately wonky
joints, uneven terminals and a tall x-height — handmade warmth at poster scale. It is the only
grotesque in the house, so Confetti Love is instantly distinguishable from the four serif rooms
without needing extra ornament. **Archivo** (body, 400/500) carries the prose: a warm neutral
grotesque built for print headlines, which sits under Bricolage without competing.

The room keeps its `0.86` display line-height and drops the `+0.02em` tracking Teko needed —
Bricolage is already wide enough at 800.

### Scale

One modular scale, ratio 1.333, base 16px, fluid via `clamp()`. Display sizes are shared across
rooms; only family and optical letter-spacing change. Tracking is inverse to size — display steps
go negative, label steps go far positive.

| Step | Size | Use |
|---|---|---|
| `display` | `clamp(2.75rem, 7vw, 5.75rem)` | Hero only, once per page. LH .96, tracking −.02em |
| `h1` | `clamp(1.875rem, 4.4vw, 3.25rem)` | Section heads. LH 1.06 |
| `h2` | `2rem` | Step titles, card headings |
| `h3` | `1.5rem` | Sub-heads, modal titles |
| `letter` | `1.1875rem` / LH 1.75 | The message. Max 46ch. Always room `text` at 88% |
| `body` | `.9375rem` / LH 1.85 | UI prose, max 62ch |
| `caption` | `.78rem` / LH 1.6 | Metadata, helper text, counters |
| `label` | `.625rem` / +.34em | Uppercase, never italic, never below 10px |

Display ceiling is 5.75rem (92px) — under the 6rem shouting threshold. Letter-spacing floor is
−0.02em, well inside the −0.04em collision limit.

Light-on-dark rooms add `+0.05` line-height; light type reads lighter and needs the room.

## Texture

This is the part that was broken. The shipped `paper-grain-alpha-tile.png` is an opaque near-white
1024² sheet with sparse flecks and no seamless edge. Applied as the spec directed —
`mix-blend-mode: multiply` at `.06–.14`, tiled at 180px — it washed the paper *flatter* and
tiled with a visible seam. Same failure in `night-star-sprite-atlas` and `ambient-dust-alpha-map`
(hollow concentric rings that read as soap bubbles in a repeating polka-dot) and
`soft-bloom-halftone-alpha` (a centered patch, not a tile).

**Paper is rebuilt procedurally, in five thin layers.** Realism in paper comes from *edge and
light*, not from noise:

1. **Light** — a wide off-center radial, warm at the top-left, falling off toward the lower right.
   The single biggest contributor; a flat-lit sheet always reads as a rectangle of color.
2. **Fiber** — two `repeating-linear-gradient`s at 0° and 90°, 1px lines at ~1.5% alpha. Gives
   woven tooth at reading distance without being visible as a pattern.
3. **Grain** — SVG `feTurbulence` crushed by `feComponentTransfer` to a narrow band around mid-
   grey, then applied at `.035`. Crushing is what separates paper from television static.
4. **Edge** — an inset shadow at the sheet boundary so the sheet has thickness and catches light.
5. **Deckle** — an irregular edge mask on the reading surface only.

Old Letter is the one room allowed to look worn: grain to `.06`, plus a sepia vignette and a
single fold crease.

Textures are constants, not percentages — the fiber and grain scale never changes with viewport.

### Assets kept vs. rebuilt

**Kept** (photographic objects, genuinely good): `petal-sprite-sheet` 4×4, `botanical-sprite-sheet`
5×4, `confetti-sprite-sheet` 6×6, `wax-fragments-sprite-sheet` 3×3, `wax-seal`, and the four
composed motif arts used by picker cards and room corners. All converted to WebP — the shipped
set is 1.3MB, down from 14MB of source PNG. Anything the app does not actually reference is not
shipped: `shared-white-doodles` and `letter-sheet-blank` stayed in the source kit.

**Rebuilt in code**: paper grain, the starfield (canvas points with a drawn radial sprite, not
the ring atlas), ambient dust, the Soft Bloom halftone (a true CSS `radial-gradient` tile), and
the envelope.

**The envelope is CSS, not bitmap.** `envelope-pocket-front.png` and `envelope-flap.png` are
locked oxblood and cannot retint, which would give all five moods the same maroon envelope. The
design system's own §2.4 specifies a CSS envelope for the product reveal and reserves the PNG
composite for static surfaces — OG images, email headers. Followed exactly. The CSS envelope
takes six values per mood: three paper stops, two wax stops, one hairline.

## Layout

- 12 column, 24px gutter, max 1280px, page inset `clamp(1.75rem, 7vw, 7.5rem)`.
- The composer overrides to a single 640px column. The compose flow is a letter, not a dashboard.
- Spacing base 4px: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 132. Nothing between steps.
- Sections breathe 132px desktop / 72px mobile. Eyebrow→heading 24px, heading→body 12px,
  body→content 64px.
- Radius: 2px buttons and inputs, 3px envelope, 4px letter cards, 0 on rules. Paper has corners.
- Measure: letter 46ch, UI prose 62ch, captions 48ch.
- Breakpoints 640 / 1024 / 1440. Template grid 5→3→1.

### Z-index scale

Semantic, never arbitrary. `ambient` 0 · `motif` 1 · `paper` 10 · `pocket` 20 · `flap` 30 ·
`seal` 40 · `fore` 50 · `ui` 100 · `sticky` 200 · `scrim` 300 · `modal` 310 · `toast` 400.

## Components

Every component is drawn once against the shell, then re-skinned by token swap. All eight
interactive states are defined: default, hover, focus-visible, active, disabled, loading, error,
success.

- **Buttons.** Primary is a filled gold slab, 2px radius, 11px uppercase at +.2em. Hover lifts
  1px with a sheen wipe; active scales .985 over 90ms; focus-visible is an offset double ring
  (void gap, then gold) so it reads on any surface. Magnetic pull (0.18 of cursor offset) applies
  to shell buttons only — inside a room the buttons hold still, because the room already has its
  one gesture.
- **Composer field.** A raised paper sheet on the void, not an inset well. Focus lifts the sheet
  2px and warms the shadow; the gold left rule is the only focus indicator that moves. Counter
  turns error at 760 and blocks at 800 — it never scolds earlier.
- **Inputs.** Underline only. No boxes anywhere in the composer; the only rectangle on screen
  should be the letter itself. Visible `<label>` always — placeholders are not labels.
- **Template card.** 3:4 always. Rest shows palette and name; hover raises 4px and reveals the
  use-case line; selection is a gold ring plus a check — never a color change, because the color
  *is* the content.
- **Progress.** A hairline, not a bar. Completed nodes stay gold so the flow reads as ground
  already covered.
- **Loading.** Three to five ruled lines at letter measure, shimmering. No spinners anywhere.
- **Report.** Muted token at 55%, footer rail, 44×44 hit area. Hover brings it to full muted and
  nothing else — no red, no icon change.

## Motion

| Token | Curve | Use |
|---|---|---|
| `--ease-enter` | `cubic-bezier(.22,1,.36,1)` | Everything arriving |
| `--ease-object` | `cubic-bezier(.4,0,.2,1)` | Flap, letter, anything with implied mass |
| `--ease-idle` | `sine.inOut` | Bobs, drifts, twinkles. Never on a state change |

Durations: micro 180ms · UI 420ms · object 800–1200ms · ambient 3–14s. Nothing between.

No bounce or elastic on the reading surface — reserved for the Success seal press.

**The reveal** is one master timeline, 9.5s to rest: ambient 0.0 → envelope descends 1.2 → seal
dissolves 2.6 → flap opens 3.0 → letter rises 3.9 → greeting 4.6 → typewriter 5.0 → signature
+0.8s after the last character. Any tap or key skips to rest.

Reduced motion: the timeline collapses to a 400ms crossfade with the envelope already open, the
message whole, and every ambient field on its resting frame.

## Performance

### Letter composition and preview refinement — September 2026

Reading surfaces now reserve an outer margin for one motif: three photographed petals for
Soft Bloom, a single pressed rose stem for Quiet Garden, and a small wax seal for Old Letter.
The generated PNGs preserve transparency; their prompts are in `apps/web/public/assets/GENERATED.md`.
The previous collage assets remain in the template gallery but no longer sit behind letter text.
Night Thought keeps its stars. Confetti Love uses small paper shapes, with a single burst that
clears after 2.5 seconds; reduced motion keeps the pieces in the outer margins.

On phones, the motif moves into a short header area, clear of the letter. The composer preview
uses the same `LetterRoom` and `LetterLead` as the recipient page. Full preview runs the actual
reveal with local draft data, including replay and skip, without API requests or delivery.
Email remains the default delivery option; link-only delivery skips email entirely.


One canvas per page, capped at 90 nodes, DPR clamped to 2, paused off-screen via
IntersectionObserver and on `visibilitychange`. Only `transform` and `opacity` animate. Below
1024px or on a coarse pointer: no parallax, particle counts halved. Two missed frame budgets in
a row and the ambient layer drops to its static fallback permanently — no retry loop.
