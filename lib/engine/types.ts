import type { RgbColor } from "./color";
import type { ShapeLookup } from "./lookup";

/** Six-component shape / sampling vector (staggered 3×2 circles). */
export type ShapeVector = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
];

export const SHAPE_DIMENSIONS = 6 as const;

export interface SamplingCircle {
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
}

export interface GlyphEntry {
  readonly char: string;
  readonly shapeVector: ShapeVector;
}

export interface GlyphAtlas {
  readonly glyphs: readonly GlyphEntry[];
  readonly lookup: ShapeLookup;
}

export interface GridDimensions {
  readonly cols: number;
  readonly rows: number;
  readonly cellWidth: number;
  readonly cellHeight: number;
}

export interface MonoFillOptions {
  /** Target width in characters (columns). Default 150. */
  readonly density?: number;
  /** Character cell width÷height in image pixels. Default 0.5. */
  readonly cellAspect?: number;
  /** Global contrast exponent (1 = off). Default 2. */
  readonly contrastExponent?: number;
  /** Approximate samples per sampling circle. Default 16. */
  readonly sampleQuality?: number;
  /** Reuse a pre-built atlas (e.g. from tests). */
  readonly atlas?: GlyphAtlas;
}

export interface MonoFillResult {
  readonly cols: number;
  readonly rows: number;
  /** Row-major glyph grid [row][col]. */
  readonly grid: readonly (readonly string[])[];
}

export interface Cell {
  readonly char: string;
  readonly color: RgbColor;
  readonly isEdge: boolean;
}

export interface CellModel {
  readonly cols: number;
  readonly rows: number;
  readonly cellWidth: number;
  readonly cellHeight: number;
  /** Row-major cells [row][col]. */
  readonly cells: readonly (readonly Cell[])[];
}

export interface BuildCellModelOptions extends MonoFillOptions {
  /** DoG small sigma. */
  readonly dogSigmaSmall?: number;
  /** DoG large sigma. */
  readonly dogSigmaLarge?: number;
  /**
   * Edge strength threshold on normalized magnitudes (0–1).
   * Cells whose peak edge magnitude meets or exceed this override fill glyphs.
   */
  readonly edgeThreshold?: number;
}
