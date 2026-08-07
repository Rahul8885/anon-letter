# AnonLetter — Design System Brief for Claude Design

> Paste this whole document into Claude Design as your opening prompt. Attach the 10 moodboard images alongside it (filenames referenced inline below) plus `anonletter-prototype.html` if you want it to see the existing shell code.

---

## 0. Your Role

You are acting as a **senior graphic + interactive designer** — the kind who leads visual identity for award-tracked digital studios (Awwwards SOTD / FWA territory), not a template generator. You think in typographic hierarchy, restrained motion, and emotional pacing before you think in components. Every decision should be justifiable: *why this typeface, why this exact shade, why this easing curve.*

Your job in this session is **not to build the product**. It's to produce a **design system** — a coherent visual and interaction language — that a frontend engineer can implement 1:1 in React + Tailwind + GSAP + Framer Motion. Think "design system deliverable," not "one-off landing page."

---

## 1. What AnonLetter Is

**One-line pitch:** Send someone a beautiful, anonymous letter in under 2 minutes — no account needed.

AnonLetter is an open-source, template-first anonymous messaging product. A sender picks one of five emotionally distinct **templates** (moods), writes a short message, and it's delivered straight to the recipient's inbox as a link to a cinematic, single-message web page. No accounts, no stored recipient data, no drag-and-drop builder — just five opinionated, beautifully art-directed moods.

**The core belief driving every design decision:** *the feeling is the feature.* This is not a utility. It's closer to a boutique stationery brand crossed with an interactive art piece. Restraint, texture, and pacing matter more than density of features.

**Two experiences to design for:**
1. **The sender's journey** — marketing/landing page → template picker → compose → send. Dark, editorial, confident, a little mysterious (anonymity as a design motif, not just a feature).
2. **The recipient's reveal** — the `/m/[slug]` page. This is the emotional apex of the entire product: a single letter, delivered like a cinematic unboxing. Each of the five templates re-skins this reveal sequence in its own palette and motif.

---

## 2. Moodboard — What's Attached and Why

I'm attaching 10 reference images pulled from my own saved inspiration. None of these are final — they're **directional signals**, each pulling one thread of the identity. Read all of them together, not individually, and extract the throughline: **romantic editorial typography, tactile/handmade texture, and confident dark-mode contrast, applied to an anonymous-letter product.**

| Ref | What to extract from it |
|---|---|
| **`Instagram.jpg`** (coquette moodboard: "Be Gentle With My Soul", "Cherry on Top", halftone eye, ribbon script) | The **coquette / soft-girl** register for our warmer templates (Soft Bloom, Confetti Love): halftone texture, looped cursive scripts layered over clean sans labels, pink-on-cream restraint — never twee, always a little editorial. |
| **`Royal_Avenue...jpg`** (serif display type specimens over oil-painting backdrops) | Reference for our **display serif voice**. We won't use these exact typefaces, but the *proportions* — bouncy ligatures, generous x-height, warm confidence — should inform how we treat Playfair Display / Cormorant Garamond as hero type. |
| **`download.jpg`** (letterpress wedding invite: "Capturing Romance and the Feeling of Being Wildly In Love") | This is close to our **Old Letter** template's soul: cream stock, hand-drawn line-art motif, restrained serif hierarchy, generous whitespace, a single script signature line at the bottom. |
| **`Vintage_Story...jpg`** (signature script on aged nautical map paper) | Texture reference for **Old Letter**: aged paper grain, sepia tone, a handwriting-style accent used sparingly (never as body text). |
| **`NOCTRA...jpg`** (dark editorial observatory site — "Constellations and Absence") | This is the **single most important reference for our dark shell and Night Thought template.** Small tracked-out uppercase labels, a single italic serif headline over a photographic/atmospheric hero, huge negative space, numbered sections (01 / 02), monochrome except for one warm off-white accent. This is the tone for the landing page chrome and the composer. |
| **`Design_simple_typography_1.jpg`** (Indonesian quote card on a garden wall photo) | Reference for **Quiet Garden**: type sitting confidently on top of real botanical texture, small caption-style metadata (date, handle) in a corner, nothing overdesigned. |
| **`Web_Design...jpg`** ("Maison de l'Amour" wedding-agency site, pink/red, oversized italic display) | Reference for scale: oversized display type as the hero *is* the design. Polaroid-style photo scatter at the bottom — a pattern we can borrow for a template gallery or testimonial strip. |
| **`No_pierdas_tiempo...jpg`** (torn-notebook-paper Instagram carousel, red bg, fabric-heart stickers) | Texture reference only: torn-paper edges, tape, stitched/fabric appliqué feel. Use *sparingly* as a motif for the Confetti Love template's playful register — not as a UI pattern. |
| **`Alexandra_Wark...jpg`** ("You're Invited" wax-seal envelope on dusty rose) | Direct reference for our **envelope + wax seal motif**, which is already the hero object on the landing page and the `/m/[slug]` reveal. Note the hand-drawn line icons (bow, cherries, bow-and-arrow) around the seal — same spirit as our botanical/confetti motifs. |
| **`Nowy_motyw...jpg`** (Polish "Riana" blog theme, peony photography, soft pink UI chrome) | What to **avoid**: this is generic feminine-blog territory — busy, stocky, over-decorated. Useful as a contrast reference for what "coquette" should *not* become when we execute Soft Bloom. |

**Synthesis:** The identity sits at the intersection of *NOCTRA's* editorial dark confidence and *download.jpg / Alexandra_Wark's* letterpress romance, with *Instagram.jpg's* coquette texture reserved for exactly one of the five template moods. The through-line across all five templates is **typographic restraint + one tactile motif + one memorable motion gesture** — never more.

---

## 3. Locked Constraints (do not redesign these — refine their execution)

The technical and palette foundations are already decided. Your job is to give them a real design system, not replace them.

**Stack the system must work within:** React 18 + Tailwind CSS + GSAP/ScrollTrigger + Framer Motion + Lenis smooth scroll. Design tokens should map cleanly to a `tailwind.config.ts` theme extension.

**Five template moods (palette + type is fixed; texture, spacing, motif execution, and component styling is yours to design):**

| Template | BG | Accent | Text | Display / Body type | Motif |
|---|---|---|---|---|---|
| Soft Bloom | `#fdf0f5` | `#f0a0ba` | `#4a2030` | Playfair Display italic / Lato 300 | Floating petals |
| Old Letter | `#fdf6ec` | `#c4976a` | `#3a2410` | Courier New / Georgia | Parchment grain, wax seal |
| Night Thought | `#1a1b2e` | `#8b90d0` | `#c8caf0` | Cormorant Garamond italic / DM Sans 300 | 3-layer parallax starfield |
| Quiet Garden | `#eaf7f0` | `#3B6D11` | `#1a3208` | Playfair Display italic / Inter 300 | Self-drawing botanical SVG line art |
| Confetti Love | `#fff8e7` | `#e8c99a` | `#4a3010` | Teko 700 / Rajdhani 400 | Physics-based confetti burst |

**Global shell (landing page, composer, chrome around all five templates):** dark void base `#0b0a08`, paper `#f2ede6`, gold `#c8a96e` / `#e2c99a`. Custom dot-and-ring cursor. This is already prototyped in `anonletter-prototype.html` — treat it as your dark-mode baseline, not a blank page.

**Motion philosophy already committed to (design *within* this, don't contradict it):**
- One memorable gesture per screen — everything else quiet.
- No hover effects on the letter body text itself; it's a letter, not a UI.
- No spinners — skeleton parchment lines instead.
- `prefers-reduced-motion` always has a real fallback, not just "disable everything."
- The recipient reveal sequence is sacred: stars/petals/dust drift in → envelope descends → wax seal dissolves → flap opens → letter rises → human-paced typewriter → "from: someone" resolves last.

---

## 4. What I Need You to Design

Produce a full design system, organized as the sections below. Where a decision is already locked in Section 3, your job is to specify *exactly how it looks and feels* — grain, shadow, corner radius, spacing rhythm, easing — not to pick a new hex code.

### 4.1 Foundations
- **Color:** full token set per template (bg/accent/text already given — add: surface, border, muted-text, success/error states, overlay/scrim opacity for the dark shell) plus the shared gold/void/paper shell tokens.
- **Type scale:** a modular scale for each template's display + body pairing (hero, h1–h3, body, caption, label/eyebrow), including letter-spacing rules for the small tracked-out uppercase labels (see NOCTRA reference).
- **Spacing & grid:** base unit, section rhythm for a long-scroll landing page, and the compose-flow's tighter step-by-step layout.
- **Elevation & texture:** how paper grain, parchment texture, and dark-mode glow/vignette are implemented as reusable tokens (not one-off CSS per template).
- **Iconography & line-art motif system:** a consistent hand-drawn/botanical line-icon language that can flex across Old Letter, Quiet Garden, and Confetti Love without feeling like three different icon sets.

### 4.2 Core Components (states: default / hover / active / focus / disabled)
- Primary & secondary buttons (dark shell version + one per template mood)
- Text input / textarea (the message composer field — this is the emotional centerpiece of Step 2, treat it like a real piece of stationery, not a generic textarea)
- Template picker card (the five-mood selection grid)
- Color/accent swatch picker
- Progress indicator for the 4-step composer
- Envelope object (landing hero + success page + reveal page — one object, three states: sealed / opening / open)
- Toast/inline error state (for rate-limit, validation)
- Report button (subtle, always present, never alarming)

### 4.3 Key Screens to Actually Mock Up
Prioritize these — I want visual mocks, not just tokens:
1. **Landing page hero** (dark shell, envelope motif, kinetic headline) — evolve `anonletter-prototype.html`, don't discard it.
2. **Template picker** (Step 1 of composer) — five moods must read as distinct at a glance while sharing one card grid system.
3. **Message composer** (Step 2) — the live-preview pairing between "what I'm typing" and "what it'll look like."
4. **The `/m/[slug]` reveal — one full mock per template mood** (all five, since palette/motif genuinely changes the page). Night Thought already has a coded prototype; use it as your fidelity bar for the other four.
5. **Success page** — envelope seal + share link.

### 4.4 Motion & Interaction Spec
For each key screen above, document: entrance sequence (ordered steps + rough timing), the one signature gesture, hover/idle micro-interactions, and scroll-triggered behavior. Write this so an engineer could translate it into GSAP timelines without guessing.

---

## 5. Tone Guardrails

- Confident restraint over decoration. If in doubt, remove an element rather than add one.
- Coquette/romantic texture (Instagram.jpg, No_pierdas_tiempo.jpg) is a **seasoning for one template**, not the house style — don't let it drift into `Nowy_motyw.jpg` territory (generic pink blog).
- The dark shell (NOCTRA-inspired) is the *brand voice*; the five template pages are *five distinct rooms inside that house*. Someone should recognize an AnonLetter screenshot even when the palette flips from navy to blush pink.
- Every texture (grain, parchment, stars, petals) must have a stated performance/accessibility fallback — this is a real product, not a one-off art piece.

---

## 6. Deliverable Format

Please output:
1. A written design-system document (tokens + rationale, organized per Section 4.1–4.2).
2. Visual mocks for the screens in Section 4.3.
3. A short motion spec per Section 4.4.

Ask me clarifying questions only if something in the locked spec (Section 3) is ambiguous — otherwise make and state the confident designer's call.
