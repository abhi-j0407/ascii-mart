import { CACHE_QUANTIZE_BITS, CACHE_QUANTIZE_RANGE } from "./constants";
import {
  findNearestBruteForce,
  KdTree,
  type KdPoint,
  squaredDistance,
} from "./kdtree";
import type { GlyphEntry, ShapeVector } from "./types";

export function quantizeComponent(
  value: number,
  range: number = CACHE_QUANTIZE_RANGE,
): number {
  return Math.min(range - 1, Math.floor(value * range));
}

export function cacheKeyFromVector(
  vector: readonly number[],
  bits: number = CACHE_QUANTIZE_BITS,
  range: number = CACHE_QUANTIZE_RANGE,
): number {
  let key = 0;
  for (let i = 0; i < vector.length; i++) {
    const quantized = quantizeComponent(vector[i]!, range);
    key = (key << bits) | quantized;
  }
  return key;
}

export class ShapeLookup {
  private readonly points: readonly KdPoint<string>[];
  private readonly tree: KdTree<string>;
  private readonly cache = new Map<number, string>();

  constructor(glyphs: readonly GlyphEntry[]) {
    this.points = glyphs.map((g) => ({
      point: g.shapeVector,
      data: g.char,
    }));
    this.tree = new KdTree(this.points);
  }

  findNearest(vector: ShapeVector): string {
    const key = cacheKeyFromVector(vector);
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    const nearest =
      this.tree.findNearest(vector) ??
      findNearestBruteForce(vector, this.points);
    const char = nearest?.data ?? " ";
    this.cache.set(key, char);
    return char;
  }

  /** Exposed for tests comparing k-d tree vs brute force. */
  findNearestBrute(vector: ShapeVector): string {
    return findNearestBruteForce(vector, this.points)?.data ?? " ";
  }

  findNearestDistanceSq(vector: ShapeVector): number {
    const nearest = this.tree.findNearest(vector);
    if (!nearest) {
      return Infinity;
    }
    return squaredDistance(vector, nearest.point);
  }
}
