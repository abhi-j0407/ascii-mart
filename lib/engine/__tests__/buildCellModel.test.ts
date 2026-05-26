import { beforeAll, describe, expect, it } from "vitest";

import { buildCellModel, cellModelToAscii } from "../buildCellModel";
import type { GlyphAtlas } from "../types";
import {
  buildTestAtlas,
  createCircleImage,
  createHalfPlaneImage,
  createTestImageData,
  setupEngineTests,
} from "./helpers";
import { asImageData } from "./imageData";

describe("buildCellModel", () => {
  let atlas: GlyphAtlas;

  beforeAll(() => {
    setupEngineTests();
    atlas = buildTestAtlas();
  });

  it("marks edge cells and overrides fill glyphs on a vertical boundary", () => {
    const image = asImageData(createHalfPlaneImage(120, 80));
    const model = buildCellModel(image, {
      density: 30,
      atlas,
      contrastExponent: 1,
      edgeThreshold: 0.1,
    });

    const midCol = Math.floor(model.cols / 2);
    const edgeCells = model.cells
      .map((row) => row[midCol]!)
      .filter((cell) => cell.isEdge);

    expect(edgeCells.length).toBeGreaterThan(0);
    expect(edgeCells.some((cell) => cell.char === "|")).toBe(true);
  });

  it("keeps fill glyphs where edge strength is below threshold", () => {
    const image = asImageData(
      createTestImageData(80, 60, () => [128, 128, 128] as const),
    );
    const model = buildCellModel(image, {
      density: 15,
      atlas,
      edgeThreshold: 0.99,
    });
    expect(model.cells.every((row) => row.every((cell) => !cell.isEdge))).toBe(
      true,
    );
  });

  it("attaches per-cell average colors", () => {
    const image = asImageData(
      createTestImageData(40, 40, (x) => {
        const v = x < 20 ? 255 : 0;
        return [v, 0, 0] as const;
      }),
    );
    const model = buildCellModel(image, {
      density: 2,
      cellAspect: 1,
      atlas,
      edgeThreshold: 0.99,
    });
    const left = model.cells[0]![0]!.color;
    const right = model.cells[0]![1]!.color;
    expect(left.r).toBeGreaterThan(200);
    expect(right.r).toBeLessThan(10);
  });

  it("renders circle contours with directional edge glyphs", () => {
    const image = asImageData(createCircleImage(120, 60, 60, 45));
    const ascii = cellModelToAscii(
      buildCellModel(image, {
        density: 40,
        atlas,
        contrastExponent: 2,
        edgeThreshold: 0.12,
      }),
    );
    expect(ascii).toMatch(/[|/\\-]/);
    expect(ascii).toMatch(/[@#+ .:-]/);
  });
});
