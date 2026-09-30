# Quoc Huy portfolio (HTML + CSS + JS)

Static clone of the Figma file **GT 1 Portfolio** (`KvhHmfArCYpU6KRGgo9fJI`). No build step, no framework.

## 1. Get the images (required, one time)
The photos, logos and thumbnails live in Figma and could not be copied into this zip. Until they are present,
each slot shows a dark green placeholder and the layout is otherwise complete.

```bash
FIGMA_TOKEN=figd_xxxxxxxx node scripts/fetch-figma-assets.mjs
```
Token: Figma > Settings > Security > Personal access tokens (scope: File content, read). Node 18+.
The script reads `assets/manifest.json` (73 images: node id, format, scale) and writes into `assets/`.
Filenames are node ids, e.g. `8-4086.jpg` is the hero background (node 8:4086).

## 2. Run
Any static server works (fonts and asset paths are relative):
```bash
npx serve .        # or: python3 -m http.server 8080
```

## Files
| Path | Purpose |
|---|---|
| `index.html` | All markup. Layout values are inline design px (`--x --y --w --h`). |
| `css/styles.src.css` | Editable source. Uses `u(24)` tokens (= 24px at 1920 wide, scales with viewport). |
| `css/styles.css` | Generated. Run `python3 scripts/build-css.py` after editing the source. |
| `js/main.js` | Logo/badge text fallback, tab smooth-scroll, lazy image loading. |
| `assets/person2.png` | Hero person layer (transparent, 4x). `assets/person3.png` is no longer used. |
| `fonts/` | Bebas Neue, Urbanist, Shippori Mincho (Latin subsets, OFL). |

## Hero composition
One `.stage` frame (`--H:2506`, 1920 wide):

1. **TV artwork** — `assets/hero.png` filling the whole stage (`.hero-bg`, pinned `top:0;bottom:0`,
   `background-size:cover` crops a little off the sides). There is no heading text over it.
2. **Person layer** — `assets/person2.png` (7680x4424, i.e. 4x) in a 1920x1106 box pinned to the
   bottom of the stage (`top:auto;bottom:0`, no `--y`), i.e. the lower 1106px of the section, so the
   person composite reads as the bottom of the forest artwork.
   This alpha export already contains the whole reference hero foreground: the cut-out portrait,
   the ghost "SAJIBUL" / "ISLAM" name, the "Video Editor" and "5+ years" lime pills, the white
   selection frame with lime handles, the lime cursor and the bottom fade. It is used as one
   layer, so those parts are not duplicated in the markup (they would otherwise sit on top of
   themselves).
3. **Name rule** — the white rule + "Sajibul islam portfolio" pill (`.name-rule`, `--y:2411`),
   the only part of that stack that is markup.

The page texture (`assets/backgroud-tile.jpg`) is still set on the hero as the fallback behind the
artwork, and the `.cred-fade` gradient softens the join from the artwork into the Tools row.
The name / role text is intentionally screen-reader only (`h1.sr-only`).

## Responsive
- **1025px and up:** pixel-proportional to the 1920 Figma frames (verified at 1280, 1920, 2560).
- **1024px and down:** flow-layout stub so nothing breaks. Replace it with your tablet/mobile designs
  (the block at the bottom of `styles.src.css`).

## Known differences from the Figma file
1. **Hero "PORTFOLIO" overlap.** In Figma the TV photo covers parts of the letters (a vector subtract).
   Here the letters sit fully in front. Fix: export the TV/foliage as a transparent PNG and layer it above the title.
2. **Title speckle** is an SVG noise filter, not the original 4,000-vector texture.
3. **Copy I could not read from Figma** (Figma tool quota ended). Marked `data-verify-copy` in `index.html`:
   Etsuko / Pigeon / Verites / Luvmier description lines, and the caption + brand label on cards other than the first four.
4. **Second and third tab bars** in Figma read "Short video | Short video | Photography" and "Short video | Photography | Photography".
   I used "Motion Graphic | Short video | Photography" everywhere.
5. Text kept as designed even where it looks like placeholder: third skills column says "Project type / 90%";
   "Ho Chi Ming City"; "Chat GPT (Tao hin)".
6. Two thumbnails per big video slot are stacked at the same position in Figma; both are included.
