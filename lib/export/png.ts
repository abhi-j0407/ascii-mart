import type { CellModel } from "@/lib/engine";
import {
  glyphFillStyle,
  glyphForState,
  isAsciiState,
  MONO_GLYPH_COLOR,
} from "@/lib/render/states";
import type { CanonicalState } from "@/store/types";

import type { ExportBackground } from "./types";

/** Fixed cell height in export pixels — decoupled from on-screen letterboxing. */
export const EXPORT_CELL_HEIGHT_PX = 40;

const EXPORT_FONT =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

export interface ExportCanvasSize {
  readonly width: number;
  readonly height: number;
  readonly cellWidth: number;
  readonly cellHeight: number;
}

export interface RenderExportPngParams {
  readonly cellModel: CellModel | null;
  readonly state: CanonicalState;
  readonly sourceImage: HTMLImageElement | null;
  readonly background: ExportBackground;
}

export function computeExportCanvasSize(
  cellModel: CellModel,
): ExportCanvasSize {
  const cellHeight = EXPORT_CELL_HEIGHT_PX;
  const cellWidth = cellHeight * (cellModel.cellWidth / cellModel.cellHeight);
  return {
    width: Math.max(1, Math.round(cellModel.cols * cellWidth)),
    height: Math.max(1, Math.round(cellModel.rows * cellHeight)),
    cellWidth,
    cellHeight,
  };
}

function exportGlyphFillStyle(
  state: CanonicalState,
  cell: CellModel["cells"][number][number],
  background: ExportBackground,
): string {
  if (state === "color") {
    return glyphFillStyle(state, cell);
  }
  if (background === "black") {
    return "#fafafa";
  }
  return MONO_GLYPH_COLOR;
}

function applyExportBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: ExportBackground,
): void {
  context.clearRect(0, 0, width, height);
  if (background === "transparent") {
    return;
  }
  context.fillStyle = background === "white" ? "#ffffff" : "#000000";
  context.fillRect(0, 0, width, height);
}

function drawExportAsciiGrid(
  context: CanvasRenderingContext2D,
  cellModel: CellModel,
  state: CanonicalState,
  background: ExportBackground,
): void {
  const { cols, rows, cells } = cellModel;
  const { cellWidth, cellHeight } = computeExportCanvasSize(cellModel);

  const fontSize = Math.max(4, Math.min(cellWidth, cellHeight) * 0.92);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `${fontSize}px ${EXPORT_FONT}`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = cells[row]![col]!;
      const cx = (col + 0.5) * cellWidth;
      const cy = (row + 0.5) * cellHeight;

      context.fillStyle = exportGlyphFillStyle(state, cell, background);
      context.fillText(glyphForState(state, cell), cx, cy);
    }
  }
}

function drawExportRealImage(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  sourceImage: HTMLImageElement,
): void {
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(sourceImage, 0, 0, width, height);
}

export function renderExportToCanvas(
  params: RenderExportPngParams,
): HTMLCanvasElement | null {
  const { cellModel, state, sourceImage, background } = params;

  if (state === "real") {
    if (!sourceImage) {
      return null;
    }
    const width = sourceImage.naturalWidth;
    const height = sourceImage.naturalHeight;
    if (width < 1 || height < 1) {
      return null;
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }
    applyExportBackground(context, width, height, background);
    drawExportRealImage(context, width, height, sourceImage);
    return canvas;
  }

  if (!cellModel || !isAsciiState(state)) {
    return null;
  }

  const { width, height } = computeExportCanvasSize(cellModel);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  applyExportBackground(context, width, height, background);
  drawExportAsciiGrid(context, cellModel, state, background);
  return canvas;
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("PNG export failed."));
        }
      },
      "image/png",
    );
  });
}

export async function exportStatePng(
  params: RenderExportPngParams,
): Promise<Blob> {
  const canvas = renderExportToCanvas(params);
  if (!canvas) {
    throw new Error("Nothing to export for the current state.");
  }
  return canvasToPngBlob(canvas);
}

export function statePngFilename(state: CanonicalState): string {
  return `ascii-canvas-${state}.png`;
}
