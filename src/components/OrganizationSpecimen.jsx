import { useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import { PAPERS, PAPER_W, SCATTER_BOX } from "@/data/organization";

// The organization plate: a desk with a stack of designed papers.
// Brush across it and the papers scatter over the whole desktop; step away
// and the pile gathers itself back together, sheet by sheet. A tap does the
// same on touch screens.

// every scatter is a fresh spill — the desk never messes up the same way twice
const spill = () => ({
  x: SCATTER_BOX.x0 + Math.random() * (SCATTER_BOX.x1 - SCATTER_BOX.x0),
  y: SCATTER_BOX.y0 + Math.random() * (SCATTER_BOX.y1 - SCATTER_BOX.y0),
  r: (Math.random() - 0.5) * 56,
});

const NEAT = PAPERS.map(() => ({ x: 0, y: 0, r: 0 }));

export default function OrganizationSpecimen({ plate, alt }) {
  const [scattered, setScattered] = useState(false);
  const [targets, setTargets] = useState(NEAT);
  const touchRef = useRef(false);

  const scatter = () => {
    setTargets(PAPERS.map(spill));
    setScattered(true);
  };
  const restack = () => setScattered(false);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={`${alt} — brush across to scatter the papers`}
        aria-pressed={scattered}
        onPointerEnter={(e) => {
          if (e.pointerType !== "touch") scatter();
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "touch") restack();
        }}
        onPointerDown={(e) => {
          touchRef.current = e.pointerType === "touch";
        }}
        onClick={() => {
          if (touchRef.current) (scattered ? restack() : scatter());
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            scattered ? restack() : scatter();
          }
        }}
        className="relative w-full cursor-pointer select-none [container-type:inline-size]"
      >
        <Image src={plate} alt={alt} fittingType="fit" className="h-auto w-full" />

        {PAPERS.map((p, i) => {
          const t = scattered ? targets[i] : NEAT[i];
          // the pile sits a touch off-square; the spill lands anywhere
          const dx = scattered ? (t.x - p.x) * 100 : 0;
          const dy = scattered ? (t.y - p.y) * 100 : 0;
          const rot = scattered ? t.r : p.r;
          return (
            <img
              key={i}
              src={p.src}
              alt=""
              aria-hidden
              draggable={false}
              className="pointer-events-none absolute h-auto"
              style={{
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                width: `${PAPER_W * 100}%`,
                transform: `translate(${dx}cqw, ${dy}cqw) rotate(${rot}deg)`,
                transition: "transform 780ms cubic-bezier(.22,.9,.28,1)",
                // sheets fly out top-first and settle back bottom-first
                transitionDelay: `${scattered ? (PAPERS.length - 1 - i) * 45 : i * 45}ms`,
                filter: "drop-shadow(0 0.5cqw 0.4cqw rgba(40,22,6,0.35))",
                zIndex: i,
              }}
            />
          );
        })}
      </div>
      <p className="mt-2 text-center font-[var(--font-body)] text-[11px] italic text-[#5a5148]/70">
        Brush across the desk — the papers scatter; step away and they stack themselves.
      </p>
    </div>
  );
}
