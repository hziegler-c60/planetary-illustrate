// Measured from the catalogue plate itself: the open drawer's rim, and the
// top edge of every card standing in the drawer — each card running from its
// stepped left corner all the way right to the drawer's side wall.

// the line that hides the cards: from the back of the drawer's left wall, to
// the front-left corner, then along the front panel's top rim to the
// front-right corner — anything below is inside the drawer
export const FRONT = [
  [0.3799, 0.458], // left wall, up toward the back
  [0.4395, 0.5195], // front-left corner of the drawer
  [0.7422, 0.4786], // front-right corner
];

// each card's top edge: [left end], [right end at the side wall], back first
export const CARDS = [
  [
    [0.39, 0.406],
    [0.621, 0.4],
  ],
  [
    [0.395, 0.415],
    [0.63, 0.407],
  ],
  [
    [0.4, 0.423],
    [0.638, 0.416],
  ],
  [
    [0.408, 0.432],
    [0.646, 0.424],
  ],
  [
    [0.428, 0.443],
    [0.656, 0.434],
  ],
  [
    [0.447, 0.455],
    [0.666, 0.444],
  ],
  [
    [0.467, 0.466],
    [0.676, 0.455],
  ],
  [
    [0.487, 0.474],
    [0.684, 0.463],
  ],
  [
    [0.503, 0.481],
    [0.693, 0.476],
  ],
];

// where each rendered card sprite sits on the plate (left, top, width, as
// fractions of the plate) — the sprites are drawn from the plate's own paper
export const SPRITES = [
  { left: 0.378, top: 0.372, width: 0.255 },
  { left: 0.383, top: 0.381, width: 0.259 },
  { left: 0.388, top: 0.389, width: 0.262 },
  { left: 0.396, top: 0.398, width: 0.262 },
  { left: 0.416, top: 0.409, width: 0.252 },
  { left: 0.435, top: 0.421, width: 0.243 },
  { left: 0.455, top: 0.432, width: 0.233 },
  { left: 0.475, top: 0.44, width: 0.221 },
  { left: 0.491, top: 0.447, width: 0.214 },
];

// how far a card travels up out of the drawer when the cursor takes it, as a
// fraction of the plate's width
export const PULL = 0.15;

// how far the pulled card tips back toward the rear of the drawer, in degrees
export const TILT = -4;

// the stack's left boundary (the card corners stepping down-right) and the
// back edge of the drawer opening — the hover bands fill everything between
export const STACK_LEFT = [
  [0.386, 0.404],
  [0.503, 0.481],
];
export const STACK_BACK = 0.396;
