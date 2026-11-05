import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import { POEMS, ROLL_IMG, ROLL_MS, SCROLL, SHEET, SHEET_IMG, WORD_MS } from "@/data/storytelling";

// The storytelling plate: a bare writing desk, a parchment sheet, and a roll
// you can actually grab. Pull the roll down and the sheet feeds out beneath
// it; let go past halfway and it settles open, or it springs back shut.
// Once the sheet is nearly all out, a poem surfaces on it word by word,
// like invisible ink. Tap the roll to open or close it without dragging.

// the ink does not stamp down all at once — each word surfaces out of the
// parchment fibres: a blur, a breath, then dark sepia that lets the grain
// show through (the text layer blends in multiply, like real soaked ink)
const INK_CSS = `
@keyframes ink-reveal {
  0%   { opacity: 0; filter: blur(2.5px); transform: translateY(0.14em) rotate(var(--jr, 0deg)); }
  55%  { opacity: calc(var(--ink, 0.88) * 0.65); }
  100% { opacity: var(--ink, 0.88); filter: blur(0); transform: translateY(0) rotate(var(--jr, 0deg)); }
}
.ink-word {
  display: inline-block;
  opacity: 0;
  animation: ink-reveal 0.9s ease-out both;
  will-change: opacity, filter, transform;
}
`;

// the ink waits until the sheet is nearly all unrolled before surfacing
const INK_THRESHOLD = 0.8;
const INK_START_MS = 300;
// released past this point, the roll settles open; before it, it rolls back
const SNAP_POINT = 0.45;

// a steady, repeatable scramble — every word gets its own slight tilt and
// ink weight, the way a hand never presses the same way twice
const rand = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// split the poem into words and the whitespace between them, keeping every
// line break exactly as written
const tokenize = (text) => text.split(/(\s+)/);

// the writing starts at reading size and steps down until the whole poem
// rests on the parchment at once — nothing scrolls, nothing spills
const START_CQW = 3;
const MIN_CQW = 1.0;
const STEP_CQW = 0.15;

const clamp01 = (v) => Math.min(1, Math.max(0, v));

export default function StorytellingSpecimen({ plate, alt }) {
  const [progress, setProgress] = useState(0); // 0 rolled up, 1 fully unrolled
  const [open, setOpen] = useState(false);
  const [poem, setPoem] = useState(null);
  const [cqw, setCqw] = useState(START_CQW);
  const [dragging, setDragging] = useState(false);
  const lastRef = useRef(-1); // last poem told, so the next telling is a new one
  const progressRef = useRef(0);
  const dragRef = useRef(null);
  const rafRef = useRef(null);
  const plateRef = useRef(null);
  const sheetRef = useRef(null);
  const bodyRef = useRef(null);

  const setP = (v) => {
    progressRef.current = v;
    setProgress(v);
  };

  const animateTo = (target) => {
    cancelAnimationFrame(rafRef.current);
    const from = progressRef.current;
    const t0 = performance.now();
    const ms = ROLL_MS * Math.min(1, Math.abs(target - from) + 0.25);
    const step = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3); // ease-out, like a roll settling
      setP(from + (target - from) * e);
      if (k < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const settle = (target) => {
    setOpen(target === 1);
    animateTo(target);
  };

  // pick a fresh poem each time the scroll opens; forget it once rolled up
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setPoem(null), ROLL_MS);
      return () => clearTimeout(t);
    }
    let idx = Math.floor(Math.random() * POEMS.length);
    if (POEMS.length > 1 && idx === lastRef.current) idx = (idx + 1) % POEMS.length;
    lastRef.current = idx;
    setCqw(START_CQW);
    setPoem(POEMS[idx]);
    return undefined;
  }, [open]);

  // fit the telling to the sheet: shrink the ink until every word of the
  // poem lies on the parchment at once
  useLayoutEffect(() => {
    if (!open || !poem) return;
    const sheet = sheetRef.current;
    const body = bodyRef.current;
    if (!sheet || !body) return;
    if (body.offsetHeight > sheet.clientHeight && cqw > MIN_CQW) {
      setCqw(Math.max(MIN_CQW, Math.round((cqw - STEP_CQW) * 100) / 100));
    }
  }, [open, poem, cqw]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const onRollPointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    cancelAnimationFrame(rafRef.current);
    dragRef.current = { y: e.clientY, p: progressRef.current, moved: false };
    setDragging(true);
  };

  const onRollPointerMove = (e) => {
    const d = dragRef.current;
    if (!d || !plateRef.current) return;
    const dp = (e.clientY - d.y) / plateRef.current.getBoundingClientRect().height;
    if (Math.abs(dp) > 0.012) d.moved = true;
    const v = clamp01(d.p + dp);
    setP(v);
    if (v >= INK_THRESHOLD && !open) setOpen(true);
    if (v <= 0.1 && open) setOpen(false);
  };

  const onRollPointerUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    if (!d) return;
    if (!d.moved) {
      // a tap, not a pull — roll it the rest of the way by itself
      settle(progressRef.current < 0.5 ? 1 : 0);
    } else {
      settle(progressRef.current > SNAP_POINT ? 1 : 0);
    }
  };

  const [sx, sy, sw, sh] = SCROLL.sheet;
  const [rx, rw, rh] = SCROLL.roll;
  const rollTop = SCROLL.restTop + progress * SCROLL.travel;
  const rollBottom = rollTop + rh;
  // how much of the sheet has fed out from under the roll
  const sheetOut = clamp01((rollBottom - sy) / sh);
  // how far the reveal line has travelled through the writing area
  const textOut = clamp01((rollBottom - SHEET[1]) / (SHEET[3] - SHEET[1]));

  let wordIndex = 0;

  return (
    <div>
      <style>{INK_CSS}</style>
      <div
        ref={plateRef}
        role="button"
        tabIndex={0}
        aria-label={`${alt} — pull the scroll down to read a poem`}
        aria-expanded={open}
        onPointerMove={(e) => {
          // no clicking: the roll simply follows the cursor down the desk
          if (e.pointerType === "touch" || dragRef.current || open) return;
          if (!plateRef.current) return;
          const rect = plateRef.current.getBoundingClientRect();
          const frac = (e.clientY - rect.top) / rect.height;
          const p = clamp01((frac - SCROLL.restTop - rh / 2) / SCROLL.travel);
          cancelAnimationFrame(rafRef.current);
          setP(p);
          if (p >= INK_THRESHOLD) {
            setOpen(true);
            animateTo(1);
          }
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "touch" || dragRef.current) return;
          setOpen(false);
          animateTo(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            settle(open ? 0 : 1);
          }
        }}
        className="relative w-full select-none [container-type:inline-size]"
      >
        <Image src={plate} alt={alt} fittingType="fit" className="h-auto w-full" />

        {/* the parchment sheet, feeding out from under the roll */}
        <img
          src={SHEET_IMG}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute"
          style={{
            left: `${sx * 100}%`,
            top: `${sy * 100}%`,
            width: `${sw * 100}%`,
            height: `${sh * 100}%`,
            clipPath: `inset(0% 0% ${(1 - sheetOut) * 100}% 0%)`,
          }}
        />

        {/* the writing on the sheet, blended into the parchment */}
        <div
          aria-live="polite"
          className="pointer-events-none absolute"
          style={{
            left: `${SHEET[0] * 100}%`,
            top: `${SHEET[1] * 100}%`,
            width: `${(SHEET[2] - SHEET[0]) * 100}%`,
            height: `${(SHEET[3] - SHEET[1]) * 100}%`,
            mixBlendMode: "multiply",
            opacity: open ? 1 : 0,
            clipPath: `inset(0% 0% ${(1 - textOut) * 100}% 0%)`,
            transition: "opacity 300ms ease",
          }}
        >
          <div
            ref={sheetRef}
            className="h-full w-full overflow-hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {poem && (
              <div key={`${lastRef.current}-${poem.title}`} ref={bodyRef}>
                <p className="mb-[0.6cqw] text-center">
                  <span
                    className="ink-word font-[var(--font-label)] text-[#4a3416]"
                    style={{
                      fontSize: `${cqw * 1.14}cqw`,
                      lineHeight: 1.2,
                      animationDelay: `${INK_START_MS}ms`,
                      animationDuration: "1.6s",
                      "--ink": 0.92,
                    }}
                  >
                    {poem.title}
                  </span>
                </p>
                <p
                  className="whitespace-pre-wrap font-[var(--font-body)] italic text-[#4a3416]"
                  style={{ fontSize: `${cqw}cqw`, lineHeight: 1.32 }}
                >
                  {tokenize(poem.text).map((tok, i) => {
                    if (/^\s+$/.test(tok)) return tok;
                    const n = wordIndex;
                    wordIndex += 1;
                    return (
                      <span
                        key={i}
                        className="ink-word"
                        style={{
                          animationDelay: `${INK_START_MS + n * WORD_MS}ms`,
                          "--jr": `${(rand(n) - 0.5) * 1.1}deg`,
                          "--ink": 0.78 + rand(n + 1000) * 0.16,
                        }}
                      >
                        {tok}
                      </span>
                    );
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* the roll — grab it and pull */}
        <img
          src={ROLL_IMG}
          alt=""
          aria-hidden
          draggable={false}
          onPointerDown={onRollPointerDown}
          onPointerMove={onRollPointerMove}
          onPointerUp={onRollPointerUp}
          onPointerCancel={onRollPointerUp}
          className={`absolute ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{
            left: `${rx * 100}%`,
            top: `${rollTop * 100}%`,
            width: `${rw * 100}%`,
            height: `${rh * 100}%`,
            touchAction: "none",
            filter: "drop-shadow(0 0.9cqw 0.7cqw rgba(40,22,6,0.45))",
          }}
        />
      </div>
      <p className="mt-2 text-center font-[var(--font-body)] text-[11px] italic text-[#5a5148]/70">
        Run your cursor down the scroll — a poem surfaces like invisible ink.
      </p>
    </div>
  );
}
