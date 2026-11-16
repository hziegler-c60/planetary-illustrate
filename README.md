# Planetary Illustrate

## Project Description
This is a personal project about what I believe is my purpose is on this planet. It serves as both documentation and a reminder of the things that I can do to grow toward this ultimate purpose.

"to illustrate" is a personal, interactive web atlas. The site is styled as an antique naturalist's field guide. It opens on a dictionary entry for the word illustrate (from Latin illustrare, "to light up") set above a vintage engraving of an eye whose iris follows your cursor, framed by a hand-drawn eyelid. 
The word is split into five faculties, each with its own specimen page:
Knowledge — an open copy of Asimov's The Collapsing Universe whose page physically turns as you sweep across it
Creativity — an easel where your cursor becomes a brush: hover the palette to load a color, paint on the sheet, and the paint fades after 45 seconds
Observation — a naturalist's beetle plate with a working magnifying glass that enlarges whatever it passes over
Storytelling — a writing desk where a scroll unrolls on hover and one of your original poems surfaces word by word like invisible ink
Organization — a desktop where a stack of papers scatters across the wood on hover and gathers itself back when you leave
Each page pairs the interactive specimen with applicable vocations and five small daily practices.
## Run locally

```bash
npm install
npm run dev
```

Vite prints the local URL (typically `http://localhost:5173`).

## Build

```bash
npm run build
```

Outputs a static bundle to `dist/` that can be hosted on any static file
server (GitHub Pages, Netlify, S3, nginx, ...).

## Project layout

- `src/pages/` — Home (the atlas) and GiftDetail (each plate page)
- `src/components/` — interactive specimens (drawer, easel, telescope, ...)
- `src/data/` — copy and plate configuration per gift
- `src/assets/` — bundled images (imported in code)
- `public/plates/` — the plate artwork, served as static files
