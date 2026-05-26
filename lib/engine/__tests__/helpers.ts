import { createCanvas } from "@napi-rs/canvas";

import { createGlyphAtlas, resetDefaultGlyphAtlas } from "../glyphAtlas";
import type { ImageDataLike } from "./imageData";

export function getTestCanvasContext(): CanvasRenderingContext2D {
  const canvas = createCanvas(160, 288);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create test canvas context");
  }
  return ctx as unknown as CanvasRenderingContext2D;
}

export function buildTestAtlas(charset = " .:-=+#@") {
  return createGlyphAtlas(getTestCanvasContext(), { charset });
}

export function setupEngineTests(): void {
  resetDefaultGlyphAtlas();
}

export function createTestImageData(
  width: number,
  height: number,
  paint: (x: number, y: number) => readonly [number, number, number],
): ImageDataLike {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = paint(x, y);
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  return { width, height, data };
}

export function createCircleImage(
  size: number,
  cx: number,
  cy: number,
  radius: number,
): ImageDataLike {
  return createTestImageData(size, size, (x, y) => {
    const dx = x - cx;
    const dy = y - cy;
    const inside = dx * dx + dy * dy <= radius * radius;
    const v = inside ? 255 : 0;
    return [v, v, v] as const;
  });
}

export function createVerticalGradientImage(
  width: number,
  height: number,
): ImageDataLike {
  return createTestImageData(width, height, (_x, y) => {
    const v = Math.round((y / (height - 1)) * 255);
    return [v, v, v] as const;
  });
}

export function createHalfPlaneImage(
  width: number,
  height: number,
): ImageDataLike {
  return createTestImageData(width, height, (x) => {
    const v = x < width / 2 ? 255 : 0;
    return [v, v, v] as const;
  });
}
