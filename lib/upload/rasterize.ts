import { DEFAULT_CELL_ASPECT } from "@/lib/engine/constants";

import { computeWorkingImageSize } from "./downscale";

let rasterCanvas: HTMLCanvasElement | null = null;

function getRasterCanvas(): HTMLCanvasElement {
  if (!rasterCanvas) {
    rasterCanvas = document.createElement("canvas");
  }
  return rasterCanvas;
}

/**
 * Draw the source image into a working-resolution ImageData for the engine.
 */
export function rasterizeForEngine(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  density: number,
  cellAspect: number = DEFAULT_CELL_ASPECT,
): ImageData {
  const { width, height } = computeWorkingImageSize(
    sourceWidth,
    sourceHeight,
    density,
    cellAspect,
  );

  const canvas = getRasterCanvas();
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Could not create a 2D canvas for image processing.");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);

  return ctx.getImageData(0, 0, width, height);
}
