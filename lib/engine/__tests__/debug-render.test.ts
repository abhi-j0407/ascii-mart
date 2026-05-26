import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { buildCellModel, cellModelToAscii } from "../buildCellModel";
import { PRINTABLE_ASCII } from "../constants";
import { fillMonoAscii } from "../fill";
import { createGlyphAtlas } from "../glyphAtlas";
import { createCircleImage, getTestCanvasContext, setupEngineTests } from "./helpers";
import { asImageData } from "./imageData";

const OUTPUT_DIR = join(import.meta.dirname, "output");

function colorSummary(
  model: ReturnType<typeof buildCellModel>,
): string {
  return model.cells
    .map((row) =>
      row
        .map((cell) => {
          const { r, g, b } = cell.color;
          const tag = cell.isEdge ? cell.char : ".";
          return `${tag}${((r + g + b) / 3) | 0}`;
        })
        .join(" "),
    )
    .join("\n");
}

describe("debug mono render", () => {
  it("writes recognizable ASCII for a synthetic circle", () => {
    setupEngineTests();
    const atlas = createGlyphAtlas(getTestCanvasContext(), {
      charset: PRINTABLE_ASCII,
    });
    const image = asImageData(createCircleImage(160, 80, 80, 55));
    const ascii = fillMonoAscii(image, {
      density: 80,
      atlas,
      contrastExponent: 2,
    });

    mkdirSync(OUTPUT_DIR, { recursive: true });
    writeFileSync(join(OUTPUT_DIR, "circle-mono.txt"), ascii, "utf8");

    const lines = ascii.split("\n");
    expect(lines.length).toBeGreaterThan(15);
    expect(ascii).toMatch(/[@#%&*+]/);
    const nonSpace = ascii.replace(/[\s\n]/g, "").length;
    expect(nonSpace).toBeGreaterThan(200);
  });
});

describe("debug cell model render", () => {
  it("writes edge-aware ASCII and a color summary for a synthetic circle", () => {
    setupEngineTests();
    const atlas = createGlyphAtlas(getTestCanvasContext(), {
      charset: PRINTABLE_ASCII,
    });
    const image = asImageData(createCircleImage(160, 80, 80, 55));
    const model = buildCellModel(image, {
      density: 80,
      atlas,
      contrastExponent: 2,
      edgeThreshold: 0.12,
    });
    const ascii = cellModelToAscii(model);
    const colors = colorSummary(model);

    mkdirSync(OUTPUT_DIR, { recursive: true });
    writeFileSync(join(OUTPUT_DIR, "circle-edges.txt"), ascii, "utf8");
    writeFileSync(join(OUTPUT_DIR, "circle-colors.txt"), colors, "utf8");

    expect(ascii).toMatch(/[|/\\-]/);
    expect(colors).toMatch(/\|?\d+/);
    const edgeCount = model.cells
      .flat()
      .filter((cell) => cell.isEdge).length;
    expect(edgeCount).toBeGreaterThan(20);
  });
});
