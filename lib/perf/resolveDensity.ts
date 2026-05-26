import { clampDensityForImage } from "./gridLimits";

/**
 * Effective density for engine compute: clamp when the grid would be too large.
 */
export function resolveComputeDensity(
  imageWidth: number,
  imageHeight: number,
  density: number,
): number {
  return clampDensityForImage(imageWidth, imageHeight, density);
}
