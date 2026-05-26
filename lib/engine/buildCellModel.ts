import {
  DEFAULT_CELL_ASPECT,
  DEFAULT_DENSITY,
  DEFAULT_DOG_SIGMA_LARGE,
  DEFAULT_DOG_SIGMA_SMALL,
  DEFAULT_EDGE_THRESHOLD,
} from "./constants";
import { computeCellColors } from "./color";
import {
  aggregateCellEdges,
  computePixelEdgeMap,
  normalizeEdgeMagnitudes,
} from "./edges";
import { fillMono } from "./fill";
import { imageDataToLuminance } from "./luminance";
import { computeGridDimensions } from "./sampling";
import type { BuildCellModelOptions, Cell, CellModel } from "./types";

export function buildCellModel(
  image: ImageData,
  options: BuildCellModelOptions = {},
): CellModel {
  const density = options.density ?? DEFAULT_DENSITY;
  const cellAspect = options.cellAspect ?? DEFAULT_CELL_ASPECT;
  const dogSigmaSmall = options.dogSigmaSmall ?? DEFAULT_DOG_SIGMA_SMALL;
  const dogSigmaLarge = options.dogSigmaLarge ?? DEFAULT_DOG_SIGMA_LARGE;
  const edgeThreshold = options.edgeThreshold ?? DEFAULT_EDGE_THRESHOLD;

  const { width, height } = image;
  const { cols, rows, cellWidth, cellHeight } = computeGridDimensions(
    width,
    height,
    density,
    cellAspect,
  );
  const grid = { cols, rows, cellWidth, cellHeight };

  const mono = fillMono(image, options);
  const colors = computeCellColors(image, grid);

  const luminance = imageDataToLuminance(image);
  const rawEdgeMap = computePixelEdgeMap(
    luminance,
    width,
    height,
    dogSigmaSmall,
    dogSigmaLarge,
  );
  const { map: edgeMap } = normalizeEdgeMagnitudes(rawEdgeMap);
  const cellEdges = aggregateCellEdges(edgeMap, grid, edgeThreshold);

  const cells: Cell[][] = [];
  for (let row = 0; row < rows; row++) {
    const line: Cell[] = [];
    for (let col = 0; col < cols; col++) {
      const edge = cellEdges[row]![col];
      const fillChar = mono.grid[row]![col]!;
      const color = colors[row]![col]!;

      if (edge) {
        line.push({
          char: edge.glyph,
          color,
          isEdge: true,
        });
      } else {
        line.push({
          char: fillChar,
          color,
          isEdge: false,
        });
      }
    }
    cells.push(line);
  }

  return { cols, rows, cellWidth, cellHeight, cells };
}

export function cellModelToAscii(model: CellModel): string {
  return model.cells.map((row) => row.map((cell) => cell.char).join("")).join("\n");
}
