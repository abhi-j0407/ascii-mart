import { describe, expect, it } from "vitest";

import type { CellModel } from "@/lib/engine";
import { DOT_GRID_CHAR } from "@/lib/render/states";

import { computeExportCanvasSize, EXPORT_CELL_HEIGHT_PX } from "../png";
import { cellModelToStateText } from "../txt";

function stubCellModel(
  cols: number,
  rows: number,
  cellWidth = 10,
  cellHeight = 20,
): CellModel {
  const cells = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      char: String.fromCharCode(33 + ((row + col) % 94)),
      color: { r: 1, g: 2, b: 3 },
      isEdge: false,
    })),
  );
  return { cols, rows, cellWidth, cellHeight, cells };
}

describe("computeExportCanvasSize", () => {
  it("scales grid by fixed export cell height and model aspect", () => {
    const model = stubCellModel(4, 2, 10, 20);
    const size = computeExportCanvasSize(model);
    const cellWidth = EXPORT_CELL_HEIGHT_PX * (10 / 20);

    expect(size.cellHeight).toBe(EXPORT_CELL_HEIGHT_PX);
    expect(size.cellWidth).toBe(cellWidth);
    expect(size.width).toBe(Math.round(4 * cellWidth));
    expect(size.height).toBe(Math.round(2 * EXPORT_CELL_HEIGHT_PX));
  });
});

describe("cellModelToStateText", () => {
  it("uses dots for dot-grid state", () => {
    const model = stubCellModel(2, 2);
    const text = cellModelToStateText(model, "dot-grid");
    expect(text).toBe("..\n..");
    expect(text).not.toContain(model.cells[0]![0]!.char);
  });

  it("uses matched glyphs for mono", () => {
    const model = stubCellModel(2, 1);
    const text = cellModelToStateText(model, "mono");
    expect(text).toBe(
      `${model.cells[0]![0]!.char}${model.cells[0]![1]!.char}`,
    );
  });

  it("matches glyphForState for every cell in color state", () => {
    const model = stubCellModel(3, 2);
    const lines = cellModelToStateText(model, "color").split("\n");
    expect(lines).toHaveLength(2);
    for (let row = 0; row < model.rows; row++) {
      let line = "";
      for (let col = 0; col < model.cols; col++) {
        line += model.cells[row]![col]!.char;
      }
      expect(lines[row]).toBe(line);
    }
    expect(DOT_GRID_CHAR).toBe(".");
  });
});
