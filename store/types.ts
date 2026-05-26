import type { CellModel } from "@/lib/engine";
import type { ExportBackground } from "@/lib/export/types";

export type { CellModel };
export type { ExportBackground };

export type CanonicalState = "dot-grid" | "mono" | "color" | "real";

export type PlaybackStatus = "idle" | "playing" | "processing";

export interface AppState {
  sourceImage: HTMLImageElement | null;
  cellModel: CellModel | null;
  currentState: CanonicalState;
  density: number;
  speed: number;
  playbackStatus: PlaybackStatus;
  /** Incremented when a new playback run starts (upload or replay). */
  playbackEpoch: number;
  uploadError: string | null;
  exportBackground: ExportBackground;
}

export interface AppActions {
  setCurrentState: (state: CanonicalState) => void;
  setDensity: (density: number) => void;
  setSpeed: (speed: number) => void;
  replay: () => void;
  processFile: (file: File) => Promise<void>;
  clearUploadError: () => void;
  setExportBackground: (background: ExportBackground) => void;
  downloadState: () => void;
}

export type AppStore = AppState & AppActions;

export const CANONICAL_STATES: readonly {
  value: CanonicalState;
  label: string;
}[] = [
  { value: "dot-grid", label: "Dots" },
  { value: "mono", label: "Mono" },
  { value: "color", label: "Color" },
  { value: "real", label: "Real" },
] as const;

export const DEFAULT_DENSITY = 150;
export const DEFAULT_SPEED = 1;
