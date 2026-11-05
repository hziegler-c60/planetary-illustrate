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
  { x: 0.318, y: 0.108, r: -4.5 },
  { x: 0.326, y: 0.104, r: 3.0 },
  { x: 0.314, y: 0.112, r: -1.8 },
  { x: 0.328, y: 0.106, r: 5.2 },
  { x: 0.32, y: 0.102, r: -3.4 },
  { x: 0.324, y: 0.11, r: 2.0 },
  { x: 0.312, y: 0.105, r: -5.5 },
  { x: 0.327, y: 0.109, r: 4.0 },
];

export const PAPERS = DESIGNS.map((src, i) => ({ src, ...PILE[i] }));

// papers are this wide, as a fraction of the plate
export const PAPER_W = 0.3;

// the desktop region the papers scatter across, as x0, y0, x1, y1 of the plate
export const SCATTER_BOX = { x0: 0.04, y0: 0.04, x1: 0.62, y1: 0.26 };
