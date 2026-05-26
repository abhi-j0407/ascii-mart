export type CanonicalState = "dot-grid" | "mono" | "color" | "real";

export type PlaybackStatus = "idle" | "playing" | "processing";

/** Populated by the engine in Phase 3+. */
export interface CellModel {
  readonly _phase3?: never;
}

export interface AppState {
  sourceImage: HTMLImageElement | null;
  cellModel: CellModel | null;
  currentState: CanonicalState;
  density: number;
  speed: number;
  playbackStatus: PlaybackStatus;
}

export interface AppActions {
  setCurrentState: (state: CanonicalState) => void;
  setDensity: (density: number) => void;
  setSpeed: (speed: number) => void;
  replay: () => void;
  uploadImage: () => void;
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
