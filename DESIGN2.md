# AnonLetter Landing Page Design Direction

## Product Position

AnonLetter helps someone send a beautiful anonymous message directly to another person's inbox.

The landing page has one job: make visitors understand the product in the first three seconds and make them want to write a letter.

The page should feel like a romantic editorial cover, not a SaaS homepage. The visual world is paper, flowers, envelopes, handwritten notes, soft shadows, and dramatic typography.

## Core Message

Use this as the landing page's primary idea:

> Send anonymous letters to someone special.

This is clearer than leading with the product name. It explains the action, the anonymity, and the emotional target immediately.

## Visual North Star

Use the generated hero direction based on `call_NhIiSJIBMUvdsYXfTeYssz1H.png`:

- Ivory paper background
- Large dramatic black serif headline
- Blush pink envelope
- Pink lilies
- Pearl details
- Torn note paper
- Polaroid fragments
- Soft handwritten postal texture
- Dusty rose CTA button

The hero image should decide the rest of the landing page. Every section should feel like it belongs to the same stationery/editorial world.

## Brand Personality

AnonLetter should feel:

- Romantic, but not childish
- Anonymous, but not creepy
- Premium, but simple
- Emotional, but direct
- Soft, but readable

Avoid making it look like:

- A generic SaaS product
- A dark hacker anonymous tool
- A scrapbook craft page
- A wedding agency website
- A flower shop
- A template marketplace

## Typography

### Display Font

Use `Bodoni Moda` for the main hero headline.

Why:

- It is closest to the first moodboard's dramatic luxury serif feeling.
- It has high contrast, editorial elegance, and romantic presence.
- It can carry the entire first impression.

Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500;6..96,600;6..96,700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

CSS:

```css
--font-display: "Bodoni Moda", "Didot", "Bodoni 72", serif;
--font-body: "DM Sans", system-ui, sans-serif;
```

### Supporting Font

Use `DM Sans` for:

- Tagline
- CTA
- Navigation
- Trust text
- Body copy
- Form labels

This keeps the page readable and modern while the headline stays expressive.

## Color System

Use a restrained palette pulled from the hero image.

```css
:root {
  --paper: #f8f1ea;
  --paper-warm: #efe3da;
  --ink: #171313;
  --rose: #c94f66;
  --rose-deep: #9f283d;
  --blush: #edb9c0;
  --pearl: #d8cec5;
  --muted: #6d5b57;
  --line: rgba(23, 19, 19, 0.12);
}
```

### Usage

- Background: `--paper`
- Main text: `--ink`
- CTA: `--rose` or `--rose-deep`
- Soft section backgrounds: `--paper-warm`
- Decorative accents: `--blush`
- Muted text: `--muted`
- Borders and dividers: `--line`

Do not use purple gradients, neon accents, blue SaaS colors, or heavy black sections on the landing page.

## Hero Section

The hero is the entire identity. It should feel like a magazine cover for a secret letter.

### Layout

Desktop:

```text
--------------------------------------------------
| small nav/logo                                  |
|                                                |
|  [collage object]      HEADLINE      [envelope] |
|                    HEADLINE LINE 2              |
|                                                |
|                    tagline                      |
|                    [ CTA ]                      |
|                    trust line                   |
|                                                |
| [flower]                              [note]    |
--------------------------------------------------
```

Mobile:

```text
-------------------------
| AnonLetter            |
|                       |
| Send anonymous        |
| letters to someone    |
| special               |
|                       |
| tagline               |
| [Write a letter]      |
| trust line            |
|                       |
| cropped envelope/     |
| flower collage        |
-------------------------
```

### Hero Copy

Headline:

```text
Send anonymous letters to someone special
```

Tagline:

```text
Pick a mood, write your message, and deliver it straight to their inbox.
```

CTA:

```text
Write a letter
```

Trust line:

```text
No account. No sender name. Recipient email never stored.
```

### Hero Visual Rules

- The headline must be the largest object on screen.
- The product name should not be the main headline.
- Keep the text centered and highly readable.
- Decorative collage items should frame the headline, not fight it.
- Use only one primary CTA.
- Do not put a stats strip in the hero.
- Do not add many explanatory paragraphs.

## Landing Page Sections

### 1. Hero

Purpose: Explain the product instantly and create emotional attraction.

Content:

```text
Send anonymous letters to someone special
Pick a mood, write your message, and deliver it straight to their inbox.
Write a letter
No account. No sender name. Recipient email never stored.
```

### 2. Template Moods

Purpose: Show that users do not start from a blank page.

Heading:

```text
Pick the mood. Write the message.
```

Subheading:

```text
Five letter styles help your words feel right before you even start writing.
```

Template cards:

```text
Soft Bloom
For admiration, appreciation, and gentle confessions.

Old Letter
For apologies, gratitude, and words that need to feel timeless.

Night Thought
For late-night truths you could not say out loud.

Quiet Garden
For encouragement, birthdays, pride, and soft support.

Confetti Love
For celebration, joy, hype, and loud affection.
```

Design:

- Use five horizontal editorial swatches or mini letter covers.
- Do not make them generic icon cards.
- Each card should look like a small stationery sample.
- On hover, reveal a short line of copy and a tiny "Use this mood" action.

### 3. How It Works

Purpose: Make the flow feel effortless.

Heading:

```text
Send one in under two minutes.
```

Steps:

```text
Choose a mood
Pick the feeling you want the letter to carry.

Write your message
Keep it honest, simple, and under 800 characters.

Enter their email
We send the letter directly to their inbox.

Stay anonymous
They can read it, but they will not know who sent it.
```

Design:

- Use a simple vertical flow.
- Numbers are allowed here because this is an actual sequence.
- Style each step like a line on a letter, not like a SaaS process card.

### 4. Privacy Promise

Purpose: Remove the biggest concern.

Heading:

```text
Anonymous means anonymous.
```

Body:

```text
You do not need an account. Your name is never shown. The recipient email is used only for delivery and is not saved in the database.
```

Bullets:

```text
No account required
No sender identity shown
Recipient email never stored
Letters expire automatically
```

Design:

- Keep this section quiet and serious.
- Use darker ink and less decoration.
- A small lock icon is acceptable, but do not turn the section into cybersecurity branding.

### 5. Recipient Preview

Purpose: Show the emotional payoff.

Heading:

```text
What they receive
```

Subheading:

```text
A quiet email. A private link. A letter that opens like a moment.
```

Preview letter:

```text
Someone wrote this for you.

They stayed anonymous, but the message was meant for you. Open it when you are ready.
```

Design:

- Show a rendered letter preview.
- Use the Night Thought template for contrast, but present it inside the same brand world.
- Animate the letter opening only once when it scrolls into view.

### 6. Use Cases

Purpose: Help users recognize themselves.

Heading:

```text
For the things that are hard to say.
```

Items:

```text
A secret compliment
Tell someone what you admire without making it about you.

An apology
Say the thing clearly, softly, and without pressure.

A thank-you
Let someone know their kindness mattered.

A confession
Send the truth when saying it face to face feels impossible.

A birthday note
Make it feel personal, even from the shadows.
```

Design:

- Avoid identical card grids.
- Use a loose editorial list, like captions around a collage.
- Each item can be paired with a tiny torn-paper label.

### 7. Final CTA

Purpose: Repeat the action after trust and desire are established.

Heading:

```text
Say it beautifully. Stay anonymous.
```

Subheading:

```text
Choose a mood, write the letter, and we will deliver it.
```

CTA:

```text
Write your letter
```

Small line:

```text
Free to use. No account needed. Open source.
```

Design:

- Return to the hero's ivory/blush world.
- Use a large display line, but smaller than the hero headline.
- Add one envelope or flower detail, not a full collage again.

## Theme System

The landing page brand is the parent world. The five message themes are children inside it.

The landing page should stay ivory, blush, black ink, and dusty rose. The themes can introduce their own colors only inside previews, template cards, and the composer.

### Global Brand Theme

Use for:

- Landing page
- Navigation
- Home CTA
- Footer
- General marketing copy

Look:

- Ivory paper
- Blush stationery
- Black editorial type
- Dusty rose buttons
- Soft collage shadows

### Soft Bloom

Mood:

- Gentle
- Admiring
- Romantic
- Soft confession

Colors:

```css
--soft-bloom-bg: #fdf0f5;
--soft-bloom-accent: #f0a0ba;
--soft-bloom-text: #4a2030;
```

Landing use:

- Template card can show pressed petals and soft pink paper.
- Do not make the full landing page pink.

### Old Letter

Mood:

- Honest
- Apologetic
- Timeless
- Nostalgic

Colors:

```css
--old-letter-bg: #fdf6ec;
--old-letter-accent: #c4976a;
--old-letter-text: #3a2410;
```

Landing use:

- Template card can use torn paper, sepia lines, and typewriter marks.
- Keep it refined, not pirate-map parchment.

### Night Thought

Mood:

- Confessional
- Late-night
- Intimate
- Serious

Colors:

```css
--night-bg: #1a1b2e;
--night-accent: #8b90d0;
--night-text: #c8caf0;
```

Landing use:

- Use this in the recipient preview section for contrast.
- It should feel like the letter opens into another emotional room.
- Do not let the whole landing page become dark.

### Quiet Garden

Mood:

- Supportive
- Proud
- Grateful
- Grounded

Colors:

```css
--garden-bg: #eaf7f0;
--garden-accent: #3b6d11;
--garden-text: #1a3208;
```

Landing use:

- Template card can use botanical linework and sage paper.
- Avoid heavy green blocks on the landing page.

### Confetti Love

Mood:

- Celebratory
- Excited
- Loud
- Joyful

Colors:

```css
--confetti-bg: #fff8e7;
--confetti-accent: #e8c99a;
--confetti-text: #4a3010;
```

Landing use:

- Template card can include small paper confetti pieces.
- This is the only theme allowed to feel more animated.
- Keep it contained so it does not break the premium mood.

## Components

### Primary Button

Text:

```text
Write a letter
```

Style:

- Dusty rose background
- Ivory or white text
- Border radius: 8px or pill
- Font: `DM Sans`, 600
- Subtle press scale: `scale(0.97)`
- Hover: slightly deeper rose

CSS direction:

```css
.button-primary {
  background: #c94f66;
  color: #fff8f5;
  border-radius: 8px;
  padding: 14px 28px;
  font-family: var(--font-body);
  font-weight: 700;
  letter-spacing: 0.01em;
  transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background 180ms ease;
}

.button-primary:active {
  transform: scale(0.97);
}
```

### Template Cards

Should feel like physical mood samples:

- Paper texture
- Small motif
- Template name in serif
- Short use-case line
- Color from template palette

Avoid:

- Generic icons
- Same-size SaaS cards with shadows
- Heavy borders
- Too much text

### Footer

Keep it minimal.

Content:

```text
AnonLetter
Open source
No accounts
MIT License
```

Do not overdesign the footer.

## Motion Direction

Motion should feel like paper, not software.

Use:

- Subtle hero collage drift on load
- Headline fade/slide in once
- Button press feedback
- Template card hover lift
- Letter preview opening once on scroll

Avoid:

- Constant parallax everywhere
- Bouncy effects
- Spinning elements
- Animating every section
- Slow interactions

Durations:

```css
--fast: 160ms;
--medium: 220ms;
--slow: 700ms;
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
```

Reduced motion:

- Keep content visible by default.
- Replace movement with opacity fades.
- Do not hide content waiting for JavaScript animation.

## Implementation Notes

### Home Page

Change `Home.tsx` so the hero uses the new content:

```text
Send anonymous letters to someone special
Pick a mood, write your message, and deliver it straight to their inbox.
Write a letter
No account. No sender name. Recipient email never stored.
```

The product wordmark can remain in the nav, but it should not compete with the headline.

### CSS

Update global fonts:

```css
body {
  font-family: "DM Sans", system-ui, sans-serif;
}

h1,
.display {
  font-family: "Bodoni Moda", "Didot", serif;
}
```

Replace the current dark landing page base with the new ivory editorial base.

Keep dark styling only for:

- Night Thought template
- Recipient message page
- Small preview moments

### Assets

Use the generated hero image as reference, not necessarily as a fixed background forever.

Best implementation path:

1. Build the hero layout in HTML/CSS so text stays crisp and editable.
2. Recreate collage objects as positioned image assets or CSS background layers.
3. Use the generated image as a visual target for spacing, palette, and object placement.

Do not bake important headline text into a background image for the final website if SEO and responsiveness matter.

## Design Risks

### Risk: Too Decorative

If the page becomes too floral, it will look like a wedding site.

Fix:

- Keep most sections clean.
- Use floral/collage elements only in hero, template cards, and final CTA.

### Risk: Headline Becomes Hard To Read

Decorative fonts can become illegible.

Fix:

- Use `Bodoni Moda` instead of a pure script font.
- Keep the headline large and high contrast.
- Avoid putting objects behind the words.

### Risk: Anonymous Feels Suspicious

Anonymity can feel unsafe if the tone gets too dark.

Fix:

- Use warm paper and gentle copy.
- Emphasize privacy, not secrecy.
- Include report/expiry safety in product flow.

## Final Direction Summary

The landing page should feel like opening a beautiful anonymous note on a desk: ivory paper, blush envelope, lilies, pearls, black editorial type, and one clear promise.

The hero should say exactly what the product does:

```text
Send anonymous letters to someone special
```

Everything else should support that promise with clarity, trust, and emotional appeal.
