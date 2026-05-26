import type { CellModel } from "@/lib/engine";
import { glyphForState } from "@/lib/render/states";
import type { CanonicalState } from "@/store/types";

export function cellModelToStateText(
  cellModel: CellModel,
  state: CanonicalState,
): string {
  return cellModel.cells
    .map((row) =>
      row.map((cell) => glyphForState(state, cell)).join(""),
    )
    .join("\n");
}

export function stateTextFilename(state: CanonicalState): string {
  return `ascii-canvas-${state}.txt`;
}
