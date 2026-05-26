import { DEFAULT_DENSITY } from "@/store/types";

const DENSITY_MOBILE = 110;
const DENSITY_TABLET = 130;
const DENSITY_LOW_POWER = 100;

function isLowPowerDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const cores = navigator.hardwareConcurrency;
  if (cores !== undefined && cores <= 4) {
    return true;
  }

  const memory = (
    navigator as Navigator & { deviceMemory?: number }
  ).deviceMemory;
  if (memory !== undefined && memory <= 4) {
    return true;
  }

  return false;
}

/**
 * Default density for this device/viewport (locked decision #10).
 */
export function getAdaptiveDefaultDensity(): number {
  if (typeof window === "undefined") {
    return DEFAULT_DENSITY;
  }

  let density = DEFAULT_DENSITY;

  if (window.matchMedia("(max-width: 640px)").matches) {
    density = DENSITY_MOBILE;
  } else if (window.matchMedia("(max-width: 1024px)").matches) {
    density = DENSITY_TABLET;
  }

  if (isLowPowerDevice()) {
    density = Math.min(density, DENSITY_LOW_POWER);
  }

  return density;
}
