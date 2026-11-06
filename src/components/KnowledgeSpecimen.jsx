import { useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import { LEAF, LEAF_BACK_IMG, LEAF_IMG, LEAF_TEXT, PAGE_LEFT, PAGE_RIGHT, PAGES } from "@/data/knowledge";

// The knowledge plate: an open book — Asimov's The Collapsing Universe.
// The leaf on the right page follows the cursor across the spread: sweep
// left and it turns like a real page, narrowing to its edge at the gutter
// and opening onto the next leaf. Sweep right and it turns back.
// Step away and the page settles home. A horizontal drag does the same on
// touch screens; a tap turns the page over (and back).

// printed page furniture: running head, body, page number at the outer corner
function PageText({ page, rect, head, outer }) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${rect[0] * 100}%`,
        top: `${rect[1] * 100}%`,
        width: `${(rect[2] - rect[0]) * 100}%`,
        height: `${(rect[3] - rect[1]) * 100}%`,
      }}
    >
      <p
        className="text-center font-[var(--font-label)] uppercase text-[#3a2a12]/80"
        style={{ fontSize: "1.5cqw", letterSpacing: "0.18em" }}
      >
        {head}
      </p>
      <p
        className="mt-[1.2cqw] whitespace-pre-wrap font-[var(--font-body)] text-[#3a2a12]"
        style={{ fontSize: "2.05cqw", lineHeight: 1.5 }}
      >
        {page.text}
      </p>
      <p
        className={`absolute font-[var(--font-body)] text-[#3a2a12]/70 ${outer === "left" ? "left-0" : "right-0"}`}
        style={{ bottom: "-2.6cqw", fontSize: "1.7cqw" }}
      >
        {page.num}
      </p>
    </div>
  );
}

// the text on one face of the turning leaf — margins are relative to the leaf
function LeafText({ page, head, outer }) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${LEAF_TEXT[0] * 100}%`,
        top: `${LEAF_TEXT[1] * 100}%`,
        width: `${(LEAF_TEXT[2] - LEAF_TEXT[0]) * 100}%`,
        height: `${(LEAF_TEXT[3] - LEAF_TEXT[1]) * 100}%`,
      }}
    >
      <p
        className="text-center font-[var(--font-label)] uppercase text-[#3a2a12]/80"
        style={{ fontSize: "1.5cqw", letterSpacing: "0.18em" }}
      >
        {head}
      </p>
      <p
        className="mt-[1.2cqw] whitespace-pre-wrap font-[var(--font-body)] text-[#3a2a12]"
        style={{ fontSize: "2.05cqw", lineHeight: 1.5 }}
      >
        {page.text}
      </p>
      <p
        className={`absolute font-[var(--font-body)] text-[#3a2a12]/70 ${outer === "left" ? "left-0" : "right-0"}`}
        style={{ bottom: "-1.2cqw", fontSize: "1.7cqw" }}
      >
        {page.num}
      </p>
    </div>
  );
}

export default function KnowledgeSpecimen({ plate, alt }) {
  const [angle, setAngle] = useState(0); // 0 resting on the right, 180 turned left
  const [settling, setSettling] = useState(false);
  const plateRef = useRef(null);
  const dragRef = useRef(null);
  const rafRef = useRef(null);

  const follow = (clientX) => {
    const rect = plateRef.current?.getBoundingClientRect();
    if (!rect) return;
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    cancelAnimationFrame(rafRef.current);
    setSettling(false);
    setAngle((1 - frac) * 180);
  };

  const animateTo = (target) => {
    cancelAnimationFrame(rafRef.current);
    setSettling(true);
    const from = angle;
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 550);
      const e = 1 - Math.pow(1 - k, 3);
      const v = from + (target - from) * e;
      setAngle(v);
      if (k < 1) rafRef.current = requestAnimationFrame(step);
      else setSettling(false);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  // a page mid-turn catches the light differently — a soft shade at the gutter
  const shade = Math.sin((angle * Math.PI) / 180) * 0.22;

  return (
    <div>
      <div
        ref={plateRef}
        role="button"
        tabIndex={0}
        aria-label={`${alt} — sweep across the book to turn the page`}
        onPointerMove={(e) => {
          if (e.pointerType === "touch") {
            // a finger sweeping sideways turns the page with it
            const d = dragRef.current;
            if (!d) return;
            if (Math.abs(e.clientX - d.x) > 8) d.moved = true;
            if (d.moved) follow(e.clientX);
            return;
          }
          follow(e.clientX);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "touch" || dragRef.current) return;
          animateTo(0);
        }}
        onPointerDown={(e) => {
          if (e.pointerType === "touch") {
            e.currentTarget.setPointerCapture(e.pointerId);
            dragRef.current = { x: e.clientX, moved: false };
          }
        }}
        onPointerUp={() => {
          const d = dragRef.current;
          dragRef.current = null;
          if (d && !d.moved) animateTo(angle > 90 ? 0 : 180); // a tap turns the page over
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            animateTo(angle > 90 ? 0 : 180);
          }
        }}
        className="relative w-full cursor-pointer select-none [container-type:inline-size]"
        style={{ perspective: "1200px" }}
      >
        <Image src={plate} alt={alt} fittingType="fit" className="h-auto w-full" />

        {/* the printed spread underneath: page 216 at left, 219 waiting at right */}
        <PageText page={PAGES.left} rect={PAGE_LEFT} head={PAGES.left.head} outer="left" />
        <PageText page={PAGES.right} rect={PAGE_RIGHT} head={PAGES.right.head} outer="right" />

        {/* the turning leaf: 217 on its face, 218 on its back */}
        <div
          aria-hidden
          className="absolute"
          style={{
            left: `${LEAF[0] * 100}%`,
            top: `${LEAF[1] * 100}%`,
            width: `${LEAF[2] * 100}%`,
            height: `${LEAF[3] * 100}%`,
            transform: `rotateY(${-angle}deg)`,
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            transition: settling ? "none" : "transform 90ms linear",
          }}
        >
          {/* face — page 217 */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden" }}
          >
            <img src={LEAF_IMG} alt="" draggable={false} className="h-full w-full" />
            <LeafText page={PAGES.leafFront} head={PAGES.leafFront.head} outer="right" />
            <div className="absolute inset-0 bg-[#2a1a08]" style={{ opacity: shade }} />
          </div>
          {/* back — page 218 */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <img src={LEAF_BACK_IMG} alt="" draggable={false} className="h-full w-full" />
            <LeafText page={PAGES.leafBack} head={PAGES.leafBack.head} outer="left" />
            <div className="absolute inset-0 bg-[#2a1a08]" style={{ opacity: shade }} />
          </div>
        </div>
      </div>
      <p className="mt-2 text-center font-[var(--font-body)] text-[11px] italic text-[#5a5148]/70">
        Sweep across the book — the page turns with you.
      </p>
    </div>
  );
}
