# Planetary Illustrate


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
