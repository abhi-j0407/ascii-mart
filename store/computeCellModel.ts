import {
  EngineWorkerAbortedError,
  computeCellModelInWorker,
} from "@/lib/engine/client";
import { rasterizeForEngine } from "@/lib/upload/rasterize";
import { UploadValidationError } from "@/lib/upload/validate";

import type { AppStore } from "./types";

type StoreSet = (
  partial:
    | Partial<AppStore>
    | ((state: AppStore) => Partial<AppStore>),
) => void;
type StoreGet = () => AppStore;

function uploadErrorMessage(error: unknown): string {
  if (error instanceof UploadValidationError) {
    return error.message;
  }
  if (error instanceof EngineWorkerAbortedError) {
    return "";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong while processing that image.";
}

export async function recomputeCellModel(
  get: StoreGet,
  set: StoreSet,
): Promise<void> {
  const { sourceImage, density } = get();
  if (!sourceImage) {
    return;
  }

  set({ playbackStatus: "processing", uploadError: null });

  try {
    const imageData = rasterizeForEngine(
      sourceImage,
      sourceImage.naturalWidth,
      sourceImage.naturalHeight,
      density,
    );
    const cellModel = await computeCellModelInWorker(imageData, { density });
    set({ cellModel, playbackStatus: "idle", uploadError: null });
  } catch (error) {
    if (error instanceof EngineWorkerAbortedError) {
      return;
    }
    set({
      playbackStatus: "idle",
      uploadError: uploadErrorMessage(error),
    });
  }
}
