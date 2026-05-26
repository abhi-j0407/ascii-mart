import type { SamplingCircle } from "./types";

/** Printable ASCII (space through tilde). */
export const PRINTABLE_ASCII =
  " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

/** Staggered 3×2 internal sampling circles (normalized cell coordinates). */
export const INTERNAL_CIRCLES: readonly SamplingCircle[] = [
  { cx: 0.3, cy: 0.2, radius: 0.22 },
  { cx: 0.7, cy: 0.15, radius: 0.22 },
  { cx: 0.3, cy: 0.5, radius: 0.22 },
  { cx: 0.7, cy: 0.5, radius: 0.22 },
  { cx: 0.3, cy: 0.8, radius: 0.22 },
  { cx: 0.7, cy: 0.85, radius: 0.22 },
] as const;

export const DEFAULT_DENSITY = 150;
export const DEFAULT_CELL_ASPECT = 0.5;
export const DEFAULT_CONTRAST_EXPONENT = 2;
export const DEFAULT_SAMPLE_QUALITY = 16;

/** Quantized cache: bits per vector component (Alex Harri). */
export const CACHE_QUANTIZE_BITS = 5;
/** Quantized value range 0..RANGE-1 (Harri uses 8). */
export const CACHE_QUANTIZE_RANGE = 8;

/** High-res glyph rasterization scale for atlas generation. */
export const GLYPH_RENDER_SCALE = 8;
export const GLYPH_CELL_WIDTH = 10;
export const GLYPH_CELL_HEIGHT = 20;
