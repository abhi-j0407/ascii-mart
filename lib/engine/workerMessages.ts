import type { BuildCellModelOptions, CellModel } from "./types";

export type EngineWorkerRequest = {
  readonly id: number;
  readonly type: "compute";
  readonly width: number;
  readonly height: number;
  readonly density: number;
  readonly buffer: ArrayBuffer;
  readonly options?: Omit<BuildCellModelOptions, "atlas" | "density">;
};

export type EngineWorkerSuccess = {
  readonly id: number;
  readonly type: "success";
  readonly cellModel: CellModel;
};

export type EngineWorkerFailure = {
  readonly id: number;
  readonly type: "error";
  readonly message: string;
};

export type EngineWorkerResponse = EngineWorkerSuccess | EngineWorkerFailure;
