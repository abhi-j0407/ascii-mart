import { describe, expect, it } from "vitest";

import { computeGridDimensions } from "@/lib/engine/sampling";

import { MAX_GRID_CELLS } from "../constants";
import { clampDensityForImage } from "../gridLimits";

describe("clampDensityForImage", () => {
  it("returns requested density when grid is within limits", () => {
    expect(clampDensityForImage(1920, 1080, 150)).toBe(150);
  });

  it("reduces density for very tall sources that would exceed max cells", () => {
    const clamped = clampDensityForImage(1000, 16_000, 240);
    const { cols, rows } = computeGridDimensions(1000, 16_000, clamped);
    expect(cols * rows).toBeLessThanOrEqual(MAX_GRID_CELLS);
    expect(clamped).toBeLessThan(240);
  });
});
