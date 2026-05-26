"use client";

import { create } from "zustand";

import {
  EngineWorkerAbortedError,
  computeCellModelInWorker,
} from "@/lib/engine/client";
import { prepareImageUpload } from "@/lib/upload/prepare";
import { UploadValidationError } from "@/lib/upload/validate";

import { recomputeCellModel } from "./computeCellModel";
import {
  DEFAULT_DENSITY,
  DEFAULT_SPEED,
  type AppStore,
  type CanonicalState,
} from "./types";

const noop = () => undefined;

function beginPlayback(
  set: (partial: Partial<AppStore>) => void,
  get: () => AppStore,
): void {
  const { cellModel, sourceImage } = get();
  if (!cellModel || !sourceImage) {
    return;
  }
  set({
    playbackStatus: "playing",
    playbackEpoch: get().playbackEpoch + 1,
    currentState: "dot-grid",
  });
}

export const useAppStore = create<AppStore>((set, get) => ({
  sourceImage: null,
  cellModel: null,
  currentState: "dot-grid",
  density: DEFAULT_DENSITY,
  speed: DEFAULT_SPEED,
  playbackStatus: "idle",
  playbackEpoch: 0,
  uploadError: null,

  setCurrentState: (state: CanonicalState) =>
    set({ currentState: state, playbackStatus: "idle" }),

  setDensity: (density: number) => {
    set({ density });
    void recomputeCellModel(get, set);
  },

  setSpeed: (speed: number) => set({ speed }),

  replay: () => beginPlayback(set, get),

  processFile: async (file: File) => {
    const density = get().density;
    set({ playbackStatus: "processing", uploadError: null });

    try {
      const { sourceImage, imageData } = await prepareImageUpload(file, density);
      set({ sourceImage });
      const cellModel = await computeCellModelInWorker(imageData, { density });
      set({
        cellModel,
        uploadError: null,
        currentState: "dot-grid",
        playbackStatus: "playing",
        playbackEpoch: get().playbackEpoch + 1,
      });
    } catch (error) {
      if (error instanceof EngineWorkerAbortedError) {
        return;
      }
      const message =
        error instanceof UploadValidationError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Something went wrong while processing that image.";
      set({
        playbackStatus: "idle",
        uploadError: message,
        sourceImage: null,
        cellModel: null,
      });
    }
  },

  clearUploadError: () => set({ uploadError: null }),

  downloadState: noop,
}));
