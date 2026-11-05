import { useEffect, useRef } from "react";
import { Image } from "@/components/ui/image";
import { BRUSH, BRUSH_TIP, CANVAS, PAINT, PALETTE, WELLS } from "@/data/creativity";

// The creativity plate: the easel with its half-finished study, and the artist's
// tools resting on the stool beside it. Here the cursor becomes the brush.
// Passing the brush over a dab on the palette loads it with that dab's colour —
// a spot of the colour rides beside the bristles so you can see what it carries —
// and the loaded colour is what it lays on the sheet of the easel. Dab the brush
// back in the wells and it leaves a little paint there too. The paint stays on
// for forty-five seconds from the first dab — the clock keeps running while you
// paint, it never resets — then it fades away.
const SPACING = 3; // px between dabs
const SHEET_DAB = 0.014; // dab radius on the sheet, of the plate's width
const WELLS_DAB = 0.009; // dab radius in the palette's wells
const HOLD = 45000; // ms the paint stays before it starts to fade
const DRY = 520; // ms before the faded paint is wiped away

export default function CreativitySpecimen({ plate, alt }) {
  const boxRef = useRef(null);
  const sheetRef = useRef(null);
  const wellsRef = useRef(null);
  const brushRef = useRef(null);
  const dotRef = useRef(null);
  const lastRef = useRef(null);
  const regionRef = useRef(null);
  const holdTimersRef = useRef({});
  const wipeTimersRef = useRef({});
  const colorRef = useRef(PAINT);

  const layerOf = (region) => (region === "sheet" ? sheetRef.current : wellsRef.current);

  const setColor = (color) => {
    colorRef.current = color;
    if (dotRef.current) dotRef.current.style.backgroundColor = color;
  };

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;
    const fit = (layer) => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      layer.width = Math.round(w * dpr);
      layer.height = Math.round(h * dpr);
      layer.style.width = `${w}px`;
      layer.style.height = `${h}px`;
      const ctx = layer.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
    };
    const resize = () => {
      fit(sheetRef.current);
      fit(wellsRef.current);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(box);
    return () => {
      observer.disconnect();
      clearTimeout(holdTimersRef.current.sheet);
      clearTimeout(holdTimersRef.current.wells);
      clearTimeout(wipeTimersRef.current.sheet);
      clearTimeout(wipeTimersRef.current.wells);
    };
  }, []);

  // the paint fades off the layer, then the layer is wiped clean
  const fade = (region) => {
    const layer = layerOf(region);
    if (!layer) return;
    layer.style.opacity = "0";
    clearTimeout(wipeTimersRef.current[region]);
    wipeTimersRef.current[region] = setTimeout(() => {
      const ctx = layer.getContext("2d");
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, layer.width, layer.height);
      ctx.restore();
      layer.style.opacity = "1";
      // still painting here? the next stroke begins a fresh forty-five seconds
      if (regionRef.current === region) {
        holdTimersRef.current[region] = setTimeout(() => {
          holdTimersRef.current[region] = null;
          fade(region);
        }, HOLD);
      }
    }, DRY);
  };

  // the clock starts on the first dab and never resets while the brush keeps
  // painting: HOLD ms after the start, the paint fades no matter what
  const startHold = (region) => {
    if (holdTimersRef.current[region]) return; // already counting
    holdTimersRef.current[region] = setTimeout(() => {
      holdTimersRef.current[region] = null;
      fade(region);
    }, HOLD);
  };

  const fresh = (region) => {
    const layer = layerOf(region);
    if (!layer) return;
    clearTimeout(wipeTimersRef.current[region]);
    layer.style.opacity = "1";
  };

  const handleMove = (event) => {
    const box = boxRef.current;
    const rect = box.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (brushRef.current) {
      brushRef.current.style.transform = `translate(${x}px, ${y}px)`;
      brushRef.current.style.opacity = "1";
    }
    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${x + 12}px, ${y - 22}px)`;
      dotRef.current.style.opacity = "1";
    }

    const u = x / rect.width;
    const v = y / rect.height;
    const onSheet = u >= CANVAS[0] && u <= CANVAS[2] && v >= CANVAS[1] && v <= CANVAS[3];
    const dx = (u - PALETTE[0]) / PALETTE[2];
    const dy = (v - PALETTE[1]) / PALETTE[3];
    const inWells = !onSheet && dx * dx + dy * dy <= 1;
    const region = onSheet ? "sheet" : inWells ? "wells" : null;

    // dipping into the palette loads the brush with the nearest dab's colour
    if (inWells) {
      let best = null;
      let bestDist = Infinity;
      for (const well of WELLS) {
        const d = (u - well.at[0]) ** 2 + (v - well.at[1]) ** 2;
        if (d < bestDist) {
          bestDist = d;
          best = well;
        }
      }
      if (best && best.color !== colorRef.current) setColor(best.color);
    }

    if (regionRef.current !== region) {
      regionRef.current = region;
      lastRef.current = null;
      if (region) {
        fresh(region);
        startHold(region);
      }
    }
    if (!region) return;

    const last = lastRef.current;
    if (last && Math.hypot(x - last.x, y - last.y) < SPACING) return;
    lastRef.current = { x, y };

    const ctx = layerOf(region).getContext("2d");
    ctx.globalAlpha = onSheet ? 0.55 : 0.45;
    ctx.fillStyle = colorRef.current;
    ctx.beginPath();
    ctx.arc(x, y, rect.width * (onSheet ? SHEET_DAB : WELLS_DAB), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  const leavePlate = () => {
    if (brushRef.current) brushRef.current.style.opacity = "0";
    if (dotRef.current) dotRef.current.style.opacity = "0";
    regionRef.current = null;
    lastRef.current = null;
  };

  return (
    <div
      ref={boxRef}
      onPointerMove={handleMove}
      onPointerEnter={() => {
        if (brushRef.current) brushRef.current.style.opacity = "1";
        if (dotRef.current) dotRef.current.style.opacity = "1";
      }}
      onPointerLeave={leavePlate}
      data-brush-cursor="true"
      className="relative w-full"
    >
      <Image src={plate} alt={alt} fittingType="fit" className="h-auto w-full" />
      <canvas
        ref={sheetRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
      />
      <canvas
        ref={wellsRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
      />
      <div
        ref={brushRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 w-[14%]"
        style={{ opacity: 0, willChange: "transform" }}
      >
        <Image
          src={BRUSH}
          alt=""
          fittingType="fit"
          className="w-full"
          style={{ transform: `translate(${-BRUSH_TIP[0] * 100}%, ${-BRUSH_TIP[1] * 100}%)` }}
        />
      </div>
      {/* the spot of colour the brush is carrying */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-3 w-3 rounded-full ring-1 ring-[#3d2c17]/60"
        style={{ opacity: 0, backgroundColor: PAINT, willChange: "transform" }}
      />
    </div>
  );
}
