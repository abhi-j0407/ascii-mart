"use client";

import { create } from "zustand";

import {
  DEFAULT_DENSITY,
  DEFAULT_SPEED,
  type AppStore,
  type CanonicalState,
} from "./types";

const noop = () => undefined;

export const useAppStore = create<AppStore>((set) => ({
  sourceImage: null,
  cellModel: null,
  currentState: "dot-grid",
  density: DEFAULT_DENSITY,
  speed: DEFAULT_SPEED,
  playbackStatus: "idle",

  setCurrentState: (state: CanonicalState) => set({ currentState: state }),
  setDensity: (density: number) => set({ density }),
  setSpeed: (speed: number) => set({ speed }),
  replay: noop,
  uploadImage: noop,
  downloadState: noop,
}));
