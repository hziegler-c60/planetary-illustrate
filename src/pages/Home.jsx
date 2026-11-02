import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { gifts, PROJECT_WORD } from "@/data/gifts";
import Eye3D from "@/components/Eye3D";
import Eyelid from "@/components/Eyelid";
import AlmondClip from "@/components/AlmondClip";

// Gift labels sit on the eyeball visible through the eyelid opening
// (measured off the lid art: the opening spans x 24..76, y 36..63).
const LABELS = [
  { x: 50, y: 40 }, // Knowledge — upper
  { x: 66, y: 49 }, // Creativity — right
  { x: 50, y: 49 }, // Observation — centre (the iris)
  { x: 50, y: 59 }, // Storytelling — lower
  { x: 34, y: 49 }, // Organization — left
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="paper-bg flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden px-4 py-4">
      <AlmondClip />
      {/* Desktop / tablet — word integrated with a large 3D eye */}
      <div className="relative hidden w-full max-w-[720px] md:block">
        <h1
          className="pointer-events-none absolute left-1/2 top-[1%] z-20 -translate-x-1/2 text-center leading-none text-[#2D2D2D]"
          style={{ fontFamily: "var(--font-script)", fontSize: "min(11vw, 72px)" }}
        >
          {PROJECT_WORD}
        </h1>

        <div className="relative aspect-square w-full">
          {/* the 3D eyeball — stays centred, rotates to track the cursor */}
          <Eye3D />
          {/* the eyelid — static outer layer framing the opening */}
          <Eyelid />

          {/* gift labels — on parts of the eyeball */}
          <div className="absolute inset-0">
            {gifts.map((g, i) => {
              const p = LABELS[i];
              return (
                <motion.button
                  key={g.id}
                  onClick={() => navigate(`/gift/${g.id}`)}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                  whileHover={{ scale: 1.08 }}
                  whileFocus={{ scale: 1.08 }}
                  className="group absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-[#8B4513]/40 bg-[#f4f0e6]/85 px-2.5 py-1 shadow-sm backdrop-blur-[1px]"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <span className="h-1.5 w-1.5 flex-none rounded-full bg-[#8B4513]" />
                  <span className="font-[var(--font-label)] text-[12px] tracking-wide text-[#2D2D2D] transition-colors group-hover:text-[#8B4513] group-focus-visible:text-[#8B4513]">
                    {g.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <p className="mt-1 text-center font-[var(--font-body)] text-[10px] uppercase tracking-[0.3em] text-[#8B4513]/70">
          Fig. I — The Organ of Sight
        </p>
        <p className="mx-auto mt-2 max-w-md text-center font-[var(--font-body)] text-[12px] italic leading-relaxed text-[#5a5148]/80">
          Select a faculty to examine its specimen, the vocations it serves, and the daily practices by which it is strengthened.
        </p>
      </div>

      {/* Mobile — stacked list */}
      <div className="w-full max-w-[300px] md:hidden">
        <h1
          className="mb-3 text-center leading-none text-[#2D2D2D]"
          style={{ fontFamily: "var(--font-script)", fontSize: "min(16vw, 64px)" }}
        >
          {PROJECT_WORD}
        </h1>
        <div className="relative aspect-square w-full">
          <Eye3D />
          <Eyelid />
        </div>
        <p className="mt-2 text-center font-[var(--font-body)] text-[10px] uppercase tracking-[0.3em] text-[#8B4513]/70">
          Fig. I — The Organ of Sight
        </p>
        <ul className="mt-4 space-y-3">
          {gifts.map((g, i) => (
            <li key={g.id}>
              <button
                onClick={() => navigate(`/gift/${g.id}`)}
                className="flex w-full items-center gap-3 rounded-md border border-[#8B4513]/30 bg-[#f4f0e6]/60 px-4 py-3 text-left active:scale-[0.99]"
              >
                <span className="font-[var(--font-body)] text-[11px] text-[#8B4513]">
                  {`No. ${i + 1}`}
                </span>
                <span className="font-[var(--font-label)] text-[17px] text-[#2D2D2D]">
                  {g.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-4 max-w-md text-center font-[var(--font-body)] text-[12px] italic leading-relaxed text-[#5a5148]/80">
          Select a faculty to examine its specimen, the vocations it serves, and the daily practices by which it is strengthened.
        </p>
      </div>
    </div>
  );
}