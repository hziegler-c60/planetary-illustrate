// The five gifts of "Illustrate" — a planetary responsibility.
// Each gift carries two applicable vocations and five small, measurable practices.

export const CENTRAL_IMAGE =
  "/plates/cover.png";

export const PROJECT_WORD = "to illustrate";

export const gifts = [
  {
    id: "knowledge",
    name: "Knowledge",
    specimen: "Leather-bound reference volumes",
    image:
      "/plates/knowledge-cutout.png",
    // the artwork carries no paper of its own, so it lies straight on the page
    cutout: true,
    jobs: ["Data Analyst", "Reference Librarian"],
    actions: [
      "Verify one fact before you repeat it.",
      "Write down one thing you learned — and where you learned it.",
      "Teach one person one thing you already know.",
      "Read one page outside your own field.",
      "Correct one of your own notes that has gone out of date.",
    ],
  },
  {
    id: "creativity",
    name: "Creativity",
    specimen: "Half-finished study on the easel, with the artist's tools",
    image:
      "/plates/creativity-easel.png",
    // the artwork carries no paper of its own, so it lies straight on the page
    cutout: true,
    jobs: ["UI/UX Designer", "Library Programming & Outreach Coordinator"],
    actions: [
      "Write one short poem — even a single line.",
      "Offer one alternative to a decision already made.",
      "Finish one thing instead of polishing it further.",
      "Show one person something you made.",
      "Spend ten minutes creating something.",
    ],
  },
  {
    id: "observation",
    name: "Observation",
    specimen: "Naturalist's plate, with magnifier & telescope",
    image:
      "/plates/observation-animal-plate.png",
    // the artwork carries no paper of its own, so it lies straight on the page
    cutout: true,
    jobs: ["UX Researcher", "Archivist"],
    actions: [
      "Draw one thing you saw today from memory, then check it against the real thing.",
      "Pick one object you use daily and find three details you had never noticed about it.",
      "Ask a question whose answer you genuinely do not know.",
      "Stop once today and name three sounds you can hear but had stopped noticing.",
      "Describe one thing you saw today in a single sentence.",
    ],
  },
  {
    id: "storytelling",
    name: "Storytelling",
    specimen: "Quill, inkwell & oil lantern",
    image:
      "/plates/storytelling-cutout.png",
    // the artwork carries no paper of its own, so it lies straight on the page
    cutout: true,
    jobs: ["Data Visualization Developer", "Digital Collections Curator"],
    actions: [
      "Tell one person one true thing that happened today.",
      "Turn one number into a sentence someone can picture.",
      "Read one page aloud to hear where it fails.",
      "Write down one story someone told you, in their own words.",
      "Give one thing you did today a beginning, a middle and an end.",
    ],
  },
  {
    id: "organization",
    name: "Organization",
    specimen: "Antique card-catalog drawer",
    image:
      "/plates/catalogue-cutout.png",
    // the artwork carries no paper of its own, so it lies straight on the page
    cutout: true,
    jobs: ["Information Architect", "Metadata & Cataloging Librarian"],
    actions: [
      "Put one thing back where it belongs.",
      "Name one file so a stranger could find it.",
      "Delete one thing you will never use again.",
      "Clear one surface before you sleep.",
      "Move one thing out of your head and onto paper.",
    ],
  },
];

export const getGift = (id) => gifts.find((g) => g.id === id);