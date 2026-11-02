import { useEffect, useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import MagnifyingGlass, { lensCircle } from "@/components/MagnifyingGlass";

const TELESCOPE =
  "https://base44.app/api/apps/6ad6dfe75ae5eedefbd62633/files/mp/public/6ad6dfe75ae5eedefbd62633/4682d00b8_observation-telescope-art.png";

// The observation plate: the naturalist's study, cut from its paper like every
// other gift. The field telescope rests in one corner, and the magnifier rides
// the cursor — inside the plate only — magnifying whatever it passes over: the
// plate under the lens is cut away so the enlargement is what shows through.
export default function ObservationSpecimen({ plate, alt }) {
  const boxRef = useRef(null);
  const [box, setBox] = useState(0);
  const [spot, setSpot] = useState(null); // {x, y} in plate pixels

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setBox(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // where the glass rests until the cursor comes to the plate
  const at = spot ?? { x: box * 0.56, y: box * 0.52 };
  const { r } = lensCircle(box);
  const mask = `radial-gradient(circle at ${at.x}px ${at.y}px, transparent 0, transparent ${Math.max(r - 2, 0)}px, #000 ${r}px, #000 100%)`;

  const handleMove = (event) => {
    const rect = boxRef.current.getBoundingClientRect();
    setSpot({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  return (
    <div
      ref={boxRef}
      onPointerMove={handleMove}
      data-pencil-stop="true"
      className="relative aspect-square w-full overflow-hidden"
    >
      <div className="absolute inset-0" style={{ WebkitMaskImage: mask, maskImage: mask }}>
        <Image src={plate} alt={alt} fittingType="fit" className="absolute inset-0 h-full w-full" />
        <Image
          src={TELESCOPE}
          alt=""
          fittingType="fit"
          className="absolute bottom-[2%] left-[1%] w-[30%] -rotate-6"
        />
      </div>

      {box > 0 && <MagnifyingGlass plate={plate} box={box} x={at.x} y={at.y} />}
    </div>
  );
}