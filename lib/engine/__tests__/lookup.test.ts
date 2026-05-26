import { describe, expect, it } from "vitest";

import { CACHE_QUANTIZE_RANGE } from "../constants";
import { cacheKeyFromVector, quantizeComponent, ShapeLookup } from "../lookup";
import type { GlyphEntry, ShapeVector } from "../types";

const MINI_GLYPHS: GlyphEntry[] = [
  { char: " ", shapeVector: [0, 0, 0, 0, 0, 0] },
  { char: ".", shapeVector: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2] },
  { char: "@", shapeVector: [1, 1, 1, 1, 1, 1] },
  { char: "^", shapeVector: [1, 1, 0.1, 0.1, 0, 0] },
  { char: "_", shapeVector: [0, 0, 0.1, 0.1, 1, 1] },
];

describe("ShapeLookup cache", () => {
  it("quantizes components into the configured range", () => {
    expect(quantizeComponent(0)).toBe(0);
    expect(quantizeComponent(1)).toBe(CACHE_QUANTIZE_RANGE - 1);
    expect(quantizeComponent(0.999)).toBe(CACHE_QUANTIZE_RANGE - 1);
  });

  it("returns identical characters for k-d tree and brute force", () => {
    const lookup = new ShapeLookup(MINI_GLYPHS);
    const vectors: ShapeVector[] = [
      [0.05, 0.02, 0, 0, 0, 0],
      [0.95, 0.92, 0.9, 0.88, 0.91, 0.93],
      [0.9, 0.85, 0.1, 0.1, 0.05, 0.02],
      [0.05, 0.1, 0.05, 0.1, 0.95, 0.9],
    ];
    for (const vector of vectors) {
      expect(lookup.findNearest(vector)).toBe(lookup.findNearestBrute(vector));
    }
  });

  it("reuses cached results for quantized-equivalent vectors", () => {
    const lookup = new ShapeLookup(MINI_GLYPHS);
    const a: ShapeVector = [0.81, 0.81, 0.81, 0.81, 0.81, 0.81];
    const b: ShapeVector = [0.82, 0.82, 0.82, 0.82, 0.82, 0.82];
    expect(cacheKeyFromVector(a)).toBe(cacheKeyFromVector(b));
    const first = lookup.findNearest(a);
    const second = lookup.findNearest(b);
    expect(first).toBe(second);
    expect(first).toBe("@");
  });
});
