import { DEFAULT_CELL_ASPECT } from "@/lib/engine/constants";

import { decodeImageFile } from "./decode";
import { rasterizeForEngine } from "./rasterize";

export interface PreparedImage {
  /** Full-resolution source kept for later “real image” rendering. */
  readonly sourceImage: HTMLImageElement;
  readonly imageData: ImageData;
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
  const imageData = rasterizeForEngine(
    sourceImage,
    sourceImage.naturalWidth,
    sourceImage.naturalHeight,
    density,
    cellAspect,
  );
  return { sourceImage, imageData };
}
