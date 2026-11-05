import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import { DESK_OPEN, POEMS, SHEET, SHEET_ROT, WORD_MS } from "@/data/storytelling";

// The storytelling plate: a writing desk with a rolled scroll, quill & ink.
// When the cursor comes to the scroll it unrolls, and one of the poems appears
// on the parchment word by word, like invisible ink rising to the surface.
// Leave, and the scroll rolls back up; return, and a different poem begins.
// A tap does the same on touch screens.

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

export default function StorytellingSpecimen({ plate, alt }) {
  const [open, setOpen] = useState(false);
  const [poem, setPoem] = useState(null);
  const [cqw, setCqw] = useState(START_CQW);
  const lastRef = useRef(-1); // last poem told, so the next telling is a new one
  const touchRef = useRef(false);
  const sheetRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!open) {
      // let the ink fade with the rolling scroll before forgetting the poem
      const t = setTimeout(() => setPoem(null), 500);
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

  let wordIndex = 0;

  return (
    <div>
      <style>{INK_CSS}</style>
      <div
        role="button"
        tabIndex={0}
        aria-label={`${alt} — unroll the scroll to read a poem`}
        onPointerEnter={(e) => {
          if (e.pointerType !== "touch") setOpen(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "touch") setOpen(false);
        }}
        onPointerDown={(e) => {
          touchRef.current = e.pointerType === "touch";
        }}
        onClick={() => {
          if (touchRef.current) setOpen((o) => !o);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen((o) => !o);
        }}
        className="relative w-full cursor-pointer select-none [container-type:inline-size]"
      >
        <Image src={plate} alt={alt} fittingType="fit" className="h-auto w-full" />
        <Image
          src={DESK_OPEN}
          alt=""
          fittingType="fit"
          aria-hidden={!open}
          className={`absolute inset-0 h-auto w-full transition-opacity duration-500 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* the writing on the sheet — rotated with the parchment, blended into it */}
        <div
          aria-live="polite"
          className={`absolute transition-opacity duration-500 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          style={{
            left: `${SHEET[0] * 100}%`,
            top: `${SHEET[1] * 100}%`,
            width: `${(SHEET[2] - SHEET[0]) * 100}%`,
            height: `${(SHEET[3] - SHEET[1]) * 100}%`,
            transform: `rotate(${SHEET_ROT}deg)`,
            mixBlendMode: "multiply",
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
                          animationDelay: `${150 + n * WORD_MS}ms`,
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
      </div>
      <p className="mt-2 text-center font-[var(--font-body)] text-[11px] italic text-[#5a5148]/70">
        Unroll the scroll — a poem surfaces like invisible ink.
      </p>
    </div>
  );
}
