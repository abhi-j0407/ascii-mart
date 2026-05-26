import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { PRINTABLE_ASCII } from "../constants";
import { fillMonoAscii } from "../fill";
import { createGlyphAtlas } from "../glyphAtlas";
import { createCircleImage, getTestCanvasContext, setupEngineTests } from "./helpers";
import { asImageData } from "./imageData";

const OUTPUT_DIR = join(import.meta.dirname, "output");

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
