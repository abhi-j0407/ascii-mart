import { DEFAULT_DENSITY } from "./constants";
import type { BuildCellModelOptions, CellModel } from "./types";
import type {
  EngineWorkerRequest,
  EngineWorkerResponse,
} from "./workerMessages";

export class EngineWorkerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EngineWorkerError";
  }
}

export class EngineWorkerAbortedError extends Error {
  constructor() {
    super("Cell model computation was superseded by a newer request.");
    this.name = "EngineWorkerAbortedError";
  }
}

type PendingRequest = {
  readonly resolve: (model: CellModel) => void;
  readonly reject: (error: Error) => void;
};

let worker: Worker | null = null;
let requestId = 0;
let activeRequestId: number | null = null;
const pending = new Map<number, PendingRequest>();

function getWorker(): Worker {
  if (typeof window === "undefined") {
    throw new Error("Engine worker is only available in the browser.");
  }
  if (!worker) {
    worker = new Worker(new URL("../../workers/engine.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (event: MessageEvent<EngineWorkerResponse>) => {
      const response = event.data;
      const entry = pending.get(response.id);
      if (!entry) {
        return;
      }
      pending.delete(response.id);

      if (response.type === "success") {
        entry.resolve(response.cellModel);
        return;
      }
      entry.reject(new EngineWorkerError(response.message));
    };
    worker.onerror = (event) => {
      const message = event.message || "Engine worker failed.";
      for (const [id, entry] of pending) {
        pending.delete(id);
        entry.reject(new EngineWorkerError(message));
      }
    };
  }
  return worker;
}

export function terminateEngineWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  pending.clear();
  activeRequestId = null;
}

/**
 * Run {@link buildCellModel} off the main thread. Supersedes in-flight requests.
 */
export function computeCellModelInWorker(
  imageData: ImageData,
  options: Omit<BuildCellModelOptions, "atlas"> = {},
): Promise<CellModel> {
  const id = ++requestId;
  activeRequestId = id;

  for (const [otherId, entry] of pending) {
    pending.delete(otherId);
    entry.reject(new EngineWorkerAbortedError());
  }

  const { width, height, data } = imageData;
  const buffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  );

  const message: EngineWorkerRequest = {
    id,
    type: "compute",
    width,
    height,
    density: options.density ?? DEFAULT_DENSITY,
    buffer,
    options: stripDensity(options),
  };

  return new Promise<CellModel>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    getWorker().postMessage(message, [buffer]);
  }).then((model) => {
    if (activeRequestId !== id) {
      throw new EngineWorkerAbortedError();
    }
    return model;
  });
}

function stripDensity(
  options: Omit<BuildCellModelOptions, "atlas">,
): EngineWorkerRequest["options"] {
  // density is sent on the worker message root, not in nested options
  const { density: _omit, ...rest } = options;
  void _omit;
  return rest;
}
