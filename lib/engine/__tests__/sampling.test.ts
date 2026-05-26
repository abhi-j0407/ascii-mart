import { describe, expect, it } from "vitest";

import { DEFAULT_CELL_ASPECT, DEFAULT_DENSITY } from "../constants";
import { imageDataToLuminance } from "../luminance";
import {
  applyGlobalContrast,
  computeGridDimensions,
  normalizeShapeVectors,
  sampleCellShapeVector,
} from "../sampling";
import type { ShapeVector } from "../types";
import {
  createHalfPlaneImage,
  createTestImageData,
} from "./helpers";
import { asImageData } from "./imageData";

describe("computeGridDimensions", () => {
  it("uses density as column count", () => {
    const grid = computeGridDimensions(300, 200, 150);
    expect(grid.cols).toBe(150);
    expect(grid.cellWidth).toBeCloseTo(2, 5);
  });

  it("makes cells taller than wide with default aspect 0.5", () => {
    const grid = computeGridDimensions(300, 300, DEFAULT_DENSITY, DEFAULT_CELL_ASPECT);
    expect(grid.cellHeight).toBeCloseTo(grid.cellWidth / DEFAULT_CELL_ASPECT, 5);
    expect(grid.cellHeight).toBeGreaterThan(grid.cellWidth);
  });

  it("derives row count from image height and cell height", () => {
    const grid = computeGridDimensions(300, 300, 100, 0.5);
    expect(grid.rows).toBe(Math.floor(300 / grid.cellHeight));
    expect(grid.rows).toBeGreaterThan(0);
  });
});

describe("applyGlobalContrast", () => {
  it("leaves vector unchanged when exponent is 1", () => {
    const v: ShapeVector = [0.8, 0.4, 0.2, 0.1, 0.05, 0.02];
    expect(applyGlobalContrast(v, 1)).toEqual(v);
  });

  it("darkens lower components relative to the max", () => {
    const v: ShapeVector = [0.8, 0.4, 0.2, 0.1, 0.05, 0.02];
    const enhanced = applyGlobalContrast(v, 2);
    expect(enhanced[0]).toBeCloseTo(0.8, 5);
    expect(enhanced[1]!).toBeLessThan(v[1]!);
    expect(enhanced[5]!).toBeLessThan(v[5]!);
  });
});

describe("normalizeShapeVectors", () => {
  it("scales each dimension by the max across glyphs", () => {
    const normalized = normalizeShapeVectors([
      [0.5, 0.25, 0, 0, 0, 0],
      [1, 0.5, 0.25, 0, 0, 0],
    ] as ShapeVector[]);
    expect(normalized[0]![0]).toBe(0.5);
    expect(normalized[1]![0]).toBe(1);
    expect(normalized[0]![1]).toBe(0.5);
  });
});

describe("sampleCellShapeVector", () => {
  it("returns high values for a bright cell and low for dark", () => {
    const image = asImageData(createTestImageData(60, 60, () => [200, 200, 200]));
    const lum = new Float32Array(60 * 60).fill(0.78);
    const bright = sampleCellShapeVector(lum, 60, 60, 0, 0, 20, 40, 8);
    const dark = sampleCellShapeVector(
      new Float32Array(60 * 60).fill(0.05),
      60,
      60,
      0,
      0,
      20,
      40,
      8,
    );
    const brightAvg = bright.reduce((a, b) => a + b, 0) / 6;
    const darkAvg = dark.reduce((a, b) => a + b, 0) / 6;
    expect(brightAvg).toBeGreaterThan(darkAvg);
    expect(image.width).toBe(60);
  });

  it("separates bright top row from dark bottom row on an inverted gradient", () => {
    const image = asImageData(
      createTestImageData(80, 80, (_x, y) => {
        const v = Math.round((1 - y / 79) * 255);
        return [v, v, v] as const;
      }),
    );
    const { width, height } = image;
    const lum = imageDataToLuminance(image);
    const grid = computeGridDimensions(width, height, 20, 0.5);
    const top = sampleCellShapeVector(
      lum,
      width,
      height,
      0,
      0,
      grid.cellWidth,
      grid.cellHeight,
      12,
    );
    const bottom = sampleCellShapeVector(
      lum,
      width,
      height,
      0,
      grid.rows - 1,
      grid.cellWidth,
      grid.cellHeight,
      12,
    );
    expect(top[0]! + top[1]!).toBeGreaterThan(bottom[4]! + bottom[5]!);
  });

  it("separates left vs right halves on a split image", () => {
    const image = asImageData(createHalfPlaneImage(100, 80));
    const grid = computeGridDimensions(image.width, image.height, 24, 0.5);
    const lum = imageDataToLuminance(image);
    const left = sampleCellShapeVector(
      lum,
      image.width,
      image.height,
      2,
      2,
      grid.cellWidth,
      grid.cellHeight,
      12,
    );
    const right = sampleCellShapeVector(
      lum,
      image.width,
      image.height,
      grid.cols - 3,
      2,
      grid.cellWidth,
      grid.cellHeight,
      12,
    );
    const leftAvg = (left[0]! + left[2]! + left[4]!) / 3;
    const rightAvg = (right[1]! + right[3]! + right[5]!) / 3;
    expect(leftAvg).toBeGreaterThan(rightAvg);
  });
});
