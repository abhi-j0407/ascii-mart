import { DEFAULT_CELL_ASPECT } from "@/lib/engine/constants";
import { resolveComputeDensity } from "@/lib/perf/resolveDensity";

import { decodeImageFile } from "./decode";
import { rasterizeForEngine } from "./rasterize";

export interface PreparedImage {
  /** Full-resolution source kept for later “real image” rendering. */
  readonly sourceImage: HTMLImageElement;
  readonly imageData: ImageData;
  /** Density used for rasterization and worker compute (may be clamped). */
  readonly computeDensity: number;
}

/**
 * Validate, decode, and rasterize an upload for worker compute.
 */
export async function prepareImageUpload(
  file: File,
  density: number,
  cellAspect: number = DEFAULT_CELL_ASPECT,
): Promise<PreparedImage> {
  const sourceImage = await decodeImageFile(file);
  const effectiveDensity = resolveComputeDensity(
    sourceImage.naturalWidth,
    sourceImage.naturalHeight,
    density,
  );
  const imageData = rasterizeForEngine(
    sourceImage,
    sourceImage.naturalWidth,
    sourceImage.naturalHeight,
    effectiveDensity,
    cellAspect,
  );
  return { sourceImage, imageData, computeDensity: effectiveDensity };
}
