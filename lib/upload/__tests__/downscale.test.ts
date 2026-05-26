import { describe, expect, it } from "vitest";

import { DEFAULT_CELL_ASPECT, DEFAULT_DENSITY } from "@/lib/engine/constants";
import { computeGridDimensions } from "@/lib/engine/sampling";

import { PIXELS_PER_CELL_AXIS } from "../constants";
import { computeWorkingImageSize } from "../downscale";

describe("computeWorkingImageSize", () => {
  it("uses ~2 pixels per grid cell on each axis", () => {
    const imageWidth = 6000;
    const imageHeight = 4000;
    const density = DEFAULT_DENSITY;

    const { cols, rows } = computeGridDimensions(
      imageWidth,
      imageHeight,
      density,
      DEFAULT_CELL_ASPECT,
    );
    const size = computeWorkingImageSize(
      imageWidth,
      imageHeight,
      density,
      DEFAULT_CELL_ASPECT,
    );

    expect(size).toEqual({
      width: cols * PIXELS_PER_CELL_AXIS,
      height: rows * PIXELS_PER_CELL_AXIS,
    });
  });

  it("never returns zero dimensions", () => {
    const size = computeWorkingImageSize(1, 1, 150);
    expect(size.width).toBeGreaterThanOrEqual(2);
    expect(size.height).toBeGreaterThanOrEqual(2);
  });
});
