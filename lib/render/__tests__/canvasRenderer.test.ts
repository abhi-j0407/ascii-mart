import { describe, expect, it } from "vitest";

import type { CellModel } from "@/lib/engine";

import {
  computeLetterbox,
  contentAspectFromCellModel,
} from "../canvasRenderer";
import { glyphFillStyle, glyphForState } from "../states";

function stubCellModel(
  cols: number,
  rows: number,
  cellWidth = 10,
  cellHeight = 20,
): CellModel {
  const cells = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      char: "@",
      color: { r: 10, g: 20, b: 30 },
      isEdge: false,
    })),
  );
  return { cols, rows, cellWidth, cellHeight, cells };
}

describe("computeLetterbox", () => {
  it("fits wide content with vertical letterboxing", () => {
    const frame = computeLetterbox({ width: 200, height: 100 }, 2);
    expect(frame.width).toBe(200);
    expect(frame.height).toBe(100);
    expect(frame.x).toBe(0);
    expect(frame.y).toBe(0);
  });

  it("fits tall content with horizontal letterboxing", () => {
    const frame = computeLetterbox({ width: 100, height: 200 }, 0.5);
    expect(frame.width).toBe(100);
    expect(frame.height).toBe(200);
    expect(frame.x).toBe(0);
    expect(frame.y).toBe(0);
  });

  it("centers content that does not fill the viewport", () => {
    const frame = computeLetterbox({ width: 100, height: 100 }, 2);
    expect(frame.width).toBe(100);
    expect(frame.height).toBe(50);
    expect(frame.x).toBe(0);
    expect(frame.y).toBe(25);
  });
});

describe("contentAspectFromCellModel", () => {
  it("uses grid pixel dimensions", () => {
    const model = stubCellModel(4, 2, 10, 20);
    expect(contentAspectFromCellModel(model)).toBe((4 * 10) / (2 * 20));
  });
});

describe("state glyph derivation", () => {
  const cell = {
    char: "#",
    color: { r: 255, g: 128, b: 0 },
    isEdge: true,
  };

  it("dot grid always uses a period", () => {
    expect(glyphForState("dot-grid", cell)).toBe(".");
  });

  it("mono uses the matched glyph", () => {
    expect(glyphForState("mono", cell)).toBe("#");
  });

  it("color uses per-cell rgb", () => {
    expect(glyphFillStyle("color", cell)).toBe("rgb(255, 128, 0)");
  });

  it("mono uses neutral ink", () => {
    expect(glyphFillStyle("mono", cell)).toBe("#171717");
  });
});
