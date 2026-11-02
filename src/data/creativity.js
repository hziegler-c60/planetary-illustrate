// Measured from the creativity plate itself, so the brush paints on the sheet of
// the easel and picks colour from the dabs on the palette, and nowhere else.
export const BRUSH =
  "https://base44.app/api/apps/6ad6dfe75ae5eedefbd62633/files/mp/public/6ad6dfe75ae5eedefbd62633/dfdafa66a_creativity-brush.png";

// where the bristle tip sits inside the brush drawing, so the tip meets the cursor
export const BRUSH_TIP = [0.066, 0.929];

// the colour the brush carries before it has touched any dab
export const PAINT = "#4E7191";

// the sheet on the easel, as x0, y0, x1, y1 of the plate
export const CANVAS = [0.132, 0.203, 0.421, 0.574];

// the palette's dab area: centre and radii of the ellipse that holds them all
export const PALETTE = [0.658, 0.529, 0.105, 0.11];

// the dabs of paint on the palette: where each sits on the plate, and the colour
// it is drawn in (sampled from the plate). Passing the brush over a dab loads it
// with that colour; the nearest dab answers for the space between dabs.
export const WELLS = [
  { at: [0.713, 0.434], color: "#4A6B1E" }, // sap green
  { at: [0.745, 0.448], color: "#6B7226" }, // moss
  { at: [0.676, 0.456], color: "#4A4E7A" }, // midnight
  { at: [0.645, 0.473], color: "#A11C00" }, // vermilion
  { at: [0.613, 0.502], color: "#8B2700" }, // madder
  { at: [0.605, 0.52], color: "#AA1B00" }, // crimson
  { at: [0.634, 0.539], color: "#3A4CB0" }, // cobalt
  { at: [0.588, 0.546], color: "#2B46C0" }, // ultramarine
  { at: [0.627, 0.59], color: "#8A5A10" }, // ochre
  { at: [0.682, 0.624], color: "#5C4B2E" }, // umber
];
