# Code Guide — *to illustrate* (planetary-illustrate)

A complete walkthrough of how this site is built, with a deep focus on how every
motion effect works. Read top to bottom and you should be able to rebuild any
piece of it yourself.

---

## 1. What this site is

A static, fully self-contained website — no backend, no external services at
runtime. An antique naturalist's atlas: a home page with a 3D eye that follows
your cursor, and five "gift" pages (Knowledge, Creativity, Observation,
Storytelling, Organization), each with its own interactive specimen plate.

**Live site:** https://hziegler-c60.github.io/planetary-illustrate/
**Repo:** https://github.com/hziegler-c60/planetary-illustrate

### Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 18 + Vite | component model, instant dev server |
| Routing | react-router-dom v6 | two routes: `/` and `/gift/:giftId` |
| Styling | Tailwind CSS 3 + CSS variables | fast iteration, design tokens |
| Animation | framer-motion (page/label motion), hand-rolled rAF loops + CSS transitions/keyframes (specimens) | right tool per job — see §5 |
| 3D | three.js (the eyeball only) | one WebGL scene |
| Painting | raw `<canvas>` 2D API | pencil trail + paint dabs |
| Hosting | GitHub Pages (`gh-pages` branch) | free static hosting |

`package.json` lists many more dependencies (radix-ui, recharts, etc.) — those
are scaffold leftovers from the shadcn/ui template in `src/components/ui/`.
**Only a handful are actually used.** The files that matter:

```
src/
  App.jsx                      router + global pencil cursor
  pages/Home.jsx               the eye page
  pages/GiftDetail.jsx         shared template for all five gift pages
  components/
    PencilCursor.jsx           global pencil cursor + fading graphite trail
    Eye3D.jsx                  three.js eyeball that tracks the cursor
    Eyelid.jsx / AlmondClip.jsx  eyelid overlay + shared SVG clip path
    MagnifyingGlass.jsx        lens that magnifies the plate
    ObservationSpecimen.jsx    plate + telescope + magnifier wiring
    CreativitySpecimen.jsx     palette + brush + paint canvas
    StorytellingSpecimen.jsx   the unrolling scroll + ink-reveal poems
    OrganizationSpecimen.jsx   scatter/restack paper pile
    KnowledgeSpecimen.jsx      open book with a 3D turning page
  data/
    gifts.js                   the five gifts (names, images, vocations, practices)
    creativity.js              measured geometry + palette colours
    storytelling.js            scroll geometry + the poems
    organization.js            paper pile geometry
    knowledge.js               book geometry + the Asimov excerpt
    eyeOpening.js              traced SVG path of the eyelid opening
public/plates/                 all artwork (PNG, many with alpha)
```

---

## 2. Running, building, deploying

```bash
npm install        # once
npm run dev        # local dev server (Vite, hot reload)
npm run build      # production bundle into dist/
```

Two build details worth knowing:

- `vite.config.js` sets `base: '/planetary-illustrate/'` — required because
  GitHub Pages serves the site from that subpath. Every asset URL in the data
  files is built with `` `${import.meta.env.BASE_URL}plates/...` `` so paths
  work both locally and on Pages.
- The `build` script copies `dist/index.html` → `dist/404.html`. That's the
  standard trick for client-side routing on GitHub Pages: any deep link
  (e.g. `/gift/knowledge`) serves the app instead of a real 404.

Deploy = push the *contents* of `dist/` to the `gh-pages` branch. Source goes
to `main`.

---

## 3. The five mental models everything else uses

Before the motion, learn these five ideas — every specimen is built from them.

### 3.1 Fraction-of-the-plate coordinates

Every interactive region is stored as **fractions of the artwork**, never
pixels: `[x0, y0, x1, y1]` where `0.5` = halfway across the image.

```js
// src/data/creativity.js
export const CANVAS = [0.132, 0.203, 0.421, 0.574]; // the sheet on the easel
```

In the component, a region becomes an absolutely-positioned overlay:

```jsx
style={{
  left:   `${rect[0] * 100}%`,
  top:    `${rect[1] * 100}%`,
  width:  `${(rect[2] - rect[0]) * 100}%`,
  height: `${(rect[3] - rect[1]) * 100}%`,
}}
```

Because everything is proportional, the whole interaction scales perfectly
from a phone to a desktop with **zero media queries**. When you build your
own, you measure the artwork once (open it, hover, note pixel positions,
divide by width/height) and hard-code the fractions in a data file.

### 3.2 `cqw` — container query units

`1cqw` = 1% of the width of the nearest element with
`container-type: inline-size`. Every specimen plate sets
`[container-type:inline-size]` (Tailwind arbitrary property) on its root, then
sizes text, shadows, and stroke widths in `cqw`:

```jsx
style={{ fontSize: "2.05cqw", lineHeight: 1.5 }}
```

This is how the poem text and book text scale *with the artwork* instead of
with the viewport. Font size, drop shadows, even scatter distances all use it.

### 3.3 `mix-blend-mode: multiply` — making white paper disappear

Multiply blending computes `result = top × bottom` per channel. White (1.0) is
the identity: multiplying by white changes nothing. So a pencil drawing on
white paper, laid over the site's parchment background with
`mixBlendMode: "multiply"`, keeps only its graphite strokes — the paper
vanishes into the page. Used by:

- `Eyelid.jsx` — the eyelid drawing over the 3D eyeball
- `Eye3D.jsx` — the WebGL canvas itself, so the sphere's rendered "paper"
  drops away too
- `StorytellingSpecimen.jsx` — the poem text layer, so the ink soaks *into*
  the parchment grain instead of sitting on top of it

This one CSS property is responsible for most of the "it's all one real
engraving" illusion.

### 3.4 Pointer Events (not mouse events)

All interaction uses `onPointerMove / onPointerDown / onPointerEnter / ...`.
One API covers mouse, touch, and pen; `e.pointerType` tells them apart so each
specimen can give touch a different gesture (tap/drag instead of hover).
`setPointerCapture(e.pointerId)` keeps events flowing to your element even if
the finger drifts off it mid-drag.

### 3.5 State vs. refs — the 60fps rule

React state triggers a re-render. For things that change **every frame**
(cursor position, a trail of points), re-rendering 60×/s is wasteful and can
jank. The pattern used throughout:

- **Refs (`useRef`) + direct DOM style writes** for per-frame values:
  ```js
  brushRef.current.style.transform = `translate(${x}px, ${y}px)`;
  ```
  No re-render, no diffing — the browser just compositing a transform.
- **State (`useState`)** only for values that change the *structure* of what's
  shown (which poem, open vs. closed, scattered vs. stacked).
- **`requestAnimationFrame` (rAF)** when a value must be *interpolated* over
  time in JS (the page-turn settle, the eye's easing) rather than letting CSS
  handle it.

Keep this rule and everything stays smooth: *CSS transitions for state-to-state,
rAF for physics-y settling, direct style writes for per-frame tracking.*

---

## 4. The global layer

### 4.1 Router — `App.jsx`

Two routes, plus three global fixtures:

```jsx
<Router basename={import.meta.env.BASE_URL}>
  <ScrollToTop />          {/* resets scroll on navigation */}
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/gift/:giftId" element={<GiftDetail />} />
  </Routes>
  <PencilCursor />          {/* global custom cursor, above everything */}
</Router>
```

### 4.2 `PencilCursor.jsx` — cursor + fading graphite trail

A full-window fixed `<canvas>` (z-index 60) plus an SVG pencil tip (z-70),
with `document.body.style.cursor = "none"` to hide the native cursor.

How the trail works:

1. Every `mousemove` pushes `{x, y, t: performance.now()}` into a points array
   (throttled: only if moved > 1.5px; capped at 220 points).
2. A rAF render loop runs continuously: it drops points older than 1000ms,
   clears the canvas, and strokes polyline segments. Each segment's alpha and
   width are functions of **age**:
   ```js
   const age   = (now - p1.t) / 1000;              // 0 fresh → 1 gone
   const alpha = Math.max(0, 0.45 * (1 - age));    // fades out
   const width = Math.max(0.4, 2.4 * (1 - age));   // and thins out
   ```
   That's the whole "graphite that evaporates" effect — time-based decay
   redrawn every frame.
3. **Stroke lifting:** when the cursor crosses onto a plate (marked with
   `data-pencil-stop`) or the easel (`data-brush-cursor`), a `{brk: true}`
   marker is pushed and segments across the boundary are skipped — so the
   trail politely stops at artwork edges, and over the easel the pencil SVG
   itself hides (`opacity: 0`) because that page supplies its own brush.
4. Canvas resolution accounts for `devicePixelRatio` (crisp lines on retina):
   canvas backing store is `window.innerWidth * dpr`, then
   `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` lets all drawing code use CSS
   pixels.
5. Respects `prefers-reduced-motion` (no trail) and only activates on
   `(hover: hover) and (pointer: fine)` — touch devices keep their native
   behavior.

### 4.3 Page transitions — framer-motion

`GiftDetail.jsx` wraps the page in a `motion.div`:

```jsx
<motion.div
  initial={{ scale: 1.18, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
>
```

Navigating to a gift page "zooms into the plate" — the page starts 18%
enlarged and transparent, then settles. The cubic-bezier `[0.16, 1, 0.3, 1]`
is an aggressive ease-out (fast start, long gentle landing) used throughout
the site; it reads as "paper settling onto a desk."

On the home page, the five gift labels pop in with a **stagger** — each one's
delay is `0.2 + i * 0.08` seconds, so they ripple outward — and
`whileHover={{ scale: 1.08 }}` gives the magnetic-button feel.

---

## 5. The home page — a 3D eye that watches you

Three layers, back to front:

1. **`Eye3D.jsx`** — a WebGL sphere (three.js)
2. **`Eyelid.jsx`** — the drawn eyelid, multiply-blended over it
3. **`AlmondClip.jsx`** — a hidden SVG `<clipPath>` traced from the lid art

### 5.1 Mapping a flat drawing onto a sphere — `Eye3D.jsx`

The eyeball art is a square vintage engraving. To texture a sphere without
distortion, the code draws it into a 1024×512 canvas (the equirectangular
format three.js sphere textures expect), placing the drawing as a small
centered square so it lands exactly on the sphere's front cap:

```js
const c = document.createElement("canvas");  // 1024×512
ctx.fillStyle = "#efe9dc";                   // parchment back hemisphere
ctx.fillRect(0, 0, 1024, 512);
ctx.drawImage(img, dx, dy, 300, 300);        // drawing on the front cap only
const tex = new THREE.CanvasTexture(c);
```

The rest of the sphere is plain parchment — invisible anyway, because…

### 5.2 Clipping to the lid opening

The sphere's container has `clipPath: url(#eye-opening)` — an SVG path traced
once from the eyelid artwork (`src/data/eyeOpening.js`), defined with
`clipPathUnits="objectBoundingBox"` so it scales to any element size. The
eyeball only ever renders inside the almond-shaped lid gap. `Eyelid.jsx` then
"punches" the opening back to pure white *inside its own multiply layer*
(white × anything = no-op), so the lid's inner shading never darkens the
eyeball, and adds a hand-tuned vertical gradient as the lids' shadow falling
into the opening.

### 5.3 Cursor tracking with exponential easing (lerp)

This is the single most reusable motion trick in the project:

```js
const MAX = 0.12;  // radians (~7°) — the iris never leaves the opening

// on mousemove: store the TARGET rotation, clamped
target.current.x = clamp(dx, -1, 1) * MAX;

// in the rAF loop: ease the CURRENT value toward the target
const loop = () => {
  current.x += (target.x - current.x) * 0.08;   // ← the lerp
  sphere.rotation.y = current.x;
  renderer.render(scene, camera);
  raf = requestAnimationFrame(loop);
};
```

`current += (target - current) * 0.08` is an exponential approach: each frame
closes 8% of the remaining distance. Fast response, infinitely smooth
deceleration, zero libraries, no springs to tune. You'll see this same
`* 0.08` pattern again in the page-turn and scroll — memorize it. The whole
scene also honors `prefers-reduced-motion` (no tracking) and disposes every
GPU resource in the effect cleanup.

Lighting note: there are **four** lights (ambient, key, a fill from below, and
a rim). The lower fill exists purely so the underside of the sphere never
falls into shadow — that shadow read as a dirty tint inside the opening.

---

## 6. Observation — the magnifying glass

`ObservationSpecimen.jsx` + `MagnifyingGlass.jsx`.

### 6.1 The zoom trick — no canvas, just `background-position`

The lens shows the plate magnified 2×. Implementation: a circular
`overflow: hidden` div follows the cursor, and inside it the *same plate
image* is drawn as a CSS background at double size:

```js
const ZOOM = 2;
style={{
  backgroundImage: `url(${plate})`,
  backgroundSize: `${box * ZOOM}px ${box * ZOOM}px`,
  backgroundPosition: `${r - x * ZOOM}px ${r - y * ZOOM}px`,
}}
```

The math that makes it line up: the point under the cursor `(x, y)` must sit
at the circle's center `(r, r)`. In the doubled image that point is at
`(x·2, y·2)`, so shift the background by `r − x·2, r − y·2`. An SVG radial
gradient + two arc strokes on top fake glass tint and edge reflections.

### 6.2 The see-through glass

Here's the subtle part: a real magnifier replaces what it covers. The plate
under the lens is *cut away* with a radial-gradient **mask** on the plate
layer:

```js
const mask = `radial-gradient(circle at ${x}px ${y}px,
  transparent 0, transparent ${r - 2}px, #000 ${r}px, #000 100%)`;
```

Inside radius `r` the mask is transparent (plate hidden — the enlargement
shows through from the layer above), outside it's black (plate visible). The
magnifier artwork PNG (frame + handle) is then positioned so its drawn lens
sits exactly over the cursor (`left: x - LENS.cx * span, top: y - LENS.cy *
span` — `LENS` being the lens position measured inside the magnifier drawing).
Cursor tracking itself is a `setSpot({x, y})` on every pointer move — cheap
because only this small component re-renders.

---

## 7. Creativity — painting on the easel

`CreativitySpecimen.jsx` + `src/data/creativity.js`.

### 7.1 Layer stack

1. The easel artwork (`<Image>`)
2. `<canvas ref={sheetRef}>` — paint on the sheet (absolute, inset-0)
3. `<canvas ref={wellsRef}>` — paint deposited back into palette wells
4. The brush image, translated to the cursor every frame via ref
5. A small colored dot showing what the brush carries

Two separate canvases so sheet-paint and well-paint fade on **independent
clocks**.

### 7.2 Where the brush may paint

Every pointer move computes fractional coordinates `u = x/rect.width`,
`v = y/rect.height` and tests:

```js
const onSheet = u >= CANVAS[0] && u <= CANVAS[2] && v >= CANVAS[1] && v <= CANVAS[3];
const dx = (u - PALETTE[0]) / PALETTE[2];           // palette is an ellipse:
const dy = (v - PALETTE[1]) / PALETTE[3];           // normalized distance ≤ 1
const inWells = !onSheet && dx*dx + dy*dy <= 1;
```

Hovering the wells picks the **nearest dab** from the `WELLS` table (each has
measured `at: [u, v]` and a `color` sampled from the artwork) and loads the
brush with it.

### 7.3 Dabs with spacing

Paint is a series of stamped circles, not a continuous stroke. Points are
dropped unless the cursor moved at least `SPACING = 3`px since the last dab —
this keeps the dab count (and overdraw) bounded no matter how fast you move:

```js
ctx.globalAlpha = 0.55;                       // translucent, like gouache
ctx.arc(x, y, rect.width * SHEET_DAB, 0, 2π); // radius in plate-fraction too
```

### 7.4 The 45-second fade — per-region timers

The requirement: paint vanishes 45s after you **start**, and the clock never
resets while you keep painting. Implementation per region:

```js
const startHold = (region) => {
  if (holdTimers.current[region]) return;      // already counting — do NOT reset
  holdTimers.current[region] = setTimeout(() => fade(region), 45000);
};
```

`startHold` is called when the cursor *enters* a region. When it fires,
`fade()` sets `layer.style.opacity = "0"` (the canvas element has a
`transition-opacity duration-500` class, so the fade itself is pure CSS),
then 520ms later — after the fade completes — the canvas is actually cleared
and opacity restored, ready for a fresh coat. And if you're *still painting*
when the wipe happens, a fresh 45s clock starts, so paint never disappears
mid-stroke without a new timer.

Cleanup matters: all four timers are cleared in the `useEffect` cleanup, and
a `ResizeObserver` re-fits both canvases (with DPR scaling, same trick as the
pencil trail) whenever the plate changes size.

---

## 8. Storytelling — the unrolling scroll

`StorytellingSpecimen.jsx` + `src/data/storytelling.js`. The most layered
effect on the site, but each piece is simple.

### 8.1 Three sprites, one illusion

The artwork is three separate PNGs: the bare desk (base), the parchment sheet,
and the roll. All positioned by measured fractions (`SCROLL.sheet`,
`SCROLL.roll`). The single state variable is:

```js
const [progress, setProgress] = useState(0);  // 0 rolled up → 1 fully unrolled
```

From `progress`, geometry is **derived**, not stored:

```js
const rollTop    = SCROLL.restTop + progress * SCROLL.travel;
const sheetOut   = clamp01((rollTop + rh - sy) / sh);  // how much sheet shows
```

The sheet is revealed with a **`clip-path: inset()`** whose bottom edge rises
as progress falls:

```js
clipPath: `inset(0% 0% ${(1 - sheetOut) * 100}% 0%)`
```

So the roll sprite moves down and the sheet is clipped to exactly the area the
roll has passed — the sheet "feeds out from under the roll." No masking
images, no canvas: one clip rect, recomputed per render.

### 8.2 Drag, tap, and hover — three gestures, one `settle()`

- **Hover** (mouse): `onPointerEnter → settle(1)`, `onPointerLeave →
  settle(0)`. The scroll unrolls itself; no click needed.
- **Drag** (touch, or grabbing the roll): pointer capture on the roll,
  vertical delta ÷ plate height = delta-progress. Crossing 80% up marks the
  scroll "open" (arms the ink); below 10% closes it.
- **Tap**: if the pointer moved less than a threshold (`d.moved`), it's a tap
  — toggle fully open/closed. If it was a real drag, release above 45%
  (`SNAP_POINT`) settles open, below settles shut — like a real roll's
  spring.

### 8.3 The rAF ease — settling like paper

`animateTo(target)` is the hand-rolled animation loop:

```js
const step = (now) => {
  const k = Math.min(1, (now - t0) / ms);   // 0→1 over the duration
  const e = 1 - Math.pow(1 - k, 3);          // cubic ease-OUT
  setP(from + (target - from) * e);
  if (k < 1) rafRef.current = requestAnimationFrame(step);
};
```

`1 − (1−k)³` starts fast and decelerates — the same family as the framer-motion
page ease. Duration scales with distance (`ROLL_MS * (|Δ| + 0.25)`) so a small
nudge doesn't take as long as a full unroll. `cancelAnimationFrame` at the top
means a new gesture instantly hijacks a running animation — never two loops
fighting.

### 8.4 The ink reveal — word by word

When the sheet is ~80% out, a poem is chosen (never the same one twice in a
row) and rendered as individual word `<span>`s:

```js
tokenize(poem.text).map((tok, i) =>
  /^\s+$/.test(tok) ? tok : (
    <span className="ink-word" style={{
      animationDelay: `${INK_START_MS + n * WORD_MS}ms`,  // 55ms per word
      "--jr": `${(rand(n) - 0.5) * 1.1}deg`,              // per-word tilt
      "--ink": 0.86 + rand(n + 1000) * 0.14,              // per-word darkness
    }}>{tok}</span>
  ))
```

Two important details:

- `tokenize` splits on **captured** whitespace (`text.split(/(\s+)/)`) so
  line breaks and spacing survive verbatim — whitespace tokens render raw,
  word tokens get animated.
- `rand(n)` is a **deterministic** pseudo-random (`sin` hash). Every word gets
  a stable slight rotation and ink weight — it looks hand-pressed but doesn't
  reshuffle on re-renders.

The animation itself is one CSS keyframe (injected in a `<style>` tag):

```css
@keyframes ink-reveal {
  0%   { opacity: 0; filter: blur(2.5px); transform: translateY(0.14em); }
  55%  { opacity: calc(var(--ink) * 0.65); }
  100% { opacity: var(--ink); filter: blur(0); transform: translateY(0); }
}
```

Blur → sharp, slight rise, fade to its own `--ink` opacity: invisible ink
surfacing. `animation: ... both` holds the final state. The text layer sits at
`mixBlendMode: "multiply"` so dark ink multiplies into the parchment texture,
and it's clipped by the *same* reveal line as the sheet (`textOut`) — words
never appear above the roll's leading edge.

### 8.5 Auto-fitting the poem to the sheet

A `useLayoutEffect` loop: if the poem body is taller than the sheet, shrink
the font one step (`3cqw → min 2.2cqw`, steps of 0.15) and re-check, before
paint. It converges in a few frames and never flashes oversized text.

---

## 9. Organization — scatter & restack

`OrganizationSpecimen.jsx` + `src/data/organization.js`. The simplest specimen
and the purest example of **CSS transitions doing all the work**.

Eight paper sprites (three designs cycled) sit at measured pile positions,
each with a small resting tilt (`PILE` — "a real stack is never quite squared
away"). State is a single boolean:

```js
const [scattered, setScattered] = useState(false);
```

On hover-in: each paper gets a fresh random target inside `SCATTER_BOX`
(`spill()` — random x, y, rotation ±28°, so *every scatter is different*).
On hover-out: targets revert to zero. The rendering just computes a delta and
lets CSS interpolate:

```jsx
style={{
  transform: `translate(${dx}cqw, ${dy}cqw) rotate(${rot}deg)`,
  transition: "transform 780ms cubic-bezier(.22,.9,.28,1)",
  transitionDelay: `${scattered ? (PAPERS.length - 1 - i) * 45 : i * 45}ms`,
  zIndex: i,
}}
```

The choreography is entirely in `transitionDelay`: scattering delays
top-sheet-first (`length-1-i`), restacking delays bottom-sheet-first (`i`) —
so papers fly out top-down and gather back bottom-up, 45ms apart. React
renders once; the browser's compositor animates transforms (GPU-cheap) for
780ms. This is the pattern to reach for first: **change state → let
`transition` animate the diff.**

---

## 10. Knowledge — the 3D page turn

`KnowledgeSpecimen.jsx` + `src/data/knowledge.js`.

### 10.1 The CSS 3D toolkit

Three properties make a real page turn possible in pure CSS:

```jsx
// on the plate container:
style={{ perspective: "1200px" }}

// on the leaf (the turning page):
style={{
  transform: `rotateY(${-angle}deg)`,
  transformOrigin: "left center",     // hinged at the gutter
  transformStyle: "preserve-3d",
}}
```

- `perspective` on the parent gives rotateY genuine depth (without it, the
  turn looks like a flat horizontal squash).
- `transformOrigin: left center` hinges the leaf at the book's gutter.
- The leaf contains **two faces** (page 217 front, 218 back), each with
  `backfaceVisibility: "hidden"`; the back face is pre-rotated
  `rotateY(180deg)`. As the leaf sweeps past 90°, the front face turns away
  (hidden) and the back face turns toward you (visible) — automatically.
- Mid-turn the leaf naturally narrows to its edge — that's just rotateY
  foreshortening, "different widths like a real page" for free.
- A shade overlay (`opacity = sin(angle°) × 0.22`) darkens whichever face is
  catching the light mid-turn — maximum at 90°, zero at rest. A page
  perpendicular to you is edge-on and shadowed; the sine gives exactly that.

### 10.2 Cursor → angle mapping

The whole spread is the control: cursor x-fraction maps to angle, with a short
CSS transition smoothing the tracking:

```js
const frac = clamp((clientX - rect.left) / rect.width, 0, 1);
setAngle((1 - frac) * 180);            // right edge = 0°, left edge = 180°
// leaf div: transition: settling ? "none" : "transform 90ms linear"
```

The 90ms linear transition makes the leaf *trail* the cursor slightly (heavy
paper feel) without any JS loop. On pointer-leave, `animateTo(0)` — the same
cubic-ease-out rAF helper as the scroll — settles the page back over 550ms,
and while settling the transition is switched off so the two systems never
fight.

### 10.3 The text layers

Four text blocks (216 left, 217 leaf-front, 218 leaf-back, 219 right —
revealed when the leaf turns) are absolutely positioned with
fraction-of-plate rects, sized in `cqw`, colored `#3a2a12` (dark sepia), with
running heads and page numbers at the outer corners. The excerpt is one
continuous passage reading left→right across the four surfaces. Touch gets a
horizontal drag (same follow logic) and a tap toggles the page; Enter/Space
does the same for keyboard.

---

## 11. The motion toolkit — summary cheat sheet

| Need | Tool | Where used |
|---|---|---|
| State A → state B, GPU-smooth | CSS `transition` on transform/opacity | Organization scatter, paint fade, page-turn cursor trail |
| Looping / infinitely deferred | CSS `@keyframes` + `animation-delay` | Ink word reveal (per-word delay) |
| Physics-y settle after a gesture | hand-rolled rAF + cubic ease-out `1−(1−k)³` | Scroll settle, page-turn settle |
| Smooth pursuit of a moving target | exponential lerp `cur += (tgt−cur) × 0.08` in rAF | Eye3D tracking |
| Route/enter/exit choreography | framer-motion `initial/animate/exit`, staggered `delay: i × 0.08` | Page zoom-in, home labels |
| Freehand drawing | `<canvas>` 2D + point buffer + time-based decay | Pencil trail, paint dabs |
| Reveal along a line | `clip-path: inset()` recomputed per frame | Scroll sheet feeding out |
| Depth / rotation in 3D | `perspective` + `rotateY` + `backface-visibility` | Book page turn |
| One object truly 3D | three.js, lerp-driven | The eyeball |

Rules of thumb:

1. **Transforms and opacity only** — never animate `width/height/top/left`;
   they're layout-thrashers. Everything here moves via `transform`.
2. **State changes structure; refs + style writes handle per-frame motion.**
3. **Ease-out everywhere** — things on a desk decelerate; nothing on this site
   eases in.
4. **Stagger delays** (`i × 40–80ms`) are the cheapest way to make a group of
   elements feel choreographed.
5. Honor `prefers-reduced-motion` and give touch its own gesture (tap/drag
   instead of hover).

---

## 12. How to reproduce this process yourself

For each interactive plate, the workflow was:

1. **Artwork first.** Generate or draw the plate (and any separate sprites —
   roll, papers, brush) with transparency where the page should show through.
2. **Measure.** Open the artwork, note pixel coordinates of every interactive
   region, divide by image dimensions, and record fractions in a `src/data/*.js`
   file. All geometry lives in data files — components stay generic.
3. **Layer.** Base `<Image>`, then absolutely-positioned overlays (sprites,
   text blocks, canvases) placed with the measured fractions. Root gets
   `[container-type:inline-size]` so `cqw` units work.
4. **Pick the motion tool** from the cheat sheet above — usually the simplest
   one that can express the gesture.
5. **Wire pointer events** — hover for mouse, drag/tap for touch
   (`e.pointerType`), Enter/Space for keyboard, ARIA labels throughout.
6. **Verify on the real background.** Anything semi-transparent or blended
   (`multiply`) must be checked composited over the actual page color
   (#f4f0e6), not in an image viewer.

### Color-grading existing art to match (the alpha-aware trick)

The Observation/Creativity plates were re-toned to the site's warm palette
*after the fact* with a Python/PIL script. Key lesson: those PNGs store
artwork as **semi-transparent dark pixels** (the luminance lives in the alpha
channel), so you can't grade the RGB directly. The working method:

1. Composite each pixel over the site background: `C = a·RGB + (1−a)·BG`.
2. Compute the warm target color from `C`'s luminance (a parchment duotone:
   dark sepia → warm tan → ivory), blended by how *unsaturated* `C` is — so
   paint dabs keep their hue.
3. Solve back for the new RGB: `RGB′ = (target − (1−a)·BG) / a`.

Same principle applies any time you recolor alpha-carrying artwork.

---

## 13. Data file reference

| File | Contents |
|---|---|
| `gifts.js` | The five gifts: id, name, specimen caption, plate image, two vocations, five daily practices. `PROJECT_WORD = "to illustrate"`. |
| `eyeOpening.js` | `EYE_OPENING_100` (percent-space) and `EYE_OPENING_01` (0–1) SVG paths traced from the eyelid art. |
| `creativity.js` | `BRUSH`, `BRUSH_TIP`, default `PAINT`, `CANVAS` rect, `PALETTE` ellipse, `WELLS` (10 dab positions + colors). |
| `storytelling.js` | `SHEET_IMG`, `ROLL_IMG`, `SHEET` text rect, `SCROLL` geometry (`sheet`, `roll`, `restTop`, `travel`), `ROLL_MS`, `WORD_MS`, `POEMS`. |
| `organization.js` | `PAPERS` (8 sprite paths + pile positions/tilts), `PAPER_W`, `SCATTER_BOX`. |
| `knowledge.js` | `LEAF_IMG`/`LEAF_BACK_IMG`, `LEAF` rect, `PAGE_LEFT`/`PAGE_RIGHT` text rects, `LEAF_TEXT` margins, `PAGES` (four surfaces of the Asimov excerpt). |

---

*Built with React, Vite, Tailwind, framer-motion, three.js, and a lot of
measured fractions.*
