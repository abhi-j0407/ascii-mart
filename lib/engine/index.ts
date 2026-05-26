export {
  CACHE_QUANTIZE_BITS,
  CACHE_QUANTIZE_RANGE,
  DEFAULT_CELL_ASPECT,
  DEFAULT_CONTRAST_EXPONENT,
  DEFAULT_DENSITY,
  DEFAULT_SAMPLE_QUALITY,
  INTERNAL_CIRCLES,
  PRINTABLE_ASCII,
} from "./constants";
export { fillMono, fillMonoAscii, gridToAscii } from "./fill";
export {
  buildGlyphEntries,
  createGlyphAtlas,
  getDefaultGlyphAtlas,
  resetDefaultGlyphAtlas,
  type GlyphAtlasBuildOptions,
} from "./glyphAtlas";
export { imageDataToLuminance, luminanceAt, rgbToLuminance } from "./luminance";
export {
  cacheKeyFromVector,
  quantizeComponent,
  ShapeLookup,
} from "./lookup";
export {
  findNearestBruteForce,
  KdTree,
  squaredDistance,
  type KdPoint,
} from "./kdtree";
export {
  applyGlobalContrast,
  computeGridDimensions,
  normalizeShapeVectors,
  sampleCellShapeVector,
  sampleCircleFromImage,
} from "./sampling";
export type {
  GlyphAtlas,
  GlyphEntry,
  GridDimensions,
  MonoFillOptions,
  MonoFillResult,
  SamplingCircle,
  ShapeVector,
} from "./types";
export { SHAPE_DIMENSIONS } from "./types";
