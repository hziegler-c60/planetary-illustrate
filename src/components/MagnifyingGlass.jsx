import { Image } from "@/components/ui/image";

const MAGNIFIER =
  "https://base44.app/api/apps/6ad6dfe75ae5eedefbd62633/files/mp/public/6ad6dfe75ae5eedefbd62633/d2fe35a05_observation-magnifier-art.png";

// where the round lens sits inside the magnifier drawing, as a fraction of it
const LENS = { cx: 0.434, cy: 0.389, r: 0.196 };
const MAG_SPAN = 0.66; // magnifier width, as a fraction of the plate's width
const ZOOM = 2;

// the circle the glass magnifies, and where that circle sits in the drawing
export const lensCircle = (box) => {
  const span = box * MAG_SPAN;
  return { span, r: span * LENS.r * 0.98, cx: LENS.cx * span, cy: LENS.cy * span };
};

// The glass: the plate drawn a second time at twice the size under its lens, so
// the glass is see-through and only the enlargement shows through it — with a
// whisper of the glass' own pencil left over the top.
export default function MagnifyingGlass({ plate, box, x, y }) {
  const { span, r } = lensCircle(box);

  return (
    <>
      <div
        className="absolute overflow-hidden rounded-full"
        style={{ left: x - r, top: y - r, width: r * 2, height: r * 2 }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${plate})`,
            backgroundSize: `${box * ZOOM}px ${box * ZOOM}px`,
            backgroundPosition: `${r - x * ZOOM}px ${r - y * ZOOM}px`,
            backgroundRepeat: "no-repeat",
          }}
        />
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="lens-veil" cx="50%" cy="50%" r="50%">
              <stop offset="45%" stopColor="#8B4513" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#8B4513" stopOpacity="0.14" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="50" fill="url(#lens-veil)" />
          <path
            d="M 12 44 A 48 48 0 0 1 44 12"
            fill="none"
            stroke="#6B5A44"
            strokeOpacity="0.18"
            strokeWidth="1"
          />
          <path
            d="M 22 52 A 34 34 0 0 1 52 22"
            fill="none"
            stroke="#6B5A44"
            strokeOpacity="0.12"
            strokeWidth="0.8"
          />
        </svg>
      </div>

      <Image
        src={MAGNIFIER}
        alt=""
        fittingType="fit"
        className="pointer-events-none absolute"
        style={{ left: x - LENS.cx * span, top: y - LENS.cy * span, width: span, height: span }}
      />
    </>
  );
}