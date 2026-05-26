import type { CanonicalState } from "@/store/types";

export const PHASE_DOT_REVEAL_MS = 1_000;
export const PHASE_DOT_TO_MONO_MS = 1_400;
export const PHASE_COLOR_FLOOD_MS = 1_200;
export const PHASE_COLOR_TO_REAL_MS = 900;

export const TOTAL_ANIMATION_MS =
  PHASE_DOT_REVEAL_MS +
  PHASE_DOT_TO_MONO_MS +
  PHASE_COLOR_FLOOD_MS +
  PHASE_COLOR_TO_REAL_MS;

export type AnimationPhase =
  | "dot-reveal"
  | "dot-to-mono"
  | "color-flood"
  | "color-to-real"
  | "complete";

export interface TimelineSnapshot {
  readonly phase: AnimationPhase;
  /** Progress within the current phase, in [0, 1]. */
  readonly phaseProgress: number;
  /** Elapsed animation time in ms (clamped to total duration). */
  readonly elapsedMs: number;
  readonly complete: boolean;
}

export function timelineAtElapsed(
  elapsedMs: number,
  speed: number,
): TimelineSnapshot {
  const scaledMs = elapsedMs * speed;
  const t = Math.min(TOTAL_ANIMATION_MS, Math.max(0, scaledMs));

  if (t >= TOTAL_ANIMATION_MS) {
    return {
      phase: "complete",
      phaseProgress: 1,
      elapsedMs: t,
      complete: true,
    };
  }

  let cursor = 0;

  cursor += PHASE_DOT_REVEAL_MS;
  if (t < cursor) {
    return {
      phase: "dot-reveal",
      phaseProgress: t / PHASE_DOT_REVEAL_MS,
      elapsedMs: t,
      complete: false,
    };
  }

  const morphStart = cursor;
  cursor += PHASE_DOT_TO_MONO_MS;
  if (t < cursor) {
    return {
      phase: "dot-to-mono",
      phaseProgress: (t - morphStart) / PHASE_DOT_TO_MONO_MS,
      elapsedMs: t,
      complete: false,
    };
  }

  const colorStart = cursor;
  cursor += PHASE_COLOR_FLOOD_MS;
  if (t < cursor) {
    return {
      phase: "color-flood",
      phaseProgress: (t - colorStart) / PHASE_COLOR_FLOOD_MS,
      elapsedMs: t,
      complete: false,
    };
  }

  const realStart = cursor;
  return {
    phase: "color-to-real",
    phaseProgress: (t - realStart) / PHASE_COLOR_TO_REAL_MS,
    elapsedMs: t,
    complete: false,
  };
}

/** Canonical state shown when scrubbing or when animation rests at phase end. */
export function canonicalStateForPhase(phase: AnimationPhase): CanonicalState {
  switch (phase) {
    case "dot-reveal":
      return "dot-grid";
    case "dot-to-mono":
      return "mono";
    case "color-flood":
      return "color";
    case "color-to-real":
    case "complete":
      return "real";
  }
}
