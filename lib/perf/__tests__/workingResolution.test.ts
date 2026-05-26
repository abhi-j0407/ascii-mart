import { describe, expect, it } from "vitest";

import { capWorkingDimensions } from "../workingResolution";

describe("capWorkingDimensions", () => {
  it("returns dimensions unchanged when within cap", () => {
    expect(capWorkingDimensions(480, 320, 2048)).toEqual({
      width: 480,
      height: 320,
    });
  });

  it("scales down the longest side to the cap", () => {
    const result = capWorkingDimensions(4096, 1024, 2048);
    expect(Math.max(result.width, result.height)).toBe(2048);
    expect(result.width).toBe(2048);
    expect(result.height).toBe(512);
  });
});
