import { describe, expect, it } from "vitest";

import {
  aggregateCellEdges,
  computePixelEdgeMap,
  gradientAngleToGlyph,
  normalizeEdgeMagnitudes,
} from "../edges";
import { imageDataToLuminance } from "../luminance";
import { computeGridDimensions } from "../sampling";
import {
  createHalfPlaneImage,
  createTestImageData,
  setupEngineTests,
} from "./helpers";
import { asImageData } from "./imageData";

describe("gradientAngleToGlyph", () => {
  it("maps horizontal gradients to vertical edge glyphs", () => {
    expect(gradientAngleToGlyph(0)).toBe("|");
    expect(gradientAngleToGlyph(Math.PI)).toBe("|");
  });

  it("maps vertical gradients to horizontal edge glyphs", () => {
    expect(gradientAngleToGlyph(Math.PI / 2)).toBe("-");
    expect(gradientAngleToGlyph(-Math.PI / 2)).toBe("-");
  });

  it("maps diagonal gradients to slash glyphs", () => {
    expect(gradientAngleToGlyph(-Math.PI / 4)).toBe("/");
    expect(gradientAngleToGlyph(Math.PI / 4)).toBe("\\");
  });
});

describe("edge detection on synthetic images", () => {
  it("flags a strong vertical boundary with | overrides", () => {
    setupEngineTests();
    const image = asImageData(createHalfPlaneImage(120, 80));
    const luminance = imageDataToLuminance(image);
    const edgeMap = normalizeEdgeMagnitudes(
      computePixelEdgeMap(luminance, image.width, image.height),
    ).map;
    const grid = computeGridDimensions(image.width, image.height, 30, 0.5);
    const cellEdges = aggregateCellEdges(edgeMap, grid, 0.1);

    const midCol = Math.floor(grid.cols / 2);
    const edgeGlyphs = new Set<string>();
    for (const row of cellEdges) {
      const edge = row[midCol];
      if (edge) {
        edgeGlyphs.add(edge.glyph);
      }
    }
    expect(edgeGlyphs.has("|")).toBe(true);
  });

  it("does not mark uniform regions as edges at a high threshold", () => {
    const image = asImageData(
      createTestImageData(80, 60, () => [128, 128, 128] as const),
    );
    const luminance = imageDataToLuminance(image);
    const edgeMap = normalizeEdgeMagnitudes(
      computePixelEdgeMap(luminance, image.width, image.height),
    ).map;
    const grid = computeGridDimensions(image.width, image.height, 20, 0.5);
    const cellEdges = aggregateCellEdges(edgeMap, grid, 0.5);
    const anyEdge = cellEdges.some((row) => row.some((cell) => cell !== null));
    expect(anyEdge).toBe(false);
  });

  it("picks up a horizontal edge with - glyphs", () => {
    const image = asImageData(
      createTestImageData(100, 80, (_x, y) => {
        const v = y < 40 ? 255 : 0;
        return [v, v, v] as const;
      }),
    );
    const luminance = imageDataToLuminance(image);
    const edgeMap = normalizeEdgeMagnitudes(
      computePixelEdgeMap(luminance, image.width, image.height),
    ).map;
    const grid = computeGridDimensions(image.width, image.height, 25, 0.5);
    const cellEdges = aggregateCellEdges(edgeMap, grid, 0.12);
    const midRow = Math.floor(grid.rows / 2);
    const glyphs = cellEdges[midRow]!
      .filter((cell): cell is NonNullable<typeof cell> => cell !== null)
      .map((cell) => cell.glyph);
    expect(glyphs).toContain("-");
  });
});
