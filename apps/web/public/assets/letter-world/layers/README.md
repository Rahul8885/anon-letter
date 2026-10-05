# Registered stationery layers

Generated with the built-in ImageGen tool, one independent call per component.
Production uses only WebP. Generation prompts and metadata were removed during cleanup.

Every asset is a 1200 x 800 transparent canvas, viewed perpendicular to the paper.
Generated RGB and alpha are preserved through registration/resizing and WebP export.
Registration uses the alpha >= 128 object bounds; a single affine transform maps those
bounds into the common frame. No painted repairs, paper patches, texture sampling or
runtime masks are involved. CSS clip-path divides only the separate closure images.

Coordinates are fractions of the full canvas, measured from its upper left:

| Component | Left | Top | Right | Bottom |
| --- | --- | --- | --- | --- |
| Back/interior | .05 | .10 | .95 | .90 |
| Pocket, except Night Thought | .05 | .10 | .95 | .90 |
| Night Thought pocket | .05 | .425 | .95 | .90 |
| Flap faces, except Garden/Night | .05 | .10 | .95 | .60 |
| Quiet Garden flap faces | .05 | .10 | .95 | .58 |
| Night Thought flap faces | .05 | .10 | .95 | .425 |
| Soft Bloom ribbon | .05 | .10 | .95 | .90 |
| Old Letter wax | .44 | .51 | .56 | .69 |
| Night Thought thread | .46 | .26 | .54 | .893 |
| Quiet Garden band | .57 | .10 | .73 | .90 |
| Confetti Love tape | .27 | .47 | .52 | .64 |

Both flap faces share the horizontal hinge at y=.10. Night Thought's button anchors
belong to the paper layers; only thread releases. Glassine appearance also uses a
subtle overlay opacity. Folded insert dimensions and hit areas live in stationeryAssets.ts.
The opened reading paper continues using ../letter-paper.webp.

Night Thought pocket was revised with ImageGen to remove diagonal seams, leaving a single
horizontal opening. Its original material, button anchor and gold star are preserved.
Reading stock and preview colors live in src/lib/letterPalette.ts; a native SVG color
matrix tones the existing paper photograph while retaining its texture and alpha.

All five original assembled photos remain used by home/mood selection; keep them.
