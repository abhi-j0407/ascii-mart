"use client";

import { useAppStore } from "@/store/useAppStore";

type CanvasFrameProps = {
  readonly children: React.ReactNode;
};

/**
 * Letterboxes the canvas to the source image aspect when known (locked #10).
 */
export function CanvasFrame({ children }: CanvasFrameProps) {
  const sourceImage = useAppStore((state) => state.sourceImage);

  const aspect =
    sourceImage && sourceImage.naturalWidth > 0 && sourceImage.naturalHeight > 0
      ? `${sourceImage.naturalWidth} / ${sourceImage.naturalHeight}`
      : "4 / 3";

  return (
    <div
      className="relative w-full max-h-full overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]"
      style={{ aspectRatio: aspect }}
    >
      {children}
    </div>
  );
}
