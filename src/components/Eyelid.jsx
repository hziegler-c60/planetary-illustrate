import { Image } from "@/components/ui/image";
import { EYE_OPENING_100 } from "@/data/eyeOpening";

// The eyelid — a generated 18th-century pencil drawing, overlaid with
// mix-blend-mode: multiply so its white paper drops away and only the graphite
// strokes remain, while the 3D iris shows through the opening.
//
// The opening is punched back to pure white *inside* the blend layer (white
// multiplied = no-op) so the eyeball showing through is never tinted dark by
// the lid art's inner shading. Both the punch and the shadow below follow the
// drawn opening's own outline (see eyeOpening), so the eye's edge is the lid's
// line rather than an almond drawn by hand.
export default function Eyelid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      style={{ mixBlendMode: "multiply" }}
    >
      <Image
        src="/plates/eyelid.png"
        fittingType="fill"
        className="absolute inset-0 h-full w-full"
        alt=""
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={EYE_OPENING_100} fill="#ffffff" />
      </svg>

      {/* the lids' own shadow falling inside the opening — without it the
          eyeball's white meets the drawn lid in a hard pale band */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="lid-opening-shadow-clip">
            <path d={EYE_OPENING_100} />
          </clipPath>
          <linearGradient id="lid-opening-shadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a89877" stopOpacity="0.8" />
            <stop offset="0.2" stopColor="#cbbfa4" stopOpacity="0.45" />
            <stop offset="0.44" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.62" stopColor="#e6e0d2" stopOpacity="0.22" />
            <stop offset="0.86" stopColor="#c9bda2" stopOpacity="0.42" />
            <stop offset="1" stopColor="#a89877" stopOpacity="0.62" />
          </linearGradient>
        </defs>
        <g clipPath="url(#lid-opening-shadow-clip)">
          <rect x="0" y="35.6" width="100" height="27.4" fill="url(#lid-opening-shadow)" />
        </g>
      </svg>
    </div>
  );
}