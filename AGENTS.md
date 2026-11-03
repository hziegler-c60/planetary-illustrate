# AGENTS.md

## Project Context

This is a fully independent static website (React + Vite + Tailwind). Treat it
as user-owned application code, keep changes focused on the user's request,
and preserve existing project conventions.

There is no backend and no external service dependency: all artwork lives in
`public/plates/` and `src/assets/`. Do not add hosted-image URLs, SDKs, or
other runtime dependencies on outside services without asking first.

## Key Files

- `src/`: application source.
- `src/data/gifts.js`: the gifts and their plate artwork.
- `vite.config.js`: Vite config (React plugin + `@` alias to `src/`).

## Working Notes

- `npm run dev` for local development, `npm run build` for the static bundle.
- Run `npm run build` before finishing code changes to catch broken imports.
