import { describe, expect, it } from "vitest";

import type { Cell, CellModel } from "@/lib/engine";

import {
  buildCellRevealOrders,
  cellPhaseProgress,
} from "../reveal";
import { seedFromCellModel } from "../seed";

function stubCellModel(cols: number, rows: number): CellModel {
  const cells = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      char: String.fromCharCode(33 + ((row * cols + col) % 90)),
      color: { r: row * 10, g: col * 10, b: 128 },
      isEdge: false,
    })),
  );
  return { cols, rows, cellWidth: 8, cellHeight: 16, cells };
}

describe("seedFromCellModel", () => {
  it("is stable for the same model", () => {
    const model = stubCellModel(5, 5);
    expect(seedFromCellModel(model)).toBe(seedFromCellModel(model));
  });

  it("changes when cell content changes", () => {
    const a = stubCellModel(5, 5);
    const b = stubCellModel(5, 5);
    const cells: Cell[][] = b.cells.map((row, rowIndex) =>
      row.map((cell, colIndex): Cell =>
        rowIndex === 2 && colIndex === 2
          ? { char: "Z", color: { r: 1, g: 2, b: 3 }, isEdge: false }
          : cell,
      ),
    );
    const altered: CellModel = { ...b, cells };
    expect(seedFromCellModel(a)).not.toBe(seedFromCellModel(altered));
  });
});

describe("buildCellRevealOrders", () => {
  it("orders center-out: center reveals before corners", () => {
    const model = stubCellModel(5, 5);
    const orders = buildCellRevealOrders(model);
    const center = orders.dotReveal[2 * 5 + 2]!;
    const corner = orders.dotReveal[0]!;
    expect(center).toBeLessThan(corner);
  });

  it("produces identical morph/color orders for the same model", () => {
    const model = stubCellModel(8, 6);
    const a = buildCellRevealOrders(model);
    const b = buildCellRevealOrders(model);
    expect([...a.morphReveal]).toEqual([...b.morphReveal]);
    expect([...a.colorReveal]).toEqual([...b.colorReveal]);
  });

  it("uses different orderings for morph vs color", () => {
    const model = stubCellModel(6, 6);
    const orders = buildCellRevealOrders(model);
    const morph = [...orders.morphReveal];
    const color = [...orders.colorReveal];
    expect(morph).not.toEqual(color);
  });
});

describe("cellPhaseProgress", () => {
  it("returns 0 before the cell window and 1 after", () => {
    expect(cellPhaseProgress(0.1, 0.5, 0.35)).toBe(0);
    expect(cellPhaseProgress(1, 0.5, 0.35)).toBe(1);
  });

  it("ramps linearly inside the spread window", () => {
    const rank = 0.5;
    const spread = 0.35;
    const start = rank * (1 - spread);
    const mid = start + spread / 2;
    expect(cellPhaseProgress(mid, rank, spread)).toBeCloseTo(0.5, 5);
  });
});
