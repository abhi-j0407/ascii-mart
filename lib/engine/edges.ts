import {
  DEFAULT_DOG_SIGMA_LARGE,
  DEFAULT_DOG_SIGMA_SMALL,
  DEFAULT_EDGE_THRESHOLD,
} from "./constants";
import { luminanceAt } from "./luminance";
import type { GridDimensions } from "./types";

export type EdgeDirectionGlyph = "|" | "/" | "\\" | "-";

export interface PixelEdgeMap {
  readonly width: number;
  readonly height: number;
  /** Row-major edge magnitude (non-negative). */
  readonly magnitude: Float32Array;
  /** Row-major gradient angle atan2(gy, gx) in radians. */
  readonly angle: Float32Array;
}

export interface CellEdgeInfo {
  readonly magnitude: number;
  readonly glyph: EdgeDirectionGlyph;
}

function gaussianKernel(sigma: number): Float32Array {
  const radius = Math.max(1, Math.ceil(sigma * 3));
  const size = radius * 2 + 1;
  const kernel = new Float32Array(size);
  const sigma2 = sigma * sigma;
  let sum = 0;
  for (let i = 0; i < size; i++) {
    const x = i - radius;
    const value = Math.exp(-(x * x) / (2 * sigma2));
    kernel[i] = value;
    sum += value;
  }
  for (let i = 0; i < size; i++) {
    kernel[i] = kernel[i]! / sum;
  }
  return kernel;
}

function convolveHorizontal(
  src: Float32Array,
  width: number,
  height: number,
  kernel: Float32Array,
): Float32Array {
  const radius = (kernel.length - 1) >> 1;
  const out = new Float32Array(src.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) {
        const sx = Math.max(0, Math.min(width - 1, x + k));
        sum += src[y * width + sx]! * kernel[k + radius]!;
      }
      out[y * width + x] = sum;
    }
  }
  return out;
}

function convolveVertical(
  src: Float32Array,
  width: number,
  height: number,
  kernel: Float32Array,
): Float32Array {
  const radius = (kernel.length - 1) >> 1;
  const out = new Float32Array(src.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) {
        const sy = Math.max(0, Math.min(height - 1, y + k));
        sum += src[sy * width + x]! * kernel[k + radius]!;
      }
      out[y * width + x] = sum;
    }
  }
  return out;
}

function gaussianBlur(
  src: Float32Array,
  width: number,
  height: number,
  sigma: number,
): Float32Array {
  const kernel = gaussianKernel(sigma);
  const horizontal = convolveHorizontal(src, width, height, kernel);
  return convolveVertical(horizontal, width, height, kernel);
}

/** Band-pass luminance via difference of Gaussians. */
export function applyDifferenceOfGaussians(
  luminance: Float32Array,
  width: number,
  height: number,
  sigmaSmall: number = DEFAULT_DOG_SIGMA_SMALL,
  sigmaLarge: number = DEFAULT_DOG_SIGMA_LARGE,
): Float32Array {
  const blurSmall = gaussianBlur(luminance, width, height, sigmaSmall);
  const blurLarge = gaussianBlur(luminance, width, height, sigmaLarge);
  const out = new Float32Array(luminance.length);
  for (let i = 0; i < out.length; i++) {
    out[i] = blurSmall[i]! - blurLarge[i]!;
  }
  return out;
}

export function computeSobelEdgeMap(
  signal: Float32Array,
  width: number,
  height: number,
): PixelEdgeMap {
  const magnitude = new Float32Array(width * height);
  const angle = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gx =
        -luminanceAt(signal, width, x - 1, y - 1) -
        2 * luminanceAt(signal, width, x - 1, y) -
        luminanceAt(signal, width, x - 1, y + 1) +
        luminanceAt(signal, width, x + 1, y - 1) +
        2 * luminanceAt(signal, width, x + 1, y) +
        luminanceAt(signal, width, x + 1, y + 1);

      const gy =
        -luminanceAt(signal, width, x - 1, y - 1) -
        2 * luminanceAt(signal, width, x, y - 1) -
        luminanceAt(signal, width, x + 1, y - 1) +
        luminanceAt(signal, width, x - 1, y + 1) +
        2 * luminanceAt(signal, width, x, y + 1) +
        luminanceAt(signal, width, x + 1, y + 1);

      const mag = Math.hypot(gx, gy);
      const i = y * width + x;
      magnitude[i] = mag;
      angle[i] = Math.atan2(gy, gx);
    }
  }

  return { width, height, magnitude, angle };
}

const EDGE_GLYPHS: readonly EdgeDirectionGlyph[] = ["-", "/", "|", "\\"];

/** Map gradient angle to the line-orientation glyph (perpendicular to gradient). */
export function gradientAngleToGlyph(angle: number): EdgeDirectionGlyph {
  let theta = angle + Math.PI / 2;
  theta = ((theta % Math.PI) + Math.PI) % Math.PI;
  const sector = Math.round(theta / (Math.PI / 4)) % 4;
  return EDGE_GLYPHS[sector]!;
}

export function computePixelEdgeMap(
  luminance: Float32Array,
  width: number,
  height: number,
  sigmaSmall: number = DEFAULT_DOG_SIGMA_SMALL,
  sigmaLarge: number = DEFAULT_DOG_SIGMA_LARGE,
): PixelEdgeMap {
  const dog = applyDifferenceOfGaussians(
    luminance,
    width,
    height,
    sigmaSmall,
    sigmaLarge,
  );
  return computeSobelEdgeMap(dog, width, height);
}

export function aggregateCellEdges(
  edgeMap: PixelEdgeMap,
  grid: GridDimensions,
  threshold: number = DEFAULT_EDGE_THRESHOLD,
): (CellEdgeInfo | null)[][] {
  const { width, height, magnitude, angle } = edgeMap;
  const { cols, rows, cellWidth, cellHeight } = grid;
  const result: (CellEdgeInfo | null)[][] = [];

  for (let row = 0; row < rows; row++) {
    const line: (CellEdgeInfo | null)[] = [];
    const y0 = Math.floor(row * cellHeight);
    const y1 = Math.min(height, Math.ceil((row + 1) * cellHeight));

    for (let col = 0; col < cols; col++) {
      const x0 = Math.floor(col * cellWidth);
      const x1 = Math.min(width, Math.ceil((col + 1) * cellWidth));

      let maxMag = 0;
      let bestAngle = 0;

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = y * width + x;
          const mag = magnitude[i]!;
          if (mag > maxMag) {
            maxMag = mag;
            bestAngle = angle[i]!;
          }
        }
      }

      if (maxMag >= threshold) {
        line.push({
          magnitude: maxMag,
          glyph: gradientAngleToGlyph(bestAngle),
        });
      } else {
        line.push(null);
      }
    }
    result.push(line);
  }

  return result;
}

/** Normalize magnitudes to 0..1 and pick a threshold as a fraction of the global max. */
export function normalizeEdgeMagnitudes(edgeMap: PixelEdgeMap): {
  readonly map: PixelEdgeMap;
  readonly maxMagnitude: number;
} {
  let maxMagnitude = 0;
  for (let i = 0; i < edgeMap.magnitude.length; i++) {
    if (edgeMap.magnitude[i]! > maxMagnitude) {
      maxMagnitude = edgeMap.magnitude[i]!;
    }
  }
  if (maxMagnitude < 1e-8) {
    return { map: edgeMap, maxMagnitude: 0 };
  }
  const normalized = new Float32Array(edgeMap.magnitude.length);
  for (let i = 0; i < normalized.length; i++) {
    normalized[i] = edgeMap.magnitude[i]! / maxMagnitude;
  }
  return {
    map: { ...edgeMap, magnitude: normalized },
    maxMagnitude,
  };
}
