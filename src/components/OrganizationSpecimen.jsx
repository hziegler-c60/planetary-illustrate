import { useState } from "react";
import { Image } from "@/components/ui/image";
import { CARDS, FRONT, PULL, SPRITES } from "@/data/organization";
import card1 from "@/assets/orgcards/card-1.png";
import card2 from "@/assets/orgcards/card-2.png";
import card3 from "@/assets/orgcards/card-3.png";
import card4 from "@/assets/orgcards/card-4.png";
import card5 from "@/assets/orgcards/card-5.png";
import card6 from "@/assets/orgcards/card-6.png";

// The organisation plate: the open card-catalogue drawer, kept exactly as drawn.
// The cards in it are the drawing's own paper, re-rendered as separate pieces;
// passing the cursor through the drawer pops each card up out of it, and the
// drawer's wooden front cuts it off at the same line that hides it in the
// drawing. Leave it, and it slides home.
const CARD_IMAGES = [card1, card2, card3, card4, card5, card6];

// y of the drawer line at a given x, following the measured polyline
// (extended with its end slopes beyond the measured span)
const frontY = (x) => {
  const seg = (a, b) => a[1] + ((x - a[0]) * (b[1] - a[1])) / (b[0] - a[0]);
  if (x < FRONT[0][0]) return seg(FRONT[1], FRONT[0]); // left wall, extended
  if (x < FRONT[1][0]) return seg(FRONT[0], FRONT[1]); // left wall
  return seg(FRONT[1], FRONT[2]); // front rim (extended right)
};

// the region above that line, extended to the plate's edges — the only place a
// pulled card may show
const VISIBLE = `polygon(0% 0%, 100% 0%, 100% ${frontY(1) * 100}%, ${FRONT[2][0] * 100}% ${
  FRONT[2][1] * 100
}%, ${FRONT[1][0] * 100}% ${FRONT[1][1] * 100}%, ${FRONT[0][0] * 100}% ${
  FRONT[0][1] * 100
}%, 0% ${frontY(0) * 100}%)`;

const pct = (pts) => pts.map(([x, y]) => `${x * 100}% ${y * 100}%`).join(", ");

export default function OrganizationSpecimen({ plate, alt }) {
  const [lifted, setLifted] = useState(null);

  const cards = CARDS.map(([tl, tr], i) => {
    // at rest the card sits low enough that the drawer's front hides it
    // entirely, wherever the rim line crosses its width; taken, it rises
    // straight up out of its own slot by PULL
    const slope = (tr[1] - tl[1]) / (tr[0] - tl[0]);
    const clearance = (x) => frontY(x) - (tl[1] + slope * (x - tl[0]));
    const span = [tl[0], tr[0], FRONT[1][0]].filter(
      (x, j) => j < 2 || (x > tl[0] && x < tr[0])
    );
    const rest = Math.max(...span.map(clearance)) + 0.012;
    const shift = lifted === i ? -PULL : rest;

    // its hover band runs from its own top edge to the next card's (or, for the
    // front card, down to the drawer's front edge)
    const next = CARDS[i + 1];
    const zone = next
      ? [tl, tr, next[1], next[0]]
      : [tl, tr, [tr[0], frontY(tr[0]) + 0.004], [tl[0], frontY(tl[0]) + 0.004]];

    return { zone, shift, sprite: CARD_IMAGES[i], place: SPRITES[i] };
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
            className="pointer-events-none absolute inset-0"
            style={{
              transform: `translateY(${card.shift * 100}%)`,
              transition: "transform 280ms cubic-bezier(0.34, 1.45, 0.64, 1)",
              zIndex: i + 1,
            }}
          >
            <img
              src={card.sprite}
              alt=""
              className="absolute h-auto"
              style={{
                left: `${card.place.left * 100}%`,
                top: `${card.place.top * 100}%`,
                width: `${card.place.width * 100}%`,
                filter:
                  lifted === i
                    ? "drop-shadow(0 -5px 9px rgba(40, 25, 10, 0.4))"
                    : "none",
                transition: "filter 280ms ease-out",
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
