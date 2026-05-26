import { describe, expect, it } from "vitest";

import { findNearestBruteForce, KdTree, squaredDistance } from "../kdtree";

const POINTS = [
  { point: [0, 0, 0, 0, 0, 0], data: " " },
  { point: [1, 0, 0, 0, 0, 0], data: "_" },
  { point: [0, 1, 0, 0, 0, 0], data: "^" },
  { point: [0, 0, 1, 0, 0, 0], data: "-" },
  { point: [1, 1, 1, 1, 1, 1], data: "@" },
  { point: [0.2, 0.8, 0.2, 0.8, 0.2, 0.8], data: "M" },
] as const;

describe("KdTree", () => {
  it("finds the same nearest neighbour as brute force", () => {
    const tree = new KdTree([...POINTS]);
    const queries: number[][] = [
      [0.05, 0.02, 0.01, 0, 0, 0],
      [0.9, 0.85, 0.88, 0.92, 0.87, 0.9],
      [0.25, 0.75, 0.3, 0.7, 0.28, 0.72],
      [0.5, 0.1, 0.9, 0.2, 0.8, 0.15],
    ];

    for (const query of queries) {
      const fromTree = tree.findNearest(query)?.data;
      const fromBrute = findNearestBruteForce(query, POINTS)?.data;
      expect(fromTree).toBe(fromBrute);
    }
  });

  it("returns squared distance consistent with brute selection", () => {
    const tree = new KdTree([...POINTS]);
    const query = [0.15, 0.7, 0.2, 0.65, 0.18, 0.68];
    const treeHit = tree.findNearest(query);
    const bruteHit = findNearestBruteForce(query, POINTS);
    expect(treeHit?.data).toBe(bruteHit?.data);
    if (treeHit && bruteHit) {
      expect(squaredDistance(query, treeHit.point)).toBe(
        squaredDistance(query, bruteHit.point),
      );
    }
  });
});
