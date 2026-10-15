import { TEMPLATES, type TemplateId } from "@anonletter/shared";

/**
 * Room metadata the shared registry doesn't carry. The registry is the API contract
 * (the worker imports it); everything that is purely visual lives here.
 */
export interface Room {
  id: TemplateId;
  name: string;
  /** The use-case line revealed on card hover. Not a tagline. */
  useCase: string;
  /** Derived tokens. bg/accent/text come from the shared registry. */
  surface: string;
  muted: string;
  border: string;
  glow: string;
  /** Which ambient field this room runs. */
  ambient: "petals" | "dust" | "stars" | "botanical" | "confetti";
  /** Composed motif art, for picker cards and room corners. */
  /** Card gradient — the palette is the content, so the card shows the palette. */
  cardGradient: string;
  /** Greeting above the message on the reveal page. */
  greeting: string;
  /** Default signature when the writer leaves the hint blank. */
  signature: string;
  /** Left side of the reveal footer rail. */
  railNote: string;
  /** Reveal page headline. Null where the room leads with the message itself. */
  headline: string | null;
  /** True when the room's background is dark — flips texture blend and light. */
  dark: boolean;
}

export const ROOMS: Record<TemplateId, Room> = {
  "soft-bloom": {
    id: "soft-bloom",
    name: "Soft Bloom",
    useCase: "Confession · admiration",
    surface: "#fff7fa",
    muted: "#7d5464",
    border: "#f3d3de",
    glow: "rgba(240,160,186,0.16)",
    ambient: "petals",
    cardGradient: "linear-gradient(165deg,#fdf0f5 0%,#f6cbd9 60%,#e8a8c0 100%)",
    greeting: "For you",
    signature: "someone who noticed",
    railNote: "Anonymous · unstored",
    headline: null,
    dark: false,
  },
  "old-letter": {
    id: "old-letter",
    name: "Old Letter",
    useCase: "Apology · gratitude",
    surface: "#fbf0df",
    muted: "#6d5439",
    border: "#e3cdb0",
    glow: "rgba(196,151,106,0.16)",
    ambient: "dust",
    cardGradient: "linear-gradient(165deg,#fdf6ec 0%,#e8cfa8 60%,#c4976a 100%)",
    greeting: "Dear you,",
    signature: "someone who remembers",
    railNote: "Sealed · unsigned",
    headline: null,
    dark: false,
  },
  "night-thought": {
    id: "night-thought",
    name: "Night Thought",
    useCase: "Honest truth · 2am",
    surface: "#212344",
    muted: "#9297c2",
    border: "#33375e",
    glow: "rgba(139,144,208,0.18)",
    ambient: "stars",
    cardGradient: "linear-gradient(165deg,#1a1b2e 0%,#2a2d52 60%,#3a3d6e 100%)",
    greeting: "Been thinking of you",
    signature: "someone who wanted you to know",
    railNote: "Delivered once · nothing stored",
    headline: null,
    dark: true,
  },
  "quiet-garden": {
    id: "quiet-garden",
    name: "Quiet Garden",
    useCase: "Birthday · pride",
    surface: "#f4fbf7",
    muted: "#4c6640",
    border: "#c9e3d5",
    glow: "rgba(59,109,17,0.14)",
    ambient: "botanical",
    cardGradient: "linear-gradient(165deg,#eaf7f0 0%,#a9c99a 60%,#3b6d11 100%)",
    greeting: "So proud of you",
    signature: "someone proud of you",
    railNote: "Grown quietly · sent with care",
    headline: null,
    dark: false,
  },
  "confetti-love": {
    id: "confetti-love",
    name: "Confetti Love",
    useCase: "Celebration · hype",
    surface: "#fffdf6",
    muted: "#7a5c33",
    border: "#ecdcbb",
    glow: "rgba(232,201,154,0.2)",
    ambient: "confetti",
    cardGradient: "linear-gradient(165deg,#fff8e7 0%,#f2dcb6 60%,#e8c99a 100%)",
    greeting: "You did it!",
    signature: "someone celebrating you",
    railNote: "Burst once · then still",
    headline: null,
    dark: false,
  },
};

export const ROOM_LIST = Object.values(ROOMS);

export function room(id: TemplateId): Room {
  return ROOMS[id] ?? ROOMS["night-thought"];
}

export function template(id: TemplateId) {
  return TEMPLATES[id] ?? TEMPLATES["night-thought"];
}

/** Sample copy per room, used by the picker preview and the demo letter. */
export const SAMPLE_MESSAGE: Record<TemplateId, string> = {
  "soft-bloom":
    "I have admired you quietly for longer than is reasonable, and I've decided that saying it badly is better than not saying it at all.",
  "old-letter":
    "I owe you an apology that has been sitting in a drawer for two years. I am not asking for anything back. I only wanted the record to be honest.",
  "night-thought":
    "I keep drafting this at hours no one should be awake. You were kind to me when it cost you something, and I never said so. I'm saying it now, into the dark, where it's easier.",
  "quiet-garden":
    "You made it through a year that asked a great deal of you. Someone noticed, and thought the noticing should reach you.",
  "confetti-love":
    "Not a soul is surprised except you. Somebody wanted today to be loud about it, so here it is, loud.",
};
