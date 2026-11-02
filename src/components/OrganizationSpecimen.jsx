import { useState } from "react";
import { Image } from "@/components/ui/image";
import { CARDS, FRONT, PULL } from "@/data/organization";

// The organisation plate: the open card-catalogue drawer, kept exactly as drawn.
// Passing the cursor through the cards pulls each one up out of the drawer — the
// card rises as if a hand were drawing it out, and the drawer's wooden front cuts
// it off at the same line that hides it in the drawing. Leave it, and it slides
// back into place.

// y of the drawer front's top edge at a given x (the line that hides the cards)
const frontY = (x) =>
  FRONT[0][1] + ((x - FRONT[0][0]) * (FRONT[1][1] - FRONT[0][1])) / (FRONT[1][0] - FRONT[0][0]);

// the region above that line, extended to the plate's edges — the only place a
// pulled card may show
const VISIBLE = `polygon(0% 0%, 100% 0%, 100% ${frontY(1) * 100}%, 0% ${frontY(0) * 100}%)`;

const pct = (pts) => pts.map(([x, y]) => `${x * 100}% ${y * 100}%`).join(", ");

export default function OrganizationSpecimen({ plate, alt }) {
  const [lifted, setLifted] = useState(null);

  // each card: a paper quad from its drawn top edge, running down into the drawer
  const cards = CARDS.map(([tl, tr], i) => {
    const d = [tr[0] - tl[0], tr[1] - tl[1]];
    // the card's sides run perpendicular to its top edge, down into the drawer
    let n = [-d[1], d[0]];
    if (n[1] < 0) n = [-n[0], -n[1]];
    const len = Math.hypot(n[0], n[1]);
    n = [n[0] / len, n[1] / len];
    const depth = 0.34;
    const bl = [tl[0] + n[0] * depth, tl[1] + n[1] * depth];
    const br = [tr[0] + n[0] * depth, tr[1] + n[1] * depth];

    // at rest the card sits low enough that the drawer's front hides it entirely;
    // taken, it rises by PULL out of the drawer
    const rest = frontY(tl[0]) - tl[1] + 0.012;
    const shift = lifted === i ? rest - PULL : rest;

    // its hover band runs from its own top edge to the next card's (or, for the
    // front card, down to the drawer's front edge)
    const next = CARDS[i + 1];
    const zone = next
      ? [tl, tr, next[1], next[0]]
      : [tl, tr, [tr[0], frontY(tr[0]) + 0.004], [tl[0], frontY(tl[0]) + 0.004]];

    return { quad: [tl, tr, br, bl], zone, shift };
  });

  return (
    <div className="relative w-full">
      <Image src={plate} alt={alt} fittingType="fit" className="h-auto w-full" />

      {/* the cards — only visible above the drawer front's line */}
      <div className="absolute inset-0" style={{ clipPath: VISIBLE }}>
        {cards.map((card, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${card.shift * 100}%)`,
              zIndex: i + 1,
              filter: lifted === i ? "drop-shadow(0 -4px 8px rgba(40,25,10,0.45))" : "none",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                clipPath: `polygon(${pct(card.quad)})`,
                background:
                  "linear-gradient(180deg, rgba(90,65,35,0.4) 0%, rgba(90,65,35,0) 4%), repeating-linear-gradient(180deg, rgba(120,90,55,0.14) 0px, rgba(120,90,55,0.14) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 9px), linear-gradient(180deg, #F3E9CF 0%, #E9DCC0 100%)",
              }}
            />
          </div>
        ))}
      </div>

      {/* invisible hover bands lying on the drawn cards */}
      {cards.map((card, i) => (
        <div
          key={i}
          aria-hidden="true"
          onPointerEnter={() => setLifted(i)}
          onPointerLeave={() => setLifted((current) => (current === i ? null : current))}
          className="absolute inset-0"
          style={{ clipPath: `polygon(${pct(card.zone)})`, zIndex: 20 + i }}
        />
      ))}
    </div>
  );
}
