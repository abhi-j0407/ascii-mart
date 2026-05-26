"use client";

import { useEffect, useRef } from "react";

export function CanvasPlaceholder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      context.fillText("Canvas preview", rect.width / 2, rect.height / 2);
    };

    draw();

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        aria-label="ASCII canvas preview"
        className="h-full w-full rounded-sm bg-neutral-50"
      />
    </div>
  );
}
