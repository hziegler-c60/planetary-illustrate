// The knowledge plate: an open book — Asimov's The Collapsing Universe —
// and a leaf that turns with the cursor, narrowing to its edge and back,
// the way a real page does.

export const LEAF_IMG =
  `${import.meta.env.BASE_URL}plates/knowledge-leaf.png`;
export const LEAF_BACK_IMG =
  `${import.meta.env.BASE_URL}plates/knowledge-leaf-back.png`;

// the right page of the open book, which the leaf covers at rest:
// x, y, w, h as fractions of the plate
export const LEAF = [0.507, 0.121, 0.429, 0.736];

// the two text blocks of the open spread, as x0, y0, x1, y1 of the plate
export const PAGE_LEFT = [0.105, 0.19, 0.455, 0.79];
export const PAGE_RIGHT = [0.545, 0.19, 0.895, 0.79];

// text margins inside the leaf, as fractions of the leaf
export const LEAF_TEXT = [0.088, 0.094, 0.912, 0.906];

// one continuous excerpt from the closing chapter, reading straight across
// the four visible pages like a standard book — the leaf carries 217 on its
// face and 218 on its back; 219 waits underneath on the right for the turn
export const PAGES = {
  left: {
    num: "216",
    head: "ISAAC ASIMOV",
    text: `The black hole formed by all the matter of the universe is 25,000,000,000 light-years across — and that happens to be about the diameter of the actual universe we live in, as far as we know.`,
  },
  leafFront: {
    num: "217",
    head: "THE COLLAPSING UNIVERSE",
    text: `It is quite possible, then, that the entire universe is itself a black hole, as has been suggested by the physicist Kip Thorne.

If it is, then very likely it has always been a black hole and will always be a black hole.`,
  },
  leafBack: {
    num: "218",
    head: "ISAAC ASIMOV",
    text: `If that is so, we live within a black hole — and if we want to know what conditions are like in a black hole, provided it is extremely massive, we have but to look around.`,
  },
  right: {
    num: "219",
    head: "THE COLLAPSING UNIVERSE",
    text: `As the universe collapses, we might imagine the formation of any number of relatively small black holes — black holes within a black hole. In the last few seconds of final catastrophic collapse, when all the black holes coalesce into one cosmic black hole, the Schwarzschild radius springs outward to the extremity of the known universe.

And it may be that within it there is the possibility of explosion — the cosmic egg, at the very instant of formation, springing outward. And that is the big bang.`,
  },
};
