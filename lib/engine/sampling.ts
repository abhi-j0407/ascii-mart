import {
  DEFAULT_CELL_ASPECT,
  DEFAULT_CONTRAST_EXPONENT,
  DEFAULT_DENSITY,
  DEFAULT_SAMPLE_QUALITY,
  INTERNAL_CIRCLES,
} from "./constants";
import { luminanceAt } from "./luminance";
import type { GridDimensions, SamplingCircle, ShapeVector } from "./types";
import { SHAPE_DIMENSIONS } from "./types";

export function computeGridDimensions(
  imageWidth: number,
  imageHeight: number,
  density: number = DEFAULT_DENSITY,
  cellAspect: number = DEFAULT_CELL_ASPECT,
): GridDimensions {
  const cols = Math.max(1, Math.round(density));
  const cellWidth = imageWidth / cols;
  const cellHeight = cellWidth / cellAspect;
  let rows = Math.floor(imageHeight / cellHeight);
  if (rows < 1) {
    rows = 1;
  }
  return { cols, rows, cellWidth, cellHeight };
}

export function applyGlobalContrast(
  vector: ShapeVector,
  exponent: number = DEFAULT_CONTRAST_EXPONENT,
): ShapeVector {
  if (exponent <= 1) {
    return vector;
  }
  let maxValue = 0;
  for (let i = 0; i < SHAPE_DIMENSIONS; i++) {
    if (vector[i]! > maxValue) {
      maxValue = vector[i]!;
    }
  }
  if (maxValue < 1e-6) {
    return vector;
  }
  const out: number[] = [];
  for (let i = 0; i < SHAPE_DIMENSIONS; i++) {
    const normalized = vector[i]! / maxValue;
    out.push(Math.pow(normalized, exponent) * maxValue);
  }
  return out as unknown as ShapeVector;
}

function samplesPerDimension(sampleQuality: number): number {
  return Math.max(2, Math.floor(Math.sqrt(sampleQuality)));
}

export function sampleCircleFromImage(
  luminance: Float32Array,
  imageWidth: number,
  imageHeight: number,
  circle: SamplingCircle,
  cellCol: number,
  cellRow: number,
  cellWidth: number,
  cellHeight: number,
  sampleQuality: number = DEFAULT_SAMPLE_QUALITY,
): number {
  const cx = (cellCol + circle.cx) * cellWidth;
  const cy = (cellRow + circle.cy) * cellHeight;
  const radius = circle.radius * Math.min(cellWidth, cellHeight);
  const perDim = samplesPerDimension(sampleQuality);
  let total = 0;
  let count = 0;

  for (let i = 0; i < perDim; i++) {
    for (let j = 0; j < perDim; j++) {
      const fx = ((i + 0.5) / perDim) * 2 - 1;
      const fy = ((j + 0.5) / perDim) * 2 - 1;
      if (fx * fx + fy * fy > 1) {
        continue;
      }
      const px = Math.floor(cx + fx * radius);
      const py = Math.floor(cy + fy * radius);
      if (px >= 0 && px < imageWidth && py >= 0 && py < imageHeight) {
        total += luminanceAt(luminance, imageWidth, px, py);
        count++;
      }
    }
  }

  return count > 0 ? total / count : 0;
}

export function sampleCellShapeVector(
  luminance: Float32Array,
  imageWidth: number,
  imageHeight: number,
  cellCol: number,
  cellRow: number,
  cellWidth: number,
  cellHeight: number,
  sampleQuality: number = DEFAULT_SAMPLE_QUALITY,
): ShapeVector {
  const components: number[] = [];
  for (const circle of INTERNAL_CIRCLES) {
    components.push(
      sampleCircleFromImage(
        luminance,
        imageWidth,
        imageHeight,
        circle,
        cellCol,
        cellRow,
        cellWidth,
        cellHeight,
        sampleQuality,
      ),
    );
  }
  return components as unknown as ShapeVector;
}

export function normalizeShapeVectors(
  vectors: readonly ShapeVector[],
): ShapeVector[] {
  const maxPerDim = new Array<number>(SHAPE_DIMENSIONS).fill(0);
  for (const vector of vectors) {
    for (let i = 0; i < SHAPE_DIMENSIONS; i++) {
      maxPerDim[i] = Math.max(maxPerDim[i]!, vector[i]!);
    }
  }
  return vectors.map((vector) => {
    const out: number[] = [];
    for (let i = 0; i < SHAPE_DIMENSIONS; i++) {
      const max = maxPerDim[i]!;
      out.push(max > 1e-6 ? vector[i]! / max : 0);
    }
    return out as unknown as ShapeVector;
  });
}
