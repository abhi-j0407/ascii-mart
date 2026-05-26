"use client";

import { useEffect, useRef } from "react";

import {
  buildCellRevealOrders,
  timelineAtElapsed,
  type CellRevealOrders,
} from "@/lib/animation";
import { renderAnimatedFrame } from "@/lib/render/animatedRenderer";
import { renderFrame } from "@/lib/render/canvasRenderer";
import { useAppStore } from "@/store/useAppStore";

function drawEmptyPlaceholder(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  message: string,
): void {
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#fafaf9";
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "#e7e5e4";
  context.lineWidth = 1;
  const step = 24;
  for (let x = 0; x <= width; x += step) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y <= height; y += step) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.fillStyle = "#78716c";
  context.font = "13px var(--font-geist-sans, system-ui, sans-serif)";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(message, width / 2, height / 2);
}

export function AsciiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ordersRef = useRef<CellRevealOrders | null>(null);

  const cellModel = useAppStore((state) => state.cellModel);
  const currentState = useAppStore((state) => state.currentState);
  const sourceImage = useAppStore((state) => state.sourceImage);
  const playbackStatus = useAppStore((state) => state.playbackStatus);
  const playbackEpoch = useAppStore((state) => state.playbackEpoch);

  const emptyMessage =
    playbackStatus === "processing" && !cellModel && !sourceImage
      ? "Loading demo…"
      : "Drop, paste, or upload an image";

  useEffect(() => {
    ordersRef.current = cellModel ? buildCellRevealOrders(cellModel) : null;
  }, [cellModel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let rafId = 0;

    const syncCanvasSize = (): { width: number; height: number } => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { width: rect.width, height: rect.height };
    };

    const drawStatic = (viewport: { width: number; height: number }) => {
      const hasContent =
        cellModel !== null || (currentState === "real" && sourceImage !== null);

      if (!hasContent) {
        drawEmptyPlaceholder(
          context,
          viewport.width,
          viewport.height,
          emptyMessage,
        );
        return;
      }

      renderFrame(context, viewport, {
        cellModel,
        state: currentState,
        sourceImage,
      });
    };

    const draw = () => {
      const viewport = syncCanvasSize();
      drawStatic(viewport);
    };

    const stopAnimation = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const startAnimation = () => {
      if (!cellModel || !sourceImage) return;

      const orders =
        ordersRef.current ?? buildCellRevealOrders(cellModel);
      ordersRef.current = orders;

      const animStart = performance.now();

      const tick = (now: number) => {
        const viewport = syncCanvasSize();
        const elapsed = now - animStart;
        const liveSpeed = useAppStore.getState().speed;
        const snapshot = timelineAtElapsed(elapsed, liveSpeed);

        renderAnimatedFrame(context, viewport, {
          cellModel,
          sourceImage,
          orders,
          snapshot,
        });

        if (snapshot.complete) {
          useAppStore.setState({
            playbackStatus: "idle",
            currentState: "real",
          });
          stopAnimation();
          return;
        }

        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
    };

    if (
      playbackStatus === "playing" &&
      cellModel &&
      sourceImage
    ) {
      stopAnimation();
      startAnimation();
    } else {
      stopAnimation();
      draw();
    }

    const observer = new ResizeObserver(() => {
      if (playbackStatus !== "playing") {
        draw();
      }
    });
    observer.observe(canvas);

    return () => {
      stopAnimation();
      observer.disconnect();
    };
  }, [
    cellModel,
    currentState,
    sourceImage,
    playbackStatus,
    playbackEpoch,
    emptyMessage,
  ]);

  const processing = playbackStatus === "processing";

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        aria-label="ASCII canvas preview"
        className="h-full w-full rounded-sm bg-neutral-50"
      />
      {processing && (cellModel !== null || sourceImage !== null) ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px] motion-safe:transition-opacity"
          role="status"
          aria-live="polite"
        >
          <p className="rounded-lg border border-neutral-200/90 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 shadow-sm">
            Rebuilding…
          </p>
        </div>
      ) : null}
    </div>
  );
}
