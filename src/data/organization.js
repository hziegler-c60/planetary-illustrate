// Measured from the catalogue plate itself: the open drawer's front edge, and the
// top edge of every card standing in the drawer — each card a line stepping
// down-right toward the viewer, just as drawn.

// the top edge of the drawer's front panel: [left], [right] — anything below this
// line is inside the drawer, hidden behind its wooden face
export const FRONT = [
  [0.371, 0.457],
  [0.76, 0.525],
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

// how far a card travels up out of the drawer when the cursor takes it, as a
// fraction of the plate's width
export const PULL = 0.15;
