// The organization plate: a bare desk and the stack of designed papers on it.
// Brush across the desk and the papers scatter over the whole surface;
// step away and the pile gathers itself back together.

// three paper designs — a letter, a botanical plate, a provisions ledger —
// cycled through the pile so no two neighbours look alike
const DESIGNS = [1, 2, 3, 1, 2, 3, 1, 2].map(
  (n) => `${import.meta.env.BASE_URL}plates/organization-paper-${n}.png`
);

// each paper's resting place in the pile, as x, y of the plate plus its
// slight resting tilt — a real stack is never quite squared away
export const PILE = [
  { x: 0.348, y: 0.298, r: -4.5 },
  { x: 0.356, y: 0.294, r: 3.0 },
  { x: 0.344, y: 0.302, r: -1.8 },
  { x: 0.358, y: 0.296, r: 5.2 },
  { x: 0.35, y: 0.292, r: -3.4 },
  { x: 0.354, y: 0.3, r: 2.0 },
  { x: 0.342, y: 0.295, r: -5.5 },
  { x: 0.357, y: 0.299, r: 4.0 },
];

export const PAPERS = DESIGNS.map((src, i) => ({ src, ...PILE[i] }));

// papers are this wide, as a fraction of the plate
export const PAPER_W = 0.3;

// the desktop region the papers scatter across, as x0, y0, x1, y1 of the plate
export const SCATTER_BOX = { x0: 0.04, y0: 0.05, x1: 0.62, y1: 0.58 };
