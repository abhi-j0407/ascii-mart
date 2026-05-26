/** Max rasterized working bitmap dimension (longest side), in pixels. */
export const MAX_WORKING_SIDE_PX = 2048;

/** Max total cells (cols × rows) before density is reduced for compute. */
export const MAX_GRID_CELLS = 48_000;

/** Debounce window for density slider → worker recompute (ms). */
export const DENSITY_RECOMPUTE_DEBOUNCE_MS = 300;
