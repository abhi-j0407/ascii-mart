import { beforeAll, describe, expect, it } from "vitest";

import { fillMono, gridToAscii } from "../fill";
import type { GlyphAtlas } from "../types";
import {
  buildTestAtlas,
  createCircleImage,
  createHalfPlaneImage,
  createTestImageData,
  setupEngineTests,
} from "./helpers";
import { asImageData } from "./imageData";

describe("fillMono", () => {
  let atlas: GlyphAtlas;

  beforeAll(() => {
    setupEngineTests();
    atlas = buildTestAtlas();
  });

  it("picks dense glyphs for bright regions and sparse for dark", () => {
    const image = asImageData(
      createTestImageData(120, 80, (x) => {
        const v = x < 60 ? 240 : 10;
        return [v, v, v] as const;
      }),
    );
    const { grid, cols, rows } = fillMono(image, {
      density: 30,
      atlas,
      contrastExponent: 1,
    });
    expect(cols).toBe(30);
    expect(rows).toBeGreaterThan(0);

    const leftChars = new Set(
      grid.flatMap((row) => row.slice(0, Math.floor(cols / 2))),
    );
    const rightChars = new Set(
      grid.flatMap((row) => row.slice(Math.floor(cols / 2))),
    );
    expect(leftChars.has("@") || leftChars.has("#") || leftChars.has("+")).toBe(
      true,
    );
    expect(rightChars.has(" ") || rightChars.has(".")).toBe(true);
  });

  it("uses top-heavy glyphs on upper half of vertical gradient", () => {
    const image = asImageData(
      createTestImageData(80, 80, (_x, y) => {
        const v = Math.round((1 - y / 79) * 255);
        return [v, v, v] as const;
      }),
    );
    const { grid, rows } = fillMono(image, {
      density: 20,
      atlas,
      contrastExponent: 2,
    });
    const topRow = grid[0]!.join("");
    const bottomRow = grid[rows - 1]!.join("");
    expect(topRow).not.toBe(bottomRow);
  });

  it("renders a circle with recognizable contour characters", () => {
    const image = asImageData(createCircleImage(120, 60, 60, 45));
    const ascii = gridToAscii(
      fillMono(image, { density: 40, atlas, contrastExponent: 2 }).grid,
    );
    expect(ascii.length).toBeGreaterThan(100);
    expect(ascii).toMatch(/[@#+]/);
    expect(ascii).toMatch(/[ .:-]/);
    const lines = ascii.split("\n");
    const mid = lines[Math.floor(lines.length / 2)] ?? "";
    expect(mid.trim().length).toBeGreaterThan(10);
  });

  it("respects density for column count", () => {
    const image = asImageData(createHalfPlaneImage(200, 100));
    const at80 = fillMono(image, { density: 80, atlas, contrastExponent: 1 });
    const at40 = fillMono(image, { density: 40, atlas, contrastExponent: 1 });
    expect(at80.cols).toBe(80);
    expect(at40.cols).toBe(40);
    expect(at80.rows).toBeGreaterThanOrEqual(at40.rows);
  });
});
