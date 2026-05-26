import type { CanonicalState } from "@/store/types";
import type { CellModel } from "@/lib/engine";

/**
 * Minimal Phase 4 verification draw — not the final Phase 5 renderer.
 */
export function drawStaticPreview(
  context: CanvasRenderingContext2D,
  cssWidth: number,
  cssHeight: number,
  cellModel: CellModel,
  state: CanonicalState,
  sourceImage: HTMLImageElement | null,
): void {
  context.clearRect(0, 0, cssWidth, cssHeight);
  context.fillStyle = "#fafafa";
  context.fillRect(0, 0, cssWidth, cssHeight);

  if (state === "real" && sourceImage) {
    const scale = Math.min(
      cssWidth / sourceImage.naturalWidth,
      cssHeight / sourceImage.naturalHeight,
    );
    const w = sourceImage.naturalWidth * scale;
    const h = sourceImage.naturalHeight * scale;
    const x = (cssWidth - w) / 2;
    const y = (cssHeight - h) / 2;
    context.drawImage(sourceImage, x, y, w, h);
    return;
  }

  const { cols, rows, cells } = cellModel;
  const cellW = cssWidth / cols;
  const cellH = cssHeight / rows;
  const fontSize = Math.max(4, Math.min(cellW, cellH) * 0.95);

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = cells[row]![col]!;
      const cx = (col + 0.5) * cellW;
      const cy = (row + 0.5) * cellH;

      let char = cell.char;
      if (state === "dot-grid") {
        char = ".";
      }

      if (state === "color") {
        const { r, g, b } = cell.color;
        context.fillStyle = `rgb(${r}, ${g}, ${b})`;
      } else {
        context.fillStyle = "#171717";
      }

      context.fillText(char, cx, cy);
    }
  }
}
