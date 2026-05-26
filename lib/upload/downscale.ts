import { DEFAULT_CELL_ASPECT } from "@/lib/engine/constants";
import { computeGridDimensions } from "@/lib/engine/sampling";

import { PIXELS_PER_CELL_AXIS } from "./constants";

/**
 * Working bitmap size: ~2 pixels per grid cell on each axis (locked #11).
 * Grid cols/rows are derived from the source aspect ratio and density.
 */
export function computeWorkingImageSize(
  imageWidth: number,
  imageHeight: number,
  density: number,
  cellAspect: number = DEFAULT_CELL_ASPECT,
): { width: number; height: number } {
  const { cols, rows } = computeGridDimensions(
    imageWidth,
    imageHeight,
    density,
    cellAspect,
  );
  return {
    width: Math.max(1, cols * PIXELS_PER_CELL_AXIS),
    height: Math.max(1, rows * PIXELS_PER_CELL_AXIS),
  };
}
