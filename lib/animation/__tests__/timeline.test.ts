import { describe, expect, it } from "vitest";

import {
  PHASE_COLOR_FLOOD_MS,
  PHASE_COLOR_TO_REAL_MS,
  PHASE_DOT_REVEAL_MS,
  PHASE_DOT_TO_MONO_MS,
  TOTAL_ANIMATION_MS,
  canonicalStateForPhase,
  timelineAtElapsed,
} from "../timeline";

describe("timelineAtElapsed", () => {
  it("starts in dot-reveal", () => {
    const snap = timelineAtElapsed(0, 1);
    expect(snap.phase).toBe("dot-reveal");
    expect(snap.phaseProgress).toBe(0);
    expect(snap.complete).toBe(false);
  });

  it("enters morph after dot reveal duration", () => {
    const snap = timelineAtElapsed(PHASE_DOT_REVEAL_MS + 1, 1);
    expect(snap.phase).toBe("dot-to-mono");
  });

  it("enters color flood after morph", () => {
    const t =
      PHASE_DOT_REVEAL_MS + PHASE_DOT_TO_MONO_MS + 1;
    expect(timelineAtElapsed(t, 1).phase).toBe("color-flood");
  });

  it("enters real crossfade after color flood", () => {
    const t =
      PHASE_DOT_REVEAL_MS +
      PHASE_DOT_TO_MONO_MS +
      PHASE_COLOR_FLOOD_MS +
      1;
    expect(timelineAtElapsed(t, 1).phase).toBe("color-to-real");
  });

  it("marks complete at total duration", () => {
    const snap = timelineAtElapsed(TOTAL_ANIMATION_MS, 1);
    expect(snap.complete).toBe(true);
    expect(snap.phase).toBe("complete");
  });

  it("scales elapsed time by speed", () => {
    const atHalf = timelineAtElapsed(TOTAL_ANIMATION_MS / 2, 2);
    expect(atHalf.complete).toBe(true);
  });
});

describe("canonicalStateForPhase", () => {
  it("maps phases to scrub stops", () => {
    expect(canonicalStateForPhase("dot-reveal")).toBe("dot-grid");
    expect(canonicalStateForPhase("dot-to-mono")).toBe("mono");
    expect(canonicalStateForPhase("color-flood")).toBe("color");
    expect(canonicalStateForPhase("color-to-real")).toBe("real");
    expect(canonicalStateForPhase("complete")).toBe("real");
  });
});

describe("phase durations", () => {
  it("sums to total animation length", () => {
    expect(
      PHASE_DOT_REVEAL_MS +
        PHASE_DOT_TO_MONO_MS +
        PHASE_COLOR_FLOOD_MS +
        PHASE_COLOR_TO_REAL_MS,
    ).toBe(TOTAL_ANIMATION_MS);
  });
});
