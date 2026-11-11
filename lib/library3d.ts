import type { BookId } from "./chapters";

// Dimensiones de la biblioteca 3D (unidades ≈ metros)
export const SHELF = {
  width: 8.4,
  height: 5.5,
  depth: 0.56,
  rows: 6,
  baseY: 0.32,
  rowH: 0.84,
  plank: 0.06,
  bays: 4,
};

export const LADDER = {
  baseZ: 1.55, // pie de la escalera (hacia la cámara)
  topZ: 0.62, // donde se apoya en el riel
  topY: 5.35,
};
export const LADDER_LEN = Math.hypot(LADDER.topY, LADDER.baseZ - LADDER.topZ);
export const LADDER_ANGLE = Math.atan2(LADDER.baseZ - LADDER.topZ, LADDER.topY);

export const rowBottom = (row: number) => SHELF.baseY + row * SHELF.rowH + SHELF.plank / 2;

export type Slot = { id: BookId; x: number; row: number; w: number; h: number; d: number; color: string };

// Los 6 libros con contenido, escondidos entre los demás
export const SLOTS: Slot[] = [
  { id: "sobre-mi", x: -3.05, row: 2, w: 0.17, h: 0.68, d: 0.44, color: "#C4561E" },
  { id: "proyectos", x: -1.15, row: 4, w: 0.19, h: 0.7, d: 0.44, color: "#2F7A64" },
  { id: "testimonios", x: 0.75, row: 3, w: 0.17, h: 0.66, d: 0.44, color: "#8E2F42" },
  { id: "experiencia", x: 2.45, row: 5, w: 0.18, h: 0.69, d: 0.44, color: "#3B5BA9" },
  { id: "certificados", x: 1.55, row: 1, w: 0.17, h: 0.67, d: 0.44, color: "#C1922F" },
  { id: "contacto", x: -2.2, row: 0, w: 0.17, h: 0.66, d: 0.44, color: "#6A4FA0" },
];

export const slotById = (id: BookId) => SLOTS.find((s) => s.id === id)!;

// Centro del libro en coordenadas del mundo
export const slotCenter = (s: Slot): [number, number, number] => [s.x, rowBottom(s.row) + s.h / 2, SHELF.depth / 2 - s.d / 2 + 0.02];

// PRNG determinista
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTE = ["#7d3f22", "#5b3423", "#2f5446", "#6b2a2a", "#9a6f33", "#3a4069", "#704f35", "#2b4a5c", "#8a5532", "#4a2f3f", "#5f6b3a", "#a2482c", "#244038", "#7a6a55"];

export type DecoBook = { x: number; y: number; z: number; w: number; h: number; d: number; tilt: number; color: string; band: boolean };

// Rellena cada fila con libros apretados, dejando hueco para los libros interactivos
export function buildDecoBooks(): DecoBook[] {
  const r = rng(17);
  const books: DecoBook[] = [];
  const bayW = SHELF.width / SHELF.bays;
  for (let row = 0; row < SHELF.rows; row++) {
    for (let bay = 0; bay < SHELF.bays; bay++) {
      const left = -SHELF.width / 2 + bay * bayW + 0.09;
      const right = left + bayW - 0.18;
      const reserved = SLOTS.filter((s) => s.row === row).map((s) => [s.x - s.w / 2 - 0.006, s.x + s.w / 2 + 0.006]);
      let x = left;
      // a veces un hueco al final con libros inclinados
      const end = right - (r() < 0.35 ? 0.25 + r() * 0.2 : 0);
      while (x < end) {
        const w = 0.055 + r() * 0.07;
        const hit = reserved.find(([a, b]) => x + w > a && x < b);
        if (hit) {
          x = hit[1] + 0.003;
          continue;
        }
        if (x + w > end) break;
        const h = 0.46 + r() * 0.26;
        const d = 0.32 + r() * 0.1;
        books.push({
          x: x + w / 2,
          y: rowBottom(row) + h / 2,
          z: SHELF.depth / 2 - d / 2 + 0.01 - r() * 0.03,
          w,
          h,
          d,
          tilt: 0,
          color: PALETTE[Math.floor(r() * PALETTE.length)],
          band: r() < 0.45,
        });
        x += w + 0.003;
      }
      // libro inclinado al final del grupo
      if (end < right && r() < 0.8) {
        const h = 0.5 + r() * 0.18;
        const w = 0.07;
        const tilt = -0.32;
        books.push({ x: end + 0.16, y: rowBottom(row) + (h / 2) * Math.cos(tilt) + 0.02, z: 0.06, w, h, d: 0.36, tilt, color: PALETTE[Math.floor(r() * PALETTE.length)], band: true });
      }
    }
  }
  return books;
}
