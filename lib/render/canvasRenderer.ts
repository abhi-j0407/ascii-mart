import type { CellModel } from "@/lib/engine";
import type { CanonicalState } from "@/store/types";

import {
  CANVAS_BACKGROUND,
  glyphFillStyle,
  glyphForState,
  isAsciiState,
} from "./states";

export interface ViewportSize {
  readonly width: number;
  readonly height: number;
}

export interface LetterboxRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const DISPLAY_FONT =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

export function contentAspectFromCellModel(cellModel: CellModel): number {
  const { cols, rows, cellWidth, cellHeight } = cellModel;
  return (cols * cellWidth) / (rows * cellHeight);
}

export function contentAspectFromImage(image: HTMLImageElement): number {
  return image.naturalWidth / image.naturalHeight;
}

export function computeLetterbox(
  viewport: ViewportSize,
  contentAspect: number,
): LetterboxRect {
  const viewportAspect = viewport.width / viewport.height;

  let width: number;
  let height: number;

  if (contentAspect > viewportAspect) {
    width = viewport.width;
    height = viewport.width / contentAspect;
  } else {
    height = viewport.height;
    width = viewport.height * contentAspect;
  }

  return {
    x: (viewport.width - width) / 2,
    y: (viewport.height - height) / 2,
    width,
    height,
  };
}

function clearBackground(
  context: CanvasRenderingContext2D,
  viewport: ViewportSize,
): void {
  context.clearRect(0, 0, viewport.width, viewport.height);
  context.fillStyle = CANVAS_BACKGROUND;
  context.fillRect(0, 0, viewport.width, viewport.height);
}

function drawRealImage(
  context: CanvasRenderingContext2D,
  viewport: ViewportSize,
  sourceImage: HTMLImageElement,
): void {
  const frame = computeLetterbox(
    viewport,
    contentAspectFromImage(sourceImage),
  );
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    sourceImage,
    frame.x,
    frame.y,
    frame.width,
    frame.height,
  );
}

function drawAsciiGrid(
  context: CanvasRenderingContext2D,
  viewport: ViewportSize,
  cellModel: CellModel,
  state: CanonicalState,
): void {
  const { cols, rows, cells } = cellModel;
  const frame = computeLetterbox(
    viewport,
    contentAspectFromCellModel(cellModel),
  );

  const cellW = frame.width / cols;
  const cellH = frame.height / rows;
  const fontSize = Math.max(4, Math.min(cellW, cellH) * 0.92);

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `${fontSize}px ${DISPLAY_FONT}`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = cells[row]![col]!;
      const cx = frame.x + (col + 0.5) * cellW;
      const cy = frame.y + (row + 0.5) * cellH;

      context.fillStyle = glyphFillStyle(state, cell);
      context.fillText(glyphForState(state, cell), cx, cy);
    }
  }
}

export interface RenderFrameParams {
  readonly cellModel: CellModel | null;
  readonly state: CanonicalState;
  readonly sourceImage: HTMLImageElement | null;
}

export function renderFrame(
  context: CanvasRenderingContext2D,
  viewport: ViewportSize,
  params: RenderFrameParams,
): void {
  clearBackground(context, viewport);

  const { cellModel, state, sourceImage } = params;

  if (state === "real" && sourceImage) {
    drawRealImage(context, viewport, sourceImage);
    return;
  }

  if (cellModel && isAsciiState(state)) {
    drawAsciiGrid(context, viewport, cellModel, state);
  }
}
