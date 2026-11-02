import { useEffect, useRef } from "react";
import { Image } from "@/components/ui/image";
import { BRUSH, BRUSH_TIP, CANVAS, PAINT, PALETTE } from "@/data/creativity";

// The creativity plate: the easel with its half-finished study, and the artist's
// tools resting on the stool beside it. Here the cursor becomes the brush, and it
// lays paint on the sheet of the easel and in the wells of the palette — all of it
// in the one colour the brush itself is drawn in. The paint belongs to whichever
// of the two the brush is standing in: leave it, and the paint dries off.
const SPACING = 3; // px between dabs
const SHEET_DAB = 0.014; // dab radius on the sheet, of the plate's width
const WELLS_DAB = 0.009; // dab radius in the palette's wells
const DRY = 520; // ms before the dried paint is wiped away

export default function CreativitySpecimen({ plate, alt }) {
  const boxRef = useRef(null);
  const sheetRef = useRef(null);
  const wellsRef = useRef(null);
  const brushRef = useRef(null);
  const lastRef = useRef(null);
  const regionRef = useRef(null);
  const timersRef = useRef({});

  const layerOf = (region) => (region === "sheet" ? sheetRef.current : wellsRef.current);

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
      clearTimeout(timersRef.current.sheet);
      clearTimeout(timersRef.current.wells);
    };
  }, []);

  // the paint fades off where the brush has left it, then the layer is wiped clean
  const dry = (region) => {
    const layer = layerOf(region);
    if (!layer) return;
    layer.style.opacity = "0";
    clearTimeout(timersRef.current[region]);
    timersRef.current[region] = setTimeout(() => {
      const ctx = layer.getContext("2d");
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, layer.width, layer.height);
      ctx.restore();
      layer.style.opacity = "1";
    }, DRY);
  };

  const fresh = (region) => {
    const layer = layerOf(region);
    if (!layer) return;
    clearTimeout(timersRef.current[region]);
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

    const u = x / rect.width;
    const v = y / rect.height;
    const onSheet = u >= CANVAS[0] && u <= CANVAS[2] && v >= CANVAS[1] && v <= CANVAS[3];
    const dx = (u - PALETTE[0]) / PALETTE[2];
    const dy = (v - PALETTE[1]) / PALETTE[3];
    const inWells = !onSheet && dx * dx + dy * dy <= 1;
    const region = onSheet ? "sheet" : inWells ? "wells" : null;

    if (regionRef.current !== region) {
      const left = regionRef.current;
      regionRef.current = region;
      lastRef.current = null;
      if (left) dry(left);
      if (region) fresh(region);
    }
    if (!region) return;

    const last = lastRef.current;
    if (last && Math.hypot(x - last.x, y - last.y) < SPACING) return;
    lastRef.current = { x, y };

    const ctx = layerOf(region).getContext("2d");
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = PAINT;
    ctx.beginPath();
    ctx.arc(x, y, rect.width * (onSheet ? SHEET_DAB : WELLS_DAB), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  const leavePlate = () => {
    if (brushRef.current) brushRef.current.style.opacity = "0";
    const left = regionRef.current;
    regionRef.current = null;
    lastRef.current = null;
    if (left) dry(left);
  };

  return (
    <div
      ref={boxRef}
      onPointerMove={handleMove}
      onPointerEnter={() => {
        if (brushRef.current) brushRef.current.style.opacity = "1";
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
    </div>
  );
}