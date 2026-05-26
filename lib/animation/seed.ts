import type { CellModel } from "@/lib/engine";

/** Deterministic 32-bit seed from grid geometry and sampled cell content. */
export function seedFromCellModel(cellModel: CellModel): number {
  const { cols, rows, cells } = cellModel;
  let h = (cols * 374761393) ^ (rows * 668265263);

  const sampleCoords: [number, number][] = [
    [0, 0],
    [0, cols - 1],
    [rows - 1, 0],
    [rows - 1, cols - 1],
    [Math.floor(rows / 2), Math.floor(cols / 2)],
  ];

  for (const [row, col] of sampleCoords) {
    const cell = cells[row]?.[col];
    if (!cell) continue;
    h = Math.imul(h ^ cell.char.charCodeAt(0), 2246822519);
    h = Math.imul(h ^ cell.color.r, 3266489917);
    h = Math.imul(h ^ cell.color.g, 668265263);
    h = Math.imul(h ^ cell.color.b, 374761393);
  }

  return h >>> 0;
}

/** Mulberry32 PRNG — fast, deterministic per seed. */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
