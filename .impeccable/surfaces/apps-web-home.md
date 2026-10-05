---
version: 1
slug: "apps-web-home"
primary_target: "apps/web/src/pages/Home.tsx"
related_targets:
  - "apps/web/src/sayless.css"
  - "apps/web/src/components/editorial/EditorialHero.tsx"
  - "apps/web/src/components/composer/TemplatePicker.tsx"
---

# SAYLESS home

Mode: **Persuade**. Target: `apps/web/src/pages/Home.tsx`, route `/`.
Visual authority: the user's pinned root `DESIGN.md` brief; implementation tokens are in its appended Implementation notes section. This is a code-led design, with no approved flattened composition or quality-bar cards.

## Surface thesis

Make the visitor feel the letter before asking them to write one. The first viewport leads with Chubbo display type, then a real envelope and one botanical on the continuous ivory desk. Rose directs the primary writing action.

## First viewport

Headline: **For the things / you couldn't say / out loud.**
Supporting copy: **Write a private letter to someone. We'll deliver it without your name.**
Primary action: **Write a letter →**, linking to `/compose`.
Reassurance: **No account · No signature · No saved email**.
Navigation: SAYLESS, Moods, How it works, Privacy and Write a letter. At 760px and below, the anchor navigation hides while the wordmark and write action remain.

One envelope gesture opens a live-text example. Closed and open photographs crossfade; a separate photograph of real paper raises with accessible HTML words. The one flower stem remains secondary. The headline retains its three-line structure. Reduced motion starts open.

## Scroll story

1. Five photographic mood envelopes under **Choose a feeling.** Selecting one changes the caption, recipient sample and draft mood used by Write in this mood.
2. **Write it. Send it. Let it go.** presents four direct steps: choose a mood, write, enter their email, stay anonymous.
3. **Anonymous means anonymous.** pairs concise privacy copy with an unsigned paper note.
4. **What they receive.** offers a direct `/m/demo-{mood}` preview and live sample words on photographed paper.
5. **For the things that are hard to say.** places six reasons on restrained paper fragments.
6. **Some words deserve to be sent.** repeats the write action. Footer remains quiet.

## Form and behavior

Desktop hero uses 55/45 columns within a 1280px cap. Home sections cap at 1160px and share one background. Mobile stacks content and scene with 20px gutters; mood samples become a two-column selection with the fifth centered. Native scroll, one settling entrance and local hover/open responses are the motion grammar. No autoplay opening or recurring bounce.

The mood picker uses radio semantics and roving focus; arrows, Home and End select. Photography remains decorative (`alt=""`, `aria-hidden`); captions, words and controls remain DOM. Focus and skip-to-content are visible. Composer and success inherit shell controls; recipient rooms preserve their mood palette/type while real paper retains ink text. Opening and typewriter reading can be skipped.

## Asset provenance and acceptance

Artwork usage and provenance: `apps/web/public/assets/letter-world/SOURCES.md`. Generation prompts and metadata were removed during cleanup. Mood samples: `soft-bloom.webp`, `old-letter.webp`, `night-thought.webp`, `quiet-garden.webp`, `confetti-love.webp`. Hero: `envelope-rose.webp`, `envelope-open.webp`, `letter-paper.webp`, `flower-stem.webp`.

This brief was verified against the final component/CSS sources, including the actual open-flap photograph and soft-ink text correction. Independent final reviewer verdict: **ship**. Product promises, delivery logic and drafts remain governed by existing product and application code.
