import { MAX_WORKING_SIDE_PX } from "./constants";

/**
 * Cap a working bitmap size so rasterization stays bounded on huge grids.
 */
export function capWorkingDimensions(
  width: number,
  height: number,
  maxSide: number = MAX_WORKING_SIDE_PX,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxSide) {
    return { width, height };
  }

  const scale = maxSide / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}
