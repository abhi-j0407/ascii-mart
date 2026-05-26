import { DEFAULT_CELL_ASPECT } from "@/lib/engine/constants";
import { computeGridDimensions } from "@/lib/engine/sampling";

import { MAX_GRID_CELLS } from "./constants";

const MIN_EFFECTIVE_DENSITY = 40;

/**
 * Lower density when the grid would exceed {@link MAX_GRID_CELLS}.
 * Uses source pixel dimensions (natural size), not the working bitmap.
 */
export function clampDensityForImage(
  imageWidth: number,
  imageHeight: number,
  density: number,
  cellAspect: number = DEFAULT_CELL_ASPECT,
): number {
  let effective = density;

  while (effective > MIN_EFFECTIVE_DENSITY) {
    const { cols, rows } = computeGridDimensions(
      imageWidth,
      imageHeight,
      effective,
      cellAspect,
    );
    if (cols * rows <= MAX_GRID_CELLS) {
      return effective;
    }
    effective = Math.max(
      MIN_EFFECTIVE_DENSITY,
      Math.floor(effective * 0.92),
    );
  }

  return effective;
}
