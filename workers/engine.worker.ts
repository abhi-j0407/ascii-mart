/// <reference lib="webworker" />

import { buildCellModel } from "@/lib/engine/buildCellModel";
import { createGlyphAtlas } from "@/lib/engine/glyphAtlas";
import type { GlyphAtlas } from "@/lib/engine/types";
import type {
  EngineWorkerRequest,
  EngineWorkerResponse,
} from "@/lib/engine/workerMessages";

let atlas: GlyphAtlas | null = null;

function getAtlas(): GlyphAtlas {
  if (!atlas) {
    const canvas = new OffscreenCanvas(1, 1);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Worker could not create OffscreenCanvas 2D context.");
    }
    atlas = createGlyphAtlas(ctx as unknown as CanvasRenderingContext2D);
  }
  return atlas;
}

function handleCompute(message: EngineWorkerRequest): EngineWorkerResponse {
  const { id, width, height, density, buffer, options } = message;
  try {
    const data = new Uint8ClampedArray(buffer);
    const imageData = new ImageData(data, width, height);
    const cellModel = buildCellModel(imageData, {
      ...options,
      density,
      atlas: getAtlas(),
    });
    return { id, type: "success", cellModel };
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : "Cell model computation failed.";
    return { id, type: "error", message: messageText };
  }
}

self.onmessage = (event: MessageEvent<EngineWorkerRequest>) => {
  const response = handleCompute(event.data);
  self.postMessage(response);
};
