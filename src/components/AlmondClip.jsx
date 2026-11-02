import { EYE_OPENING_01 } from "@/data/eyeOpening";

// Hidden SVG defs that define the eyelid opening as a clip path, shared by the
// 3D eyeball (which clips to it) so the sphere only renders inside the lid gap.
// The outline is traced from the drawn lid art itself — see eyeOpening — so the
// eyeball's edge is the lid's own line. objectBoundingBox units scale the path
// to whatever element clips to it.
export default function AlmondClip() {
  return (
    <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        <clipPath id="eye-opening" clipPathUnits="objectBoundingBox">
          <path d={EYE_OPENING_01} />
        </clipPath>
      </defs>
    </svg>
  );
}