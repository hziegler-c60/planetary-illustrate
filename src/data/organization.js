// Measured from the organisation plate itself: the open drawer's inside, and the
// lines that cross it — the card edges standing in the drawer. Each file is the
// band of the plate between two neighbouring lines.
export const DRAWER = { xFrom: 0.24, xTo: 0.665 };

// For each file: the y of its top and bottom edge at the drawer's left and right
// ends, so a band can follow lines that are not level.
export const FILES = [
  { top: [0.303, 0.263], bottom: [0.317, 0.279] },
  { top: [0.317, 0.279], bottom: [0.338, 0.295] },
  { top: [0.338, 0.295], bottom: [0.35, 0.308] },
  { top: [0.35, 0.308], bottom: [0.363, 0.333] },
  { top: [0.363, 0.333], bottom: [0.368, 0.372] },
  { top: [0.368, 0.372], bottom: [0.397, 0.385] },
];

// how far a file's top edge travels out of the drawer, in plate pixels
export const LIFT = 40;
export const MAX_STRETCH = 6;