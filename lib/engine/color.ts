import type { GridDimensions } from "./types";

export interface RgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/** Row-major average RGB (0–255) per cell. */
export function computeCellColors(
  image: ImageData,
  grid: GridDimensions,
): RgbColor[][] {
  const { width, height, data } = image;
  const { cols, rows, cellWidth, cellHeight } = grid;
  const colors: RgbColor[][] = [];

  for (let row = 0; row < rows; row++) {
    const line: RgbColor[] = [];
    const y0 = Math.floor(row * cellHeight);
    const y1 = Math.min(height, Math.ceil((row + 1) * cellHeight));

    for (let col = 0; col < cols; col++) {
      const x0 = Math.floor(col * cellWidth);
      const x1 = Math.min(width, Math.ceil((col + 1) * cellWidth));

      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let count = 0;

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * width + x) * 4;
          rSum += data[i]!;
          gSum += data[i + 1]!;
          bSum += data[i + 2]!;
          count++;
        }
      }

      if (count === 0) {
        line.push({ r: 0, g: 0, b: 0 });
      } else {
        line.push({
          r: Math.round(rSum / count),
          g: Math.round(gSum / count),
          b: Math.round(bSum / count),
        });
      }
    }
    colors.push(line);
  }

  return colors;
}
