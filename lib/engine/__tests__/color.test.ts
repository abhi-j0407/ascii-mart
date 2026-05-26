import { describe, expect, it } from "vitest";

import { computeCellColors } from "../color";
import { computeGridDimensions } from "../sampling";
import { createTestImageData } from "./helpers";
import { asImageData } from "./imageData";

describe("computeCellColors", () => {
  it("averages a uniform cell to that RGB", () => {
    const image = asImageData(
      createTestImageData(60, 40, () => [200, 100, 50] as const),
    );
    const grid = computeGridDimensions(image.width, image.height, 10, 0.5);
    const colors = computeCellColors(image, grid);
    expect(colors[0]![0]).toEqual({ r: 200, g: 100, b: 50 });
  });

  it("averages two tones within one cell", () => {
    const image = asImageData(
      createTestImageData(20, 20, (x) => {
        if (x < 10) {
          return [0, 0, 0] as const;
        }
        return [200, 100, 50] as const;
      }),
    );
    const grid = computeGridDimensions(image.width, image.height, 1, 1);
    const colors = computeCellColors(image, grid);
    expect(colors[0]![0]).toEqual({ r: 100, g: 50, b: 25 });
  });
});
