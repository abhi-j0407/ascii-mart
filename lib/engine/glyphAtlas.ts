import {
  GLYPH_CELL_HEIGHT,
  GLYPH_CELL_WIDTH,
  GLYPH_RENDER_SCALE,
  INTERNAL_CIRCLES,
  PRINTABLE_ASCII,
} from "./constants";
import { ShapeLookup } from "./lookup";
import { normalizeShapeVectors } from "./sampling";
import type { GlyphAtlas, GlyphEntry, ShapeVector } from "./types";

export interface GlyphAtlasBuildOptions {
  readonly charset?: string;
  readonly font?: string;
  readonly cellWidth?: number;
  readonly cellHeight?: number;
  readonly renderScale?: number;
  readonly samplesPerCircle?: number;
}

function renderGlyphBitmap(
  ctx: CanvasRenderingContext2D,
  char: string,
  width: number,
  height: number,
  font: string,
): ImageData {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.font = font;
  ctx.textBaseline = "top";
  const metrics = ctx.measureText(char);
  const charWidth = metrics.width;
  const charHeight =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent ||
    height * 0.8;
  const x = (width - charWidth) / 2;
  const y = (height - charHeight) / 2;
  ctx.fillText(char, x, y);
  return ctx.getImageData(0, 0, width, height);
}

function bitmapToLuminance(image: ImageData): Float32Array {
  const { width, height, data } = image;
  const out = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    out[i] = data[i * 4]! / 255;
  }
  return out;
}

function computeGlyphShapeVector(
  luminance: Float32Array,
  width: number,
  height: number,
  samplesPerCircle: number,
): ShapeVector {
  const components: number[] = [];
  for (const circle of INTERNAL_CIRCLES) {
    let total = 0;
    let count = 0;
    const cx = circle.cx * width;
    const cy = circle.cy * height;
    const radius = circle.radius * Math.min(width, height);
    const perDim = Math.max(2, Math.floor(Math.sqrt(samplesPerCircle)));

    for (let i = 0; i < perDim; i++) {
      for (let j = 0; j < perDim; j++) {
        const fx = ((i + 0.5) / perDim) * 2 - 1;
        const fy = ((j + 0.5) / perDim) * 2 - 1;
        if (fx * fx + fy * fy > 1) {
          continue;
        }
        const px = Math.floor(cx + fx * radius);
        const py = Math.floor(cy + fy * radius);
        if (px >= 0 && px < width && py >= 0 && py < height) {
          total += luminance[py * width + px]!;
          count++;
        }
      }
    }
    components.push(count > 0 ? total / count : 0);
  }
  return components as unknown as ShapeVector;
}

export function buildGlyphEntries(
  ctx: CanvasRenderingContext2D,
  options: GlyphAtlasBuildOptions = {},
): GlyphEntry[] {
  const charset = options.charset ?? PRINTABLE_ASCII;
  const cellWidth = options.cellWidth ?? GLYPH_CELL_WIDTH;
  const cellHeight = options.cellHeight ?? GLYPH_CELL_HEIGHT;
  const scale = options.renderScale ?? GLYPH_RENDER_SCALE;
  const samplesPerCircle = options.samplesPerCircle ?? 64;
  const renderW = cellWidth * scale;
  const renderH = cellHeight * scale;
  const fontSize = Math.floor(renderH * 0.85);
  const font = options.font ?? `${fontSize}px monospace`;

  const rawVectors: ShapeVector[] = [];
  const chars: string[] = [];

  for (const char of charset) {
    if (char === "\t" || char === "\n" || char === "\r") {
      continue;
    }
    const bitmap = renderGlyphBitmap(ctx, char, renderW, renderH, font);
    const lum = bitmapToLuminance(bitmap);
    rawVectors.push(
      computeGlyphShapeVector(lum, renderW, renderH, samplesPerCircle),
    );
    chars.push(char);
  }

  const normalized = normalizeShapeVectors(rawVectors);
  return chars.map((char, i) => ({
    char,
    shapeVector: normalized[i]!,
  }));
}

export function createGlyphAtlas(
  ctx: CanvasRenderingContext2D,
  options?: GlyphAtlasBuildOptions,
): GlyphAtlas {
  const glyphs = buildGlyphEntries(ctx, options);
  const lookup = new ShapeLookup(glyphs);
  return { glyphs, lookup };
}

let defaultAtlas: GlyphAtlas | null = null;

/** Lazily build atlas using an OffscreenCanvas (browser) or injected context. */
export function getDefaultGlyphAtlas(
  createContext?: () => CanvasRenderingContext2D,
): GlyphAtlas {
  if (defaultAtlas) {
    return defaultAtlas;
  }
  const ctx = createContext?.() ?? createOffscreenContext();
  defaultAtlas = createGlyphAtlas(ctx);
  return defaultAtlas;
}

export function resetDefaultGlyphAtlas(): void {
  defaultAtlas = null;
}

function createOffscreenContext(): CanvasRenderingContext2D {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(1, 1);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      return ctx as unknown as CanvasRenderingContext2D;
    }
  }
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      return ctx;
    }
  }
  throw new Error(
    "No canvas available for glyph atlas. Pass createContext in tests.",
  );
}
