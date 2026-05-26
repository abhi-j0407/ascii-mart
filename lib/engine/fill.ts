import {
  DEFAULT_CELL_ASPECT,
  DEFAULT_CONTRAST_EXPONENT,
  DEFAULT_DENSITY,
  DEFAULT_SAMPLE_QUALITY,
} from "./constants";
import { getDefaultGlyphAtlas } from "./glyphAtlas";
import { imageDataToLuminance } from "./luminance";
import {
  applyGlobalContrast,
  computeGridDimensions,
  sampleCellShapeVector,
} from "./sampling";
import type { MonoFillOptions, MonoFillResult } from "./types";

export function fillMono(
  image: ImageData,
  options: MonoFillOptions = {},
): MonoFillResult {
  const density = options.density ?? DEFAULT_DENSITY;
  const cellAspect = options.cellAspect ?? DEFAULT_CELL_ASPECT;
  const contrastExponent = options.contrastExponent ?? DEFAULT_CONTRAST_EXPONENT;
  const sampleQuality = options.sampleQuality ?? DEFAULT_SAMPLE_QUALITY;
  const atlas = options.atlas ?? getDefaultGlyphAtlas();

  const { width, height } = image;
  const luminance = imageDataToLuminance(image);
  const { cols, rows, cellWidth, cellHeight } = computeGridDimensions(
    width,
    height,
    density,
    cellAspect,
  );

  const grid: string[][] = [];
  for (let row = 0; row < rows; row++) {
    const line: string[] = [];
    for (let col = 0; col < cols; col++) {
      let vector = sampleCellShapeVector(
        luminance,
        width,
        height,
        col,
        row,
        cellWidth,
        cellHeight,
        sampleQuality,
      );
      vector = applyGlobalContrast(vector, contrastExponent);
      line.push(atlas.lookup.findNearest(vector));
    }
    grid.push(line);
  }

  return { cols, rows, grid };
}

export function gridToAscii(grid: readonly (readonly string[])[]): string {
  return grid.map((row) => row.join("")).join("\n");
}

export function fillMonoAscii(
  image: ImageData,
  options?: MonoFillOptions,
): string {
  return gridToAscii(fillMono(image, options).grid);
}
