export interface KdPoint<T> {
  readonly point: readonly number[];
  readonly data: T;
}

interface KdNode<T> {
  readonly point: readonly number[];
  readonly data: T;
  readonly axis: number;
  readonly left: KdNode<T> | null;
  readonly right: KdNode<T> | null;
}

function squaredDistance(a: readonly number[], b: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i]! - b[i]!;
    sum += d * d;
  }
  return sum;
}

function buildNode<T>(
  points: KdPoint<T>[],
  depth: number,
  dimensions: number,
): KdNode<T> | null {
  if (points.length === 0) {
    return null;
  }
  const axis = depth % dimensions;
  const sorted = [...points].sort((a, b) => a.point[axis]! - b.point[axis]!);
  const mid = Math.floor(sorted.length / 2);
  const current = sorted[mid]!;
  return {
    point: current.point,
    data: current.data,
    axis,
    left: buildNode(sorted.slice(0, mid), depth + 1, dimensions),
    right: buildNode(sorted.slice(mid + 1), depth + 1, dimensions),
  };
}

export class KdTree<T> {
  private readonly root: KdNode<T> | null;
  private readonly dimensions: number;

  constructor(points: readonly KdPoint<T>[]) {
    this.dimensions =
      points.length > 0 ? points[0]!.point.length : 0;
    this.root =
      points.length > 0
        ? buildNode([...points], 0, this.dimensions)
        : null;
  }

  findNearest(query: readonly number[]): KdPoint<T> | null {
    if (!this.root) {
      return null;
    }
    let best: KdPoint<T> | null = null;
    let bestDist = Infinity;

    const search = (node: KdNode<T> | null): void => {
      if (!node) {
        return;
      }
      const dist = squaredDistance(query, node.point);
      if (dist < bestDist) {
        bestDist = dist;
        best = { point: node.point, data: node.data };
      }
      const axis = node.axis;
      const diff = query[axis]! - node.point[axis]!;
      const near = diff < 0 ? node.left : node.right;
      const far = diff < 0 ? node.right : node.left;
      search(near);
      if (diff * diff < bestDist) {
        search(far);
      }
    };

    search(this.root);
    return best;
  }
}

/** Brute-force nearest neighbour (for tests and cache misses). */
export function findNearestBruteForce<T>(
  query: readonly number[],
  points: readonly KdPoint<T>[],
): KdPoint<T> | null {
  let best: KdPoint<T> | null = null;
  let bestDist = Infinity;
  for (const entry of points) {
    const dist = squaredDistance(query, entry.point);
    if (dist < bestDist) {
      bestDist = dist;
      best = entry;
    }
  }
  return best;
}

export { squaredDistance };
