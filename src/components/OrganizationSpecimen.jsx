import { useState } from "react";
import { Image } from "@/components/ui/image";
import { DRAWER, FILES, LIFT, MAX_STRETCH } from "@/data/organization";

// The plate is square, so a fraction of its width is the same fraction of its height.
const PLATE = 1024;

// The organisation plate: the open drawer, kept exactly as drawn. Each file in it
// is one band of the plate, cut out along the drawing's own lines, so passing the
// cursor over a file lifts that one alone — its own pixels stretched upward out of
// the drawer, as if a hand were drawing it up to be taken out.
export default function OrganizationSpecimen({ plate, alt }) {
  const [lifted, setLifted] = useState(null);
  const { xFrom, xTo } = DRAWER;

  return (
    <div className="relative w-full">
      <Image src={plate} alt={alt} fittingType="fit" className="h-auto w-full" />
      {FILES.map((file, i) => {
        const { top, bottom } = file;
        const height = Math.max(3, ((bottom[0] + bottom[1]) / 2 - (top[0] + top[1]) / 2) * PLATE);
        const stretch = Math.min(MAX_STRETCH, 1 + LIFT / height);
        // while a file grows, its lower edge has to stay sitting on the line it
        // rose from — so the stretch is paired with a shear that cancels the
        // slope of that line
        const slope = (bottom[1] - bottom[0]) / (xTo - xFrom);
        const shear = (Math.atan(slope * (1 - stretch)) * 180) / Math.PI;

        return (
          <div
            key={i}
            aria-hidden="true"
            onMouseEnter={() => setLifted(i)}
            onMouseLeave={() => setLifted((current) => (current === i ? null : current))}
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{
              backgroundImage: `url(${plate})`,
              backgroundSize: "100% 100%",
              clipPath: `polygon(${xFrom * 100}% ${top[0] * 100}%, ${xTo * 100}% ${top[1] * 100}%, ${
                xTo * 100
              }% ${bottom[1] * 100}%, ${xFrom * 100}% ${bottom[0] * 100}%)`,
              transformOrigin: `50% ${((bottom[0] + bottom[1]) / 2) * 100}%`,
              transform: lifted === i ? `skewY(${shear}deg) scaleY(${stretch})` : "none",
              zIndex: i + 1,
            }}
          />
        );
      })}
    </div>
  );
}