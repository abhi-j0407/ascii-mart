import { describe, expect, it } from "vitest";

import { PRINTABLE_ASCII } from "../constants";
import { buildGlyphEntries } from "../glyphAtlas";
import { squaredDistance } from "../kdtree";
import { getTestCanvasContext } from "./helpers";

describe("glyphAtlas", () => {
  it("builds normalized shape vectors for printable ASCII", () => {
    const entries = buildGlyphEntries(getTestCanvasContext());
    expect(entries.length).toBe(PRINTABLE_ASCII.length);
    for (const dim of [0, 1, 2, 3, 4, 5]) {
      const max = Math.max(...entries.map((e) => e.shapeVector[dim]!));
      expect(max).toBeCloseTo(1, 5);
    }
  });

  it("separates extreme top vs bottom glyphs in shape space", () => {
    const entries = buildGlyphEntries(getTestCanvasContext());
    const caret = entries.find((e) => e.char === "^")!.shapeVector;
    const under = entries.find((e) => e.char === "_")!.shapeVector;
    expect(squaredDistance(caret, under)).toBeGreaterThan(0.15);
  });
});
