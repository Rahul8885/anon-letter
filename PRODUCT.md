# Product

## Register

brand

The landing page, the reveal page, and the five template rooms are the product. A person's
impression in the first half-second *is* the value being delivered — "the feeling is the feature."
The composer is the one product-register surface inside a brand-register house, and it is
deliberately styled as a letter rather than a dashboard.

## Users

Two people who never meet.

**The writer.** Has something they have not been able to say out loud — a confession, an apology,
a thank-you, a congratulation. They arrive carrying one sentence and a lot of hesitation. Context:
alone, often late, often on a phone, usually after re-reading a draft several times somewhere else
first. Job to be done: say the thing, beautifully, without their name on it, and then be released
from it. Success for them is the moment they can stop holding it.

**The reader.** Gets an email from nobody. Opens a link with no idea what is inside. Context:
inbox, mid-day, guard up — this could easily be spam or a prank. Job to be done: find out what
was said and who might have meant it. Success for them is believing the letter is sincere. Every
design decision on `/m/[slug]` is in service of that belief.

Neither has an account. Neither will read documentation. The product gets one shot at both.

## Product Purpose

Unsaid delivers a designed, anonymous letter to a stranger's inbox in under two minutes.

The recipient's email address is passed to the delivery provider and discarded — it is never
written to the database. That is not a feature bullet; it is the load-bearing promise, and the
interface has to make it feel true rather than merely claim it.

Success looks like: a letter that gets read to the end, and a writer who felt the send as an
ending rather than a form submission.

## Brand Personality

**Ceremonious. Sincere. Unhurried.**

The voice of a well-made object, not a service. It never sells, never congratulates itself, and
never uses an exclamation mark. It writes short declarative sentences in sentence case and trusts
silence. "It's out of your hands now." "Nothing about you was saved." "Sealed · unsigned."

Emotional goals, in order: **belief** (this is real and someone meant it), **calm** (nothing is
rushing you), **weight** (this cost the sender something). Delight is deliberately last — a letter
that is charming but not believed has failed.

## Anti-references

- **Greeting-card e-card sites** (JibJab, American Greetings). Cartoon motifs, bouncy typography,
  autoplay music, "Send a Smile!" copy. The single most dangerous adjacent category.
- **Anonymous-messaging apps** (NGL, Sendit, Tellonym). Neon gradients, meme energy, engagement
  loops. These read as bait, and their reputation is why the reader's guard is up.
- **SaaS landing-page grammar.** Hero metric + three feature cards + logo wall + gradient accent.
- **Halloween-gothic.** Wax seals and dark backgrounds can slide into costume-drama occult very
  easily. The register is a private letter, not a spell.
- **Editorial-magazine default.** Display serif + italic + hairline rules + tracked-out mono
  labels applied by reflex to every section. The shell earns its editorial register through the
  house/rooms structure; the rooms must not all repeat it.

## Design Principles

1. **The room is the message.** Five templates are not skins. Each is a different emotional
   register with its own palette, typeface, motif and single gesture. Switching moods must never
   re-mount or re-type the writer's words — the words are constant, the room changes around them.

2. **One memorable gesture per screen.** If a shader, a burst and a parallax all want the same
   page, two of them are wrong. Everything not carrying the gesture goes quiet.

3. **Objects earn belief; UI earns trust.** Photographic bitmap for anything meant to feel like it
   has weight and a surface (petals, wax, confetti, botanicals). Drawn vector for anything a person
   clicks or reads. The two never substitute for each other.

4. **The ceremony is never a hostage.** Any tap or key press skips to the resting state. Reduced
   motion renders the final frame of every asset. A person who cannot or will not wait still gets
   the whole letter.

5. **Privacy is shown, not claimed.** The composer never asks for anything it does not need, never
   offers to "save your draft to your account," and states what happens to the recipient's address
   at the moment it is typed — not in a footer.

## Accessibility & Inclusion

- **WCAG 2.2 AA.** Body text ≥4.5:1 in all five rooms and the shell; large text and UI boundaries
  ≥3:1. Template accents are never a text color on their own background — they carry objects
  (rules, seals, focus rings, petals) while text sits on the `text` and `muted` tokens.
- **`prefers-reduced-motion` is a first-class render path**, not a disabled animation. Each asset
  has a defined reduced state: envelope starts open, message appears whole with no typewriter,
  ambient fields render their resting frame.
- **The letter is readable with images off and JavaScript off.** All decorative bitmap is
  `alt=""` + `aria-hidden`; the message is always live DOM text.
- **Full keyboard path** through the composer, including the template picker (arrow keys move,
  space selects) and the swatch picker. Focus is visible on every interactive element, at 3:1
  against both the shell and every room.
- **Touch targets ≥44×44**, including the report control. Visually subtle is a color state, never
  a smaller hit area.
- **Motion sensitivity beyond the media query**: no parallax below 1024px or on coarse pointers,
  no infinite loops on the reading surface, confetti is a single burst with a hard 2.5s kill.
