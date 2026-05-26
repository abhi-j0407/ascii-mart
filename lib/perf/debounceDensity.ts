import { DENSITY_RECOMPUTE_DEBOUNCE_MS } from "./constants";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleDensityRecompute(run: () => void): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    run();
  }, DENSITY_RECOMPUTE_DEBOUNCE_MS);
}

export function flushDensityRecompute(run: () => void): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  run();
}

export function cancelDensityRecompute(): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}
