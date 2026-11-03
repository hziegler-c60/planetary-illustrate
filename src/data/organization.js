// Measured from the catalogue plate itself: the open drawer's front edge, and the
// top edge of every card standing in the drawer — each card a line stepping
// down-right toward the viewer, just as drawn.

// the line that hides the cards, measured on the plate: from the back of the
// drawer's left wall, to the front-left corner, then along the front panel's
// top rim to the front-right corner — anything below is inside the drawer
export const FRONT = [
  [0.3799, 0.458], // left wall, up toward the back
  [0.4395, 0.5195], // front-left corner of the drawer
  [0.7422, 0.4786], // front-right corner
];

// each card's top edge: [left end], [right end], back card first
export const CARDS = [
  [
    [0.408, 0.432],
    [0.518, 0.422],
  ],
  [
    [0.428, 0.443],
    [0.552, 0.434],
  ],
  [
    [0.447, 0.455],
    [0.586, 0.445],
  ],
  [
    [0.467, 0.466],
    [0.62, 0.457],
  ],
  [
    [0.487, 0.474],
    [0.654, 0.467],
  ],
  [
    [0.503, 0.481],
    [0.693, 0.477],
  ],
];

// where each rendered card sprite sits on the plate (left, top, width, as
// fractions of the plate) — the sprites are drawn from the plate's own paper
export const SPRITES = [
  { left: 0.396, top: 0.398, width: 0.1338 },
  { left: 0.416, top: 0.409, width: 0.1475 },
  { left: 0.435, top: 0.421, width: 0.1631 },
  { left: 0.455, top: 0.432, width: 0.1768 },
  { left: 0.475, top: 0.44, width: 0.1904 },
  { left: 0.491, top: 0.447, width: 0.2139 },
];

// how far a card travels up out of the drawer when the cursor takes it, as a
// fraction of the plate's width
export const PULL = 0.15;
