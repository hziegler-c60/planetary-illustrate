import { useEffect, useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import { DESK_OPEN, POEMS, SHEET, WORD_MS } from "@/data/storytelling";

// The storytelling plate: a writing desk with a rolled scroll, quill & ink.
// When the cursor comes to the scroll it unrolls, and one of the poems writes
// itself onto the parchment word by word. Leave, and the scroll rolls back up;
// return, and a different poem begins. A tap does the same on touch screens.

// the offsets of each word's end in the poem, so the text can be revealed
// one word at a time while keeping every line break exactly as written
const wordEnds = (text) => {
  const ends = [];
  const re = /\S+/g;
  let m;
  while ((m = re.exec(text)) !== null) ends.push(m.index + m[0].length);
  return ends;
};

export default function StorytellingSpecimen({ plate, alt }) {
  const [open, setOpen] = useState(false);
  const [poem, setPoem] = useState(null);
  const [shown, setShown] = useState(""); // the poem so far
  const endsRef = useRef([]);
  const timerRef = useRef(null);
  const lastRef = useRef(-1); // last poem told, so the next telling is a new one
  const touchRef = useRef(false);
  const sheetRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!open) {
      clearTimer();
      setShown("");
      setPoem(null);
      return undefined;
    }
    let idx = Math.floor(Math.random() * POEMS.length);
    if (POEMS.length > 1 && idx === lastRef.current) idx = (idx + 1) % POEMS.length;
    lastRef.current = idx;
    const next = POEMS[idx];
    endsRef.current = wordEnds(next.text);
    setPoem(next);
    setShown("");
    let i = 0;
    timerRef.current = setInterval(() => {
      i += 1;
      if (i >= endsRef.current.length) {
        setShown(next.text);
        clearTimer();
        return;
      }
      setShown(next.text.slice(0, endsRef.current[i - 1]));
    }, WORD_MS);
    return clearTimer;
  }, [open]);

  // the parchment follows the writing down as the poem outgrows the sheet
  useEffect(() => {
    const el = sheetRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown]);

  return (
    <div>
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

        {/* the writing on the sheet */}
        <div
          ref={sheetRef}
          aria-live="polite"
          className={`absolute overflow-hidden transition-opacity duration-500 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          style={{
            left: `${SHEET[0] * 100}%`,
            top: `${SHEET[1] * 100}%`,
            width: `${(SHEET[2] - SHEET[0]) * 100}%`,
            height: `${(SHEET[3] - SHEET[1]) * 100}%`,
            scrollbarWidth: "none",
          }}
        >
          {poem && (
            <>
              <p
                className="mb-[1cqw] text-center font-[var(--font-label)] text-[#3d2c17]"
                style={{ fontSize: "3.6cqw", lineHeight: 1.2 }}
              >
                {poem.title}
              </p>
              <p
                className="whitespace-pre-wrap font-[var(--font-body)] italic text-[#3d2c17]"
                style={{ fontSize: "3.1cqw", lineHeight: 1.45 }}
              >
                {shown}
                {shown.length < poem.text.length && (
                  <span className="animate-pulse text-[#8B4513]">▎</span>
                )}
              </p>
            </>
          )}
        </div>
      </div>
      <p className="mt-2 text-center font-[var(--font-body)] text-[11px] italic text-[#5a5148]/70">
        Unroll the scroll — a poem writes itself.
      </p>
    </div>
  );
}
