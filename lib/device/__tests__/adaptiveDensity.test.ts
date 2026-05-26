import { describe, expect, it, vi, afterEach } from "vitest";

import { DEFAULT_DENSITY } from "@/store/types";

import { getAdaptiveDefaultDensity } from "../adaptiveDensity";

describe("getAdaptiveDefaultDensity", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns default density when window is undefined", () => {
    expect(getAdaptiveDefaultDensity()).toBe(DEFAULT_DENSITY);
  });

  it("lowers density on narrow viewports", () => {
    vi.stubGlobal("window", {
      matchMedia: (query: string) => ({
        matches: query.includes("max-width: 640px"),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
        onchange: null,
      }),
    });
    vi.stubGlobal("navigator", { hardwareConcurrency: 8 });

    expect(getAdaptiveDefaultDensity()).toBe(110);
  });
});
