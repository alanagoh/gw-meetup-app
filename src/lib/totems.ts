export interface Totem {
  id: string;
  name: string;
  emoji: string;
  grid: string[]; // '0' = empty, '1' = filled, '2' = eye/accent (rendered as bg cutout)
}

// 10 pixel art totems — 7 universal + 3 Singapore-themed
export const TOTEMS: Totem[] = [
  {
    id: "bot",
    name: "Bot",
    emoji: "~>",
    grid: [
      "00011000",
      "00111100",
      "01111110",
      "11111111",
      "11200211",
      "11111111",
      "01111110",
      "01000010",
      "01100110",
    ],
  },
  {
    id: "ghost",
    name: "Ghost",
    emoji: "^^",
    grid: [
      "00111100",
      "01111110",
      "11111111",
      "11111111",
      "11200211",
      "11111111",
      "11111111",
      "11011011",
      "10100101",
    ],
  },
  {
    id: "invader",
    name: "Invader",
    emoji: "##",
    grid: [
      "01000010",
      "00100100",
      "01111110",
      "11011011",
      "11111111",
      "01011010",
      "10000001",
      "01000010",
    ],
  },
  {
    id: "cat",
    name: "Cat",
    emoji: ":3",
    grid: [
      "10000001",
      "11000011",
      "11111111",
      "11200211",
      "11111111",
      "11011011",
      "01111110",
      "00100100",
    ],
  },
  {
    id: "skull",
    name: "Skull",
    emoji: "x_x",
    grid: [
      "01111110",
      "11111111",
      "11111111",
      "11200211",
      "11111111",
      "01111110",
      "01101101",
      "00111100",
    ],
  },
  {
    id: "octopus",
    name: "Octopus",
    emoji: "8=",
    grid: [
      "01111110",
      "11111111",
      "11200211",
      "11111111",
      "11111111",
      "11111111",
      "10101010",
      "01010101",
    ],
  },
  {
    id: "dragon",
    name: "Dragon",
    emoji: ">:",
    grid: [
      "110000011",
      "011111110",
      "111111111",
      "111020111",
      "111111111",
      "011111110",
      "101111101",
      "100101001",
    ],
  },
  // --- Singapore-themed ---
  {
    id: "merlion",
    name: "Merlion",
    emoji: "SG",
    grid: [
      "101111101",
      "111111111",
      "111111111",
      "111020111",
      "110111011",
      "111111111",
      "011111110",
      "001111100",
      "010101010",
    ],
  },
  {
    id: "durian",
    name: "Durian",
    emoji: "D:",
    grid: [
      "010010010",
      "101101101",
      "011111110",
      "111111111",
      "111020111",
      "111111111",
      "011111110",
      "001111100",
      "000010000",
    ],
  },
  {
    id: "orchid",
    name: "Orchid",
    emoji: "**",
    grid: [
      "000010000",
      "001111100",
      "010111010",
      "011111110",
      "111121111",
      "011111110",
      "010111010",
      "001111100",
      "000010000",
    ],
  },
];

// 14 pixel fill colors
export const PIXEL_COLORS = [
  { id: "claude-orange", hex: "#DC6B2F", name: "Claude" },
  { id: "electric-purple", hex: "#7C3AED", name: "Purple" },
  { id: "hot-pink", hex: "#EC4899", name: "Pink" },
  { id: "ocean-blue", hex: "#2563EB", name: "Blue" },
  { id: "emerald", hex: "#10B981", name: "Emerald" },
  { id: "crimson", hex: "#E11D48", name: "Crimson" },
  { id: "golden", hex: "#F59E0B", name: "Golden" },
  { id: "teal", hex: "#0891B2", name: "Teal" },
  { id: "lavender", hex: "#8B5CF6", name: "Lavender" },
  { id: "coral", hex: "#F97316", name: "Coral" },
  { id: "sky", hex: "#0EA5E9", name: "Sky" },
  { id: "lime", hex: "#84CC16", name: "Lime" },
  { id: "magenta", hex: "#D946EF", name: "Magenta" },
  { id: "mint", hex: "#34D399", name: "Mint" },
];

// 10 background colors (dark tones)
export const BG_COLORS = [
  { id: "void", hex: "#0A0A0F", name: "Void" },
  { id: "navy", hex: "#0F172A", name: "Navy" },
  { id: "grape", hex: "#1E1035", name: "Grape" },
  { id: "midnight", hex: "#0C1222", name: "Midnight" },
  { id: "charcoal", hex: "#1C1C1C", name: "Charcoal" },
  { id: "deep-teal", hex: "#042F2E", name: "Teal" },
  { id: "wine", hex: "#2D0709", name: "Wine" },
  { id: "forest", hex: "#052E16", name: "Forest" },
  { id: "storm", hex: "#1E293B", name: "Storm" },
  { id: "amber", hex: "#2D1B00", name: "Amber" },
];
