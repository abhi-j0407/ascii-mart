"use client";

import { useEffect, useRef } from "react";

import { drawStaticPreview } from "@/lib/render/drawStaticPreview";
import { useAppStore } from "@/store/useAppStore";

export function CanvasPlaceholder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cellModel = useAppStore((state) => state.cellModel);
  const currentState = useAppStore((state) => state.currentState);
  const sourceImage = useAppStore((state) => state.sourceImage);
  const playbackStatus = useAppStore((state) => state.playbackStatus);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (cellModel) {
        drawStaticPreview(
          context,
          rect.width,
          rect.height,
          cellModel,
          currentState,
          sourceImage,
        );
        return;
      }

      context.clearRect(0, 0, rect.width, rect.height);
      context.fillStyle = "#fafafa";
      context.fillRect(0, 0, rect.width, rect.height);

      context.strokeStyle = "#e5e5e5";
      context.lineWidth = 1;
      const step = 24;
      for (let x = 0; x <= rect.width; x += step) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, rect.height);
        context.stroke();
      }
      for (let y = 0; y <= rect.height; y += step) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(rect.width, y);
        context.stroke();
      }

      context.fillStyle = "#a3a3a3";
      context.font = "13px var(--font-geist-sans, system-ui, sans-serif)";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("Upload an image to begin", rect.width / 2, rect.height / 2);
    };

    draw();

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [cellModel, currentState, sourceImage]);

  const processing = playbackStatus === "processing";

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        aria-label="ASCII canvas preview"
        className="h-full w-full rounded-sm bg-neutral-50"
      />
      {processing ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70"
          role="status"
          aria-live="polite"
        >
          <p className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm">
            Processing…
          </p>
        </div>
      ) : null}
    </div>
  );
}
