import type { CellModel } from "@/lib/engine";

import { createSeededRandom, seedFromCellModel } from "./seed";

/** Row-major per-cell reveal rank in [0, 1] (0 = first to reveal). */
export type RevealOrder = Float32Array;

export interface CellRevealOrders {
  readonly cols: number;
  readonly rows: number;
  readonly dotReveal: RevealOrder;
  readonly morphReveal: RevealOrder;
  readonly colorReveal: RevealOrder;
}

function centerOutRank(
  col: number,
  row: number,
  cols: number,
  rows: number,
): number {
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const maxDist = Math.hypot(cx, cy) || 1;
  return Math.hypot(col - cx, row - cy) / maxDist;
}

function buildRandomRevealOrder(
  cols: number,
  rows: number,
  seed: number,
): RevealOrder {
  const count = cols * rows;
  const indices = Array.from({ length: count }, (_, i) => i);
  const random = createSeededRandom(seed);

  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = indices[i]!;
    indices[i] = indices[j]!;
    indices[j] = tmp;
  }

  const order = new Float32Array(count);
  const denom = Math.max(1, count - 1);
  for (let rank = 0; rank < count; rank++) {
    order[indices[rank]!] = rank / denom;
  }
  return order;
}

export function buildCellRevealOrders(cellModel: CellModel): CellRevealOrders {
  const { cols, rows } = cellModel;
  const count = cols * rows;

  const dotReveal = new Float32Array(count);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      dotReveal[row * cols + col] = centerOutRank(col, row, cols, rows);
    }
  }

  const baseSeed = seedFromCellModel(cellModel);
  const morphReveal = buildRandomRevealOrder(cols, rows, baseSeed ^ 0x9e3779b9);
  const colorReveal = buildRandomRevealOrder(cols, rows, baseSeed ^ 0x85ebca6b);

  return { cols, rows, dotReveal, morphReveal, colorReveal };
}

/** Maps global phase progress and per-cell rank to [0, 1] cell completion. */
export function cellPhaseProgress(
  phaseProgress: number,
  cellRank: number,
  spread = 0.35,
): number {
  const start = cellRank * (1 - spread);
  if (phaseProgress <= start) return 0;
  if (phaseProgress >= start + spread) return 1;
  return (phaseProgress - start) / spread;
}

export function easeOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) ** 3;
}
