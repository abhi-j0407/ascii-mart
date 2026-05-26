import type { CellModel } from "@/lib/engine";
import {
  type CellRevealOrders,
  cellPhaseProgress,
  easeOutCubic,
  type TimelineSnapshot,
} from "@/lib/animation";

import {
  type ViewportSize,
  computeLetterbox,
  contentAspectFromCellModel,
  contentAspectFromImage,
} from "./canvasRenderer";
import {
  CANVAS_BACKGROUND,
  DOT_GRID_CHAR,
  MONO_GLYPH_COLOR,
} from "./states";

const DISPLAY_FONT =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

const MORPH_SPREAD = 0.4;
const COLOR_SPREAD = 0.4;

function lerpByte(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function mixMonoToColor(
  mono: string,
  r: number,
  g: number,
  b: number,
  t: number,
): string {
  if (t <= 0) return mono;
  if (t >= 1) return `rgb(${r}, ${g}, ${b})`;
  const mr = 23;
  const mg = 23;
  const mb = 23;
  return `rgb(${lerpByte(mr, r, t)}, ${lerpByte(mg, g, t)}, ${lerpByte(mb, b, t)})`;
}

export interface RenderAnimatedFrameParams {
  readonly cellModel: CellModel;
  readonly sourceImage: HTMLImageElement;
  readonly orders: CellRevealOrders;
  readonly snapshot: TimelineSnapshot;
}

export function renderAnimatedFrame(
  context: CanvasRenderingContext2D,
  viewport: ViewportSize,
  params: RenderAnimatedFrameParams,
): void {
  const { cellModel, sourceImage, orders, snapshot } = params;
  const { cols, rows, cells } = cellModel;

  context.clearRect(0, 0, viewport.width, viewport.height);
  context.fillStyle = CANVAS_BACKGROUND;
  context.fillRect(0, 0, viewport.width, viewport.height);

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

  const { phase, phaseProgress } = snapshot;

  if (phase === "color-to-real" || phase === "complete") {
    const crossfade = phase === "complete" ? 1 : easeOutCubic(phaseProgress);
    drawAsciiAnimated(
      context,
      frame,
      cols,
      rows,
      cells,
      orders,
      "color-flood",
      1,
      cellW,
      cellH,
    );
    const realFrame = computeLetterbox(
      viewport,
      contentAspectFromImage(sourceImage),
    );
    context.save();
    context.globalAlpha = crossfade;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
      sourceImage,
      realFrame.x,
      realFrame.y,
      realFrame.width,
      realFrame.height,
    );
    context.restore();
    return;
  }

  drawAsciiAnimated(
    context,
    frame,
    cols,
    rows,
    cells,
    orders,
    phase,
    phaseProgress,
    cellW,
    cellH,
  );
}

function drawAsciiAnimated(
  context: CanvasRenderingContext2D,
  frame: { x: number; y: number; width: number; height: number },
  cols: number,
  rows: number,
  cells: CellModel["cells"],
  orders: CellRevealOrders,
  phase: TimelineSnapshot["phase"],
  phaseProgress: number,
  cellW: number,
  cellH: number,
): void {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;
      const cell = cells[row]![col]!;
      const cx = frame.x + (col + 0.5) * cellW;
      const cy = frame.y + (row + 0.5) * cellH;

      const dotRank = orders.dotReveal[idx]!;
      const morphRank = orders.morphReveal[idx]!;
      const colorRank = orders.colorReveal[idx]!;

      let dotVisible = false;
      let dotScale = 0;
      let glyphAlpha = 0;
      let glyphScale = 0.6;
      let colorMix = 0;

      if (phase === "dot-reveal") {
        const p = cellPhaseProgress(phaseProgress, dotRank, 0.3);
        dotVisible = p > 0;
        dotScale = easeOutCubic(p);
      } else if (phase === "dot-to-mono") {
        dotVisible = true;
        dotScale = 1;
        const p = cellPhaseProgress(phaseProgress, morphRank, MORPH_SPREAD);
        glyphAlpha = easeOutCubic(p);
        glyphScale = 0.6 + 0.4 * glyphAlpha;
      } else if (phase === "color-flood") {
        dotVisible = false;
        glyphAlpha = 1;
        glyphScale = 1;
        const p = cellPhaseProgress(phaseProgress, colorRank, COLOR_SPREAD);
        colorMix = easeOutCubic(p);
      }

      if (!dotVisible && glyphAlpha <= 0) continue;

      context.save();
      context.translate(cx, cy);

      if (dotVisible && glyphAlpha < 1) {
        context.save();
        context.globalAlpha = 1 - glyphAlpha;
        context.scale(dotScale, dotScale);
        context.fillStyle = MONO_GLYPH_COLOR;
        context.fillText(DOT_GRID_CHAR, 0, 0);
        context.restore();
      }

      if (glyphAlpha > 0) {
        context.save();
        context.globalAlpha = glyphAlpha;
        context.scale(glyphScale, glyphScale);
        context.fillStyle = mixMonoToColor(
          MONO_GLYPH_COLOR,
          cell.color.r,
          cell.color.g,
          cell.color.b,
          colorMix,
        );
        context.fillText(cell.char, 0, 0);
        context.restore();
      }

      context.restore();
    }
  }
}
