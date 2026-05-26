import type { Cell } from "@/lib/engine";
import type { CanonicalState } from "@/store/types";

export const CANVAS_BACKGROUND = "#fafafa";
export const MONO_GLYPH_COLOR = "#171717";
export const DOT_GRID_CHAR = ".";

export function isAsciiState(state: CanonicalState): boolean {
  return state !== "real";
}

export function glyphForState(state: CanonicalState, cell: Cell): string {
  if (state === "dot-grid") {
    return DOT_GRID_CHAR;
  }
  return cell.char;
}

export function glyphFillStyle(state: CanonicalState, cell: Cell): string {
  if (state === "color") {
    const { r, g, b } = cell.color;
    return `rgb(${r}, ${g}, ${b})`;
  }
  return MONO_GLYPH_COLOR;
}
