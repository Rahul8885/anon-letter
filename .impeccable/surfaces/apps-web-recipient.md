# Recipient opening

The sender’s full preview and /m/:slug share TactileLetter.

1. Release the photographed closure: ribbon, wax, thread, glassine band, or tape.
2. Click the envelope to lift its flap. A folded letter peeks out of the pocket.
3. Click the exposed letter to draw it out and unfold the paper. The envelope moves aside and fades.

Each step waits for a new click or keyboard activation. Closure targets are at least 44px.
Keyboard focus follows closure → envelope → exposed letter → reading. Visible text controls
provide the same sequence. Read without ceremony and Escape reveal the complete letter
immediately; Read now interrupts unfolding. Preview replay starts sealed and preserves the draft.

The implementation cuts and restores the existing WebP photos into in-memory canvas layers.
No new animation images or PNG frames are shipped. Layers are capped at 720px wide and
the cache holds at most two moods. The live message remains selectable DOM text.
Reduced motion starts at the fully readable letter and also responds to preference changes.

Verification: all five themes at 1440px and 390px; keyboard, touch, immediate skip,
interruptible unfolding, preview replay, draft preservation, reduced motion, live media
changes, and canvas failure. See checks.json in review/interactive-letter.
Unused source image duplicates and obsolete review captures were removed.
