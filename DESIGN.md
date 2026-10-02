# SAYLESS --- Design Direction

> **Working brand name:** SAYLESS\
> **Status:** Creative direction / naming is not yet legally or
> commercially cleared.\
> **Product:** A private anonymous letter experience for sending a
> beautiful message directly to someone's inbox.

------------------------------------------------------------------------

## 1. Product North Star

SAYLESS is not an anonymous-messaging app, a greeting-card site, or a
SaaS product.

It is a **digital letter ritual**.

The writer arrives with something they have not been able to say out
loud. They choose a feeling, write the message, and send it without
attaching their name.

The recipient receives something that feels like a real letter rather
than an automated notification.

The landing page therefore has one primary job:

> **Make the visitor feel the letter before asking them to write one.**

The first impression should communicate:

-   intimacy
-   sincerity
-   curiosity
-   calm
-   tactility
-   privacy
-   emotional weight

The product should feel like a beautifully made physical object
translated into a digital experience.

------------------------------------------------------------------------

# 2. Brand Personality

### The brand should feel

-   Quiet
-   Human
-   Contemporary
-   Tactile
-   Intimate
-   Slightly mysterious
-   Premium without feeling luxurious
-   Emotional without becoming sentimental

### The brand should not feel

-   Like a generic SaaS landing page
-   Like an anonymous confession app
-   Like NGL / Sendit / Tellonym
-   Like a wedding invitation
-   Like a flower shop
-   Like a greeting-card/e-card website
-   Like a scrapbook
-   Like a Valentine's Day campaign
-   Like a dark hacker/anonymity product
-   Like a template marketplace

The emotional register is:

> **A private letter left on a desk.**

Not:

> **A website selling anonymous messages.**

------------------------------------------------------------------------

# 3. Visual Principle

## The feeling is the feature.

The interface should not explain the emotion through excessive
decoration.

The visual language should come from a small number of believable
physical objects:

-   envelopes
-   actual paper
-   handwritten pages
-   petals
-   flowers
-   stamps
-   wax seals
-   small paper fragments
-   subtle shadows
-   photographed stationery

Every decorative object must earn its place.

If an element does not reinforce the idea of a physical letter, remove
it.

------------------------------------------------------------------------

# 4. Hero Direction

The hero should be redesigned completely rather than patched from the
previous composition.

## Hero concept

### Headline

# For the things

# you couldn't say

# out loud.

### Supporting copy

> Write a private letter to someone.\
> We'll deliver it without your name.

### Primary CTA

**Write a letter →**

### Reassurance

**No account · No signature · No saved email**

The headline creates the emotional reason to use the product.

The supporting copy explains what the product does.

The CTA is the only primary action.

------------------------------------------------------------------------

# 5. Hero Composition

The hero should feel like one continuous editorial scene rather than a
collection of floating website decorations.

### Desktop composition

``` text
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  SAYLESS                 Moods   How it works   Privacy      │
│                                                     [Write]  │
│                                                              │
│                                                              │
│             FOR THE THINGS                                   │
│             YOU COULDN'T SAY          [REAL LETTER /         │
│             OUT LOUD.                    ENVELOPE IMAGE]      │
│                                                              │
│             Write a private letter                           │
│             to someone. We'll deliver                        │
│             it without your name.                            │
│                                                              │
│             [ Write a letter → ]                             │
│                                                              │
│             No account · No signature · No saved email       │
│                                                              │
│                         Scroll to explore                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

The generated hero reference should be treated as an art-direction
reference, not as a final flattened website background.

## Composition rules

-   The headline is the primary visual element.
-   The letter/envelope is the primary physical object.
-   Supporting objects remain secondary.
-   Large areas of calm negative space are intentional.
-   Do not surround the headline with many unrelated objects.
-   Do not repeat the same decorative motif in every corner.
-   Do not use a second large visual competing with the letter.
-   The hero should look composed, not decorated.

------------------------------------------------------------------------

# 6. Typography

## Primary display font

### Chubbo Bold

Use for:

-   hero headline
-   major section headings
-   important short statements
-   brand wordmark where appropriate

Chubbo should provide the personality of the brand.

It is deliberately less formal than a luxury editorial serif and should
make the product feel contemporary and human.

## Supporting font

### Supreme Regular

Use for:

-   body copy
-   navigation
-   buttons
-   captions
-   privacy copy
-   metadata
-   supporting labels

Use Supreme Regular as the default reading typeface.

Use heavier Supreme weights only where necessary for UI hierarchy.

## Typography rule

Do not introduce a third decorative typeface just to make the page feel
romantic.

Handwriting should exist only inside photographed/scanned letter assets.

Do not use handwriting as a generic CSS font for navigation, headings,
or body copy.

------------------------------------------------------------------------

# 7. Typography Hierarchy

The typography should feel confident but not loud.

### Hero

Chubbo Bold\
Large\
Tight line-height\
Short line lengths

### Supporting copy

Supreme Regular\
Comfortable line-height\
Maximum readable width

### CTA

Supreme medium/bold

### Microcopy

Supreme Regular\
Muted ink color

Avoid excessive uppercase labels and excessive letter spacing.

The brand should not fall into the default "editorial website" formula
of:

-   giant serif
-   tiny uppercase mono label
-   hairline divider
-   italic caption

The typography itself is enough.

------------------------------------------------------------------------

# 8. Color System

Use a warm, restrained palette.

``` css
:root {
  --paper: #F7F2EA;
  --paper-warm: #EFE4DA;

  --ink: #171514;
  --ink-soft: #403B37;
  --muted: #756D67;

  --rose: #B94A5D;
  --rose-deep: #963746;
  --blush: #E9B9BE;

  --paper-white: #FFFDFC;

  --line: rgba(23, 21, 20, 0.12);
}
```

### Rules

-   Ivory is the primary environment.
-   Ink is the primary text color.
-   Rose is the action color.
-   Blush is an atmospheric accent.
-   Do not make the whole website pink.
-   Do not use purple gradients.
-   Do not use neon colors.
-   Do not use heavy black sections except inside individual mood rooms
    where intentional.
-   Avoid excessive shadows and glassmorphism.

The color system should feel like paper, ink and a physical rose rather
than a digital UI theme.

------------------------------------------------------------------------

# 9. Physical Image Direction

## IMPORTANT

### Do not create letters/envelopes using CSS geometric shapes.

Do not use:

-   CSS rectangles pretending to be paper
-   CSS triangles pretending to be envelope flaps
-   gradients pretending to be paper
-   generic `<div>` cards styled to resemble envelopes
-   SVG geometric substitutes for photographic stationery

The letter is the emotional centerpiece of the product.

It needs to have physical credibility.

## Use real image assets

Use high-quality transparent PNG/WebP assets for physical objects.

Examples:

-   photographed envelope with transparent background
-   photographed open letter with transparent background
-   real wax seal
-   individual flower stems
-   individual petals
-   torn paper fragments
-   stamps
-   pressed flowers
-   small handwritten note fragments

Assets should be isolated from their original background so they can be
layered naturally over the page.

### Asset characteristics

Prefer:

-   natural shadows
-   realistic paper texture
-   subtle imperfections
-   photographed surfaces
-   believable folds
-   soft edges
-   high resolution
-   transparent backgrounds

Avoid:

-   obvious stock-photo composites
-   overly glossy 3D renders
-   cartoon illustrations
-   perfectly geometric objects
-   overly saturated flowers
-   fake CSS shadows that make physical assets look pasted onto the page

------------------------------------------------------------------------

# 10. Image Layering

Physical objects should overlap naturally.

Example:

``` text
background
    ↓
paper texture
    ↓
soft photographic shadow
    ↓
letter/envelope
    ↓
flower stem
    ↓
petal
    ↓
small paper note
```

The objects should feel like they occupy the same physical surface.

Use natural shadows contained inside the PNG assets where possible.

Do not create huge generic `box-shadow` values around every object.

------------------------------------------------------------------------

# 11. Hero Object

The hero's main physical object should be a **real photographed envelope
or letter PNG**.

It should not look like a UI card.

The preferred visual:

-   blush or warm ivory envelope
-   visible paper texture
-   slightly imperfect edges
-   realistic fold
-   wax seal where appropriate
-   natural photographic shadow
-   a partially visible handwritten letter
-   subtle botanical detail

The object can be oversized and partially cropped by the viewport.

This makes the page feel like a physical composition rather than a
standard web layout.

------------------------------------------------------------------------

# 12. Hero Decoration

Use restraint.

Recommended maximum:

-   1 main envelope/letter
-   1--2 flower elements
-   2--3 loose petals
-   1 small paper fragment or stamp

Do not use all of the following simultaneously:

-   flowers
-   pearls
-   polaroid
-   open book
-   envelope
-   multiple notes
-   multiple wax seals
-   floating particles
-   dotted grid
-   handwriting textures

The previous hero became visually crowded because every object was
competing for attention.

------------------------------------------------------------------------

# 13. Hero Animation

The hero should feel alive but calm.

## Initial load

The page should already be visually complete.

Do not hide the content while waiting for JavaScript.

Animation sequence:

1.  Background and typography are immediately present.
2.  Main letter asset gently settles into position.
3.  Secondary physical assets have tiny staggered opacity/position
    transitions.
4.  CTA becomes active.
5.  Nothing continuously bounces or floats.

### Motion character

Motion should feel like:

> paper settling on a desk

not:

> a SaaS dashboard loading.

------------------------------------------------------------------------

# 14. Signature Interaction

The website should have **one memorable physical gesture**.

### The letter opens.

When the user interacts with the main letter:

-   envelope moves naturally
-   flap opens
-   letter emerges
-   message becomes visible
-   transition leads naturally into the next experience

The animation must be skippable.

A tap, click, keyboard action, or scroll should never trap the user
inside the animation.

For reduced motion:

-   render the final open state
-   remove parallax
-   remove continuous movement
-   retain opacity/instant state transitions only where useful

------------------------------------------------------------------------

# 15. Seamless Hero → Page Transition

This is a core requirement.

## There must be NO visual cut between the hero and the next section.

The hero should not end with:

``` text
hero
──────────────
new background
──────────────
section 2
```

That creates the feeling of two separate webpages.

Instead, the next section should visually emerge from the same physical
scene.

### Transition concept

The hero's paper surface continues downward.

As the user scrolls:

-   the hero typography gradually moves out of focus
-   the physical letter remains visually connected
-   the paper texture continues
-   decorative elements drift naturally
-   the next section's content enters through the same environment
-   colors transition gradually
-   no hard horizontal divider appears

The user should feel like they are **moving across the same desk**, not
entering another webpage.

------------------------------------------------------------------------

# 16. Continuous Scroll Philosophy

The entire landing page should feel like one long physical composition.

Do not build every section as an isolated block.

Avoid:

``` text
Section
↓
hard background change
↓
Section
↓
hard background change
↓
Section
```

Prefer:

``` text
one continuous paper world

Hero
  ↓
letter continues
  ↓
moods appear around the letter
  ↓
letter becomes the writing experience
  ↓
letter gets sealed
  ↓
letter travels
  ↓
recipient opens it
```

Each section should feel like a new moment in the same story.

------------------------------------------------------------------------

# 17. Butter-Smooth Scrolling

Scrolling should feel exceptionally smooth, but not artificially slow.

### Requirements

-   Native browser scrolling should remain the baseline.
-   Use CSS transforms and opacity for visual transitions.
-   Avoid expensive scroll handlers.
-   Prefer `IntersectionObserver` for section-triggered animation.
-   Use `requestAnimationFrame` only where continuous animation
    genuinely requires it.
-   Avoid animating layout properties such as `top`, `left`, `width`,
    and `height` during scroll.
-   Prefer `transform` and `opacity`.
-   Avoid heavy scroll-jacking.
-   Do not hijack the user's natural wheel/touch behavior.
-   Do not force snap points on the main page.
-   Do not make the page feel like a slideshow.

The page should be smooth because the composition is well engineered,
not because scrolling has been replaced with a custom gimmick.

------------------------------------------------------------------------

# 18. Scroll Transitions

Each section should have a subtle entrance state.

Example:

``` css
.section-element {
  opacity: 0;
  transform: translateY(24px);
}

.section-element.is-visible {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 700ms cubic-bezier(0.23, 1, 0.32, 1),
    transform 700ms cubic-bezier(0.23, 1, 0.32, 1);
}
```

Do not animate every child independently.

Group related elements.

The user should perceive:

> one scene becoming another

rather than:

> 30 things individually animating.

------------------------------------------------------------------------

# 19. Section 2 --- Moods

Heading:

# Choose a feeling.

Supporting copy:

> Five rooms for five different ways of saying something.

Show the five templates as **physical stationery samples**, not generic
cards.

### Moods

-   Soft Bloom
-   Old Letter
-   Night Thought
-   Quiet Garden
-   Confetti Love

Each mood should have:

-   its own physical paper asset
-   its own palette
-   its own type treatment
-   one distinct visual gesture

Do not use identical rectangular cards.

------------------------------------------------------------------------

# 20. Mood Presentation

The mood section should feel like a desk containing five different
letters.

Possible interaction:

-   horizontal physical arrangement
-   slight overlapping
-   cards/letters at different rotations
-   realistic PNG objects
-   subtle hover movement
-   the selected mood comes forward
-   the surrounding objects become quieter

Do not turn the mood selector into a conventional SaaS card grid.

------------------------------------------------------------------------

# 21. Section 3 --- How It Works

Heading:

# Write it. Send it. Let it go.

Steps:

### Choose a mood

Pick the feeling you want the letter to carry.

### Write your message

Keep it honest, simple, and personal.

### Enter their email

The letter is delivered directly to their inbox.

### Stay anonymous

Your identity is not shown to the recipient.

The section should feel like the next page of a letter.

Avoid numbered SaaS feature cards.

------------------------------------------------------------------------

# 22. Section 4 --- Privacy

Heading:

# Anonymous means anonymous.

Copy:

> You don't need an account. Your name is never shown. The recipient's
> email is used for delivery and is not saved in the database.

Show the privacy promise visually.

Do not rely only on text.

Use:

-   a small physical privacy note
-   a sealed envelope
-   a crossed-out signature area
-   subtle paper marks

Privacy should feel like a property of the product, not a marketing
claim.

------------------------------------------------------------------------

# 23. Section 5 --- Recipient Experience

Heading:

# What they receive.

Subheading:

> A quiet email. A private link. A letter that opens like a moment.

Show a real letter asset.

The recipient experience should be visually distinct from the
landing-page shell while remaining part of the same brand world.

The letter can open with:

> Someone wrote this for you.

Then the message.

The recipient should feel curiosity first, followed by trust.

------------------------------------------------------------------------

# 24. Section 6 --- Use Cases

Heading:

# For the things that are hard to say.

Use editorial fragments instead of cards.

Examples:

-   A secret compliment
-   An apology
-   A thank-you
-   A confession
-   A birthday note
-   A message of encouragement

Arrange them like small pieces of paper around a larger physical letter.

Do not create a six-card grid.

------------------------------------------------------------------------

# 25. Final CTA

Heading:

# Some words deserve to be sent.

Supporting copy:

> Choose a feeling, write the letter, and let it go.

CTA:

**Write a letter →**

Visual:

Use one envelope or one small paper object.

Do not recreate the entire hero collage.

The final section should feel like the same letter has reached its final
destination.

------------------------------------------------------------------------

# 26. Brand Motion System

Motion should feel tactile.

### Use

-   soft paper settling
-   letter opening
-   subtle image drift
-   opacity fades
-   slow natural movement
-   slight physical rotation
-   gentle hover response
-   section-to-section continuity

### Avoid

-   bouncing
-   elastic UI animations
-   constant floating
-   spinning
-   excessive parallax
-   scroll-jacking
-   animated gradients
-   particle systems
-   repeated letter opening
-   animation on every element

------------------------------------------------------------------------

# 27. Motion Timing

``` css
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);

  --fast: 160ms;
  --medium: 300ms;
  --slow: 700ms;
  --scene: 1000ms;
}
```

Use:

-   `160ms` for button feedback
-   `300ms` for normal UI transitions
-   `700ms` for section reveals
-   `1000ms` or slightly longer for major physical scene transitions

Avoid making ordinary UI interactions feel slow.

------------------------------------------------------------------------

# 28. Reduced Motion

`prefers-reduced-motion` is a first-class rendering path.

When reduced motion is enabled:

-   remove parallax
-   remove continuous movement
-   remove large transforms
-   show the final state of letter-opening animations
-   retain readable opacity transitions where appropriate
-   never hide content waiting for animation

The page must remain completely usable without animation.

------------------------------------------------------------------------

# 29. Responsive Design

## Desktop

The hero can use a two-zone editorial composition:

-   typography on the left/center
-   physical letter scene on the right

The letter may extend beyond the viewport edges slightly.

## Tablet

Reduce object scale.

Keep the headline dominant.

Reduce the number of visible decorative assets.

## Mobile

Do not simply shrink the desktop composition.

Use:

``` text
SAYLESS

For the things
you couldn't say
out loud.

Supporting copy

[ Write a letter ]

physical envelope
partially entering the viewport

No account · No signature · No saved email
```

The hero object should appear underneath the copy and remain partially
cropped.

On mobile:

-   no parallax
-   no complex multi-object composition
-   no horizontal overflow
-   no scroll-jacking

------------------------------------------------------------------------

# 30. Accessibility

Follow WCAG 2.2 AA.

Requirements:

-   Body text minimum 4.5:1 contrast.
-   Large text/UI boundaries minimum 3:1 where applicable.
-   All decorative images use `alt=""` and `aria-hidden="true"`.
-   Important message content remains live DOM text.
-   Full keyboard navigation.
-   Visible focus states.
-   Touch targets minimum 44×44px.
-   All animation has a reduced-motion alternative.
-   The site remains readable with images disabled.
-   The site remains understandable without JavaScript.

------------------------------------------------------------------------

# 31. Image Asset Rules

Create an asset library instead of relying on one giant hero image.

Recommended asset folder:

``` text
/assets/letter-world/
  envelope-pink.png
  envelope-ivory.png
  letter-open.png
  letter-folded.png
  wax-seal.png
  petal-01.png
  petal-02.png
  flower-stem.png
  botanical-note.png
  paper-fragment-01.png
  paper-fragment-02.png
  stamp-flower.png
  handwritten-note.png
```

All physical objects should ideally be:

-   transparent PNG or WebP
-   high resolution
-   naturally photographed
-   individually positioned
-   reusable across sections

Do not flatten the entire hero into one background image.

The text must remain HTML/DOM.

------------------------------------------------------------------------

# 32. Implementation Architecture

Build the visual composition from independent layers.

``` text
Hero
 ├── HeroBackground
 ├── HeroNavigation
 ├── HeroCopy
 ├── HeroCTA
 ├── HeroLetterScene
 │    ├── EnvelopeImage
 │    ├── LetterImage
 │    ├── FlowerImage
 │    ├── PetalImages
 │    └── PaperFragments
 └── ScrollCue
```

This makes it possible to animate each physical layer without rebuilding
the whole hero.

------------------------------------------------------------------------

# 33. Important Implementation Rule

The generated hero artwork is an **art-direction reference**.

Do not use the generated image as the final hero background.

Recreate the composition using:

-   HTML text
-   transparent physical image assets
-   CSS positioning
-   CSS transforms
-   controlled motion

This ensures:

-   responsive typography
-   accessible text
-   SEO-friendly content
-   responsive layouts
-   smoother transitions
-   independent animation of physical objects

------------------------------------------------------------------------

# 34. Page Continuity

The background should not abruptly change between sections.

Use one continuous base:

``` css
body {
  background: var(--paper);
  color: var(--ink);
}
```

Sections can introduce subtle changes in paper tone, but they should
transition through gradients, image layers, or overlapping physical
objects rather than hard background cuts.

Example:

``` text
Hero ivory
   ↓
slightly warmer paper
   ↓
letter scene
   ↓
mood stationery
   ↓
quiet ivory
   ↓
recipient letter
   ↓
warm ivory CTA
```

The user should never feel that the page has "loaded another section."

------------------------------------------------------------------------

# 35. What Must Be Removed From the Existing Design

Remove:

-   large flower clusters in multiple corners
-   pearls
-   open book
-   excessive polaroid imagery
-   excessive torn-paper elements
-   prominent dotted grid
-   decorative handwriting floating behind the headline
-   generic card grids
-   hard section boundaries
-   CSS-generated envelope/letter shapes
-   excessive pink
-   unnecessary hero copy
-   competing visual focal points

The redesign should not be an accumulation of more decoration.

It should be a subtraction exercise.

------------------------------------------------------------------------

# 36. Final Art Direction

The final site should feel like:

> **A beautiful letter sitting quietly on a desk.**

The visitor notices the typography.

Then the letter.

Then the physical details.

Then the invitation to write.

Nothing should shout.

Nothing should bounce.

Nothing should look like a template.

The interface should make the visitor curious enough to open the letter.

------------------------------------------------------------------------

# 37. Final Hero Specification

### Brand

**SAYLESS**

### Hero headline

**For the things you couldn't say out loud.**

### Supporting copy

**Write a private letter to someone. We'll deliver it without your
name.**

### CTA

**Write a letter →**

### Trust line

**No account · No signature · No saved email**

### Main visual

**Real photographed envelope/letter PNG with transparent background.**

### Secondary visual

**One subtle botanical element and a few natural petals.**

### Primary interaction

**The letter opens.**

### Scroll behavior

**Native-feeling, butter-smooth continuous scrolling with no hard cuts
between scenes.**

### Core design principle

**One physical world, one emotional story, one memorable gesture per
screen.**

------------------------------------------------------------------------

# 38. Final Test

Before considering the landing page finished, ask:

### In 3 seconds:

Can someone understand that this is about sending a letter?

### In 5 seconds:

Does the page make them curious about what the letter experience feels
like?

### In 10 seconds:

Do they understand that the sender stays anonymous?

### While scrolling:

Does the website feel like one continuous physical scene?

### Visually:

Could the page be mistaken for a wedding site, flower shop,
anonymous-messaging app, or generic SaaS product?

If yes, simplify.

The goal is not to make the page more decorated.

The goal is to make the **letter more believable**.

## Implementation notes — shipped SAYLESS system

Recorded from `apps/web/src/sayless.css` and the shipped React components on 2026-10-02. The pinned brief above is preserved. The following YAML records observed implementation tokens; it is deliberately appended rather than inserted as frontmatter so the original brief remains intact. CSS remains the implementation source of truth. Extensions and component previews live in `.impeccable/design.json`; home composition lives in `.impeccable/surfaces/apps-web-home.md`.

```yaml
name: SAYLESS
description: A private letter left on a desk.
colors:
  paper: "#f7f2ea"
  paper-warm: "#efe4da"
  paper-white: "#fffdfc"
  ink: "#171514"
  ink-soft: "#403b37"
  muted: "#756d67"
  rose: "#b94a5d"
  rose-deep: "#963746"
  blush: "#e9b9be"
  line: "rgba(23, 21, 20, 0.12)"
  success: "#3f7357"
  error: "#a3304a"
typography:
  display:
    fontFamily: "Chubbo, Georgia, serif"
    fontSize: "clamp(3.5rem, 6.15vw, 5.65rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-.032em"
  headline:
    fontFamily: "Chubbo, Georgia, serif"
    fontSize: "clamp(2.5rem, 4.4vw, 4.25rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-.025em"
  body:
    fontFamily: "Supreme, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Supreme, sans-serif"
    fontSize: ".8rem"
    letterSpacing: "0"
rounded:
  control: "5px"
  sheet: "6px"
spacing:
  section: "100px"
  section-mobile: "72px"
  gutter: "56px"
  gutter-tablet: "36px"
  gutter-mobile: "20px"
components:
  button-primary:
    backgroundColor: "{colors.rose}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.control}"
    padding: "14px 25px"
  button-primary-hover:
    backgroundColor: "{colors.rose-deep}"
    textColor: "{colors.paper-white}"
  button-nav:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 17px"
  field:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  sheet:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.sheet}"
```

### Overview

**Creative North Star: "A private letter left on a desk."**

The shell is quiet, human, contemporary and tactile. One continuous ivory desk carries live type, photographed stationery and restrained rose controls. The object supplies material character; readable DOM text supplies the message.

**Key Characteristics:** continuous paper; headline-first hierarchy; real photographic objects; direct, skippable ceremony; distinct mood rooms.

### Colors

Rose carries primary actions, selected-state details and focus. Deep rose carries hover and text links. Paper, warm paper and white paper distinguish desk, subtle control states and writing surfaces; ink and soft ink carry content. Muted supports secondary interface copy. Blush is the text-selection fill. Success and error retain semantic feedback roles.

**The Paper Ink Rule.** Text on photographed paper uses ink or soft ink, including signatures and small supporting lines.

### Typography

The shell self-hosts Chubbo Bold (700) and Supreme (400/500/700). Chubbo leads headlines and the wordmark; Supreme carries body copy, controls and labels. Mood names and recipient rooms retain their individual established typefaces. Mobile hero display becomes `clamp(2.8rem, 9.8vw, 4.8rem)` with line height 1.09; below 360px it becomes `9.5vw`. Compose, success and state-page headings use `clamp(2.4rem, 4.7vw, 4.5rem)`.

### Layout

Navigation and hero cap at 1280px; home sections cap at 1160px. Desktop gutters are 56px, changing to 36px at 1100px and 20px at 760px. Home sections usually carry 100px vertical padding, changing to 72px on mobile. Mobile stacks the hero and paired sections, hides anchor navigation while retaining the write action, and lays out mood samples in two columns with the fifth centered.

### Elevation & Depth

Photographs supply material shadows. Interface depth stays soft: the writing sheet uses `--elev-sheet`; mood samples lift without adding card shadows. Controls move only in response to interaction. Native scrolling remains intact; the hero settles once and opens on request. Reduced motion exposes the final open letter and disables animation.

### Shapes

Controls have gently softened corners (5px); the writing sheet uses 6px. Mood samples have no surrounding card fill, border or rounded frame. Paper silhouettes and envelope folds come from photographs.

### Components

Primary write links use rose fill, white-paper text and a drawn SVG arrow. Hover deepens the fill and lifts 2px; focus uses a deep-rose 2px outline with 5px offset. Navigation uses a quiet outlined write link. Inputs use white paper, ink and a restrained border; focus deepens the border. The writing sheet retains its soft shadow and gains a visible outline on focus within. The mood picker is a keyboard radiogroup: arrows, Home and End move and select; selection adds an underline and check while lifting the sample. Recipient opening is one direct action with an optional Read without ceremony control. Animated reading exposes Read whole letter and accepts pointer or keyboard skipping.

### Do's and Don'ts

- **Do** keep messages as selectable live DOM text over photographed material.
- **Do** preserve the five mood identities and the writer's words when switching moods.
- **Do** provide visible focus, generous targets and a final-open reduced-motion path.
- **Don't** add looping motion, scroll hijacking or hard home-section background cuts.
- **Don't** synthesize physical envelope or paper geometry with CSS.

Verification: values and behavior were checked against `sayless.css`, `Home.tsx`, `EditorialHero.tsx`, `TactileLetter.tsx`, `TemplatePicker.tsx` and `index.html`. The independent final reviewer verdict is **ship**. Pre-existing PRODUCT.md retains the older AnonLetter product name; the existing prototype surface brief records its separate dark-house study. Neither is changed or promoted into this shell's visual rules.
