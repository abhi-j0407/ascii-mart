"use client";

import { useState } from "react";

import { openUploadPicker } from "@/lib/upload/picker";
import type { ExportBackground } from "@/store/types";
import { CANONICAL_STATES } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";

const EXPORT_BACKGROUNDS: readonly {
  value: ExportBackground;
  label: string;
}[] = [
  { value: "white", label: "White" },
  { value: "black", label: "Black" },
  { value: "transparent", label: "Clear" },
] as const;

const DENSITY_MIN = 80;
const DENSITY_MAX = 240;
const SPEED_MIN = 0.5;
const SPEED_MAX = 2;
const SPEED_STEP = 0.25;

const controlButtonClass =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-neutral-300/90 bg-white px-3.5 text-sm font-medium text-neutral-800 shadow-sm transition-[background-color,border-color,transform] duration-150 ease-out hover:border-neutral-400 hover:bg-neutral-50 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100";

const segmentButtonClass = (selected: boolean) =>
  `rounded-md px-2.5 py-1.5 text-xs font-medium transition-[background-color,color] duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-neutral-500 ${
    selected
      ? "bg-neutral-900 text-white shadow-sm"
      : "text-neutral-600 hover:bg-neutral-100"
  }`;

export function ControlBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentState = useAppStore((state) => state.currentState);
  const density = useAppStore((state) => state.density);
  const speed = useAppStore((state) => state.speed);
  const setCurrentState = useAppStore((state) => state.setCurrentState);
  const setDensity = useAppStore((state) => state.setDensity);
  const setSpeed = useAppStore((state) => state.setSpeed);
  const cellModel = useAppStore((state) => state.cellModel);
  const sourceImage = useAppStore((state) => state.sourceImage);
  const replay = useAppStore((state) => state.replay);
  const playbackStatus = useAppStore((state) => state.playbackStatus);
  const downloadState = useAppStore((state) => state.downloadState);
  const exportBackground = useAppStore((state) => state.exportBackground);
  const setExportBackground = useAppStore(
    (state) => state.setExportBackground,
  );

  const canReplay =
    cellModel !== null &&
    sourceImage !== null &&
    playbackStatus !== "processing";

  const canDownload =
    (cellModel !== null ||
      (currentState === "real" && sourceImage !== null)) &&
    playbackStatus !== "processing";

  const controls = (
    <>
      <button
        type="button"
        onClick={openUploadPicker}
        disabled={playbackStatus === "processing"}
        className={controlButtonClass}
      >
        Upload image
      </button>

      <fieldset className="flex shrink-0 flex-wrap items-center gap-0.5 rounded-lg border border-neutral-200/90 bg-white p-1 shadow-sm">
        <legend className="sr-only">Display state</legend>
        {CANONICAL_STATES.map(({ value, label }) => {
          const selected = currentState === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => setCurrentState(value)}
              className={segmentButtonClass(selected)}
            >
              {label}
            </button>
          );
        })}
      </fieldset>

      <label className="flex min-w-0 flex-1 items-center gap-2.5 text-xs text-neutral-600 sm:max-w-52">
        <span className="shrink-0 font-medium text-neutral-700">Density</span>
        <input
          type="range"
          min={DENSITY_MIN}
          max={DENSITY_MAX}
          value={density}
          onChange={(event) => setDensity(Number(event.target.value))}
          disabled={!sourceImage || playbackStatus === "processing"}
          className="h-1.5 w-full cursor-pointer accent-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          aria-valuemin={DENSITY_MIN}
          aria-valuemax={DENSITY_MAX}
          aria-valuenow={density}
        />
        <span className="w-8 shrink-0 tabular-nums text-neutral-500">
          {density}
        </span>
      </label>

      <label className="flex shrink-0 items-center gap-2 text-xs text-neutral-600">
        <span className="font-medium text-neutral-700">Speed</span>
        <input
          type="range"
          min={SPEED_MIN}
          max={SPEED_MAX}
          step={SPEED_STEP}
          value={speed}
          onChange={(event) => setSpeed(Number(event.target.value))}
          className="h-1.5 w-20 cursor-pointer accent-neutral-800 sm:w-24"
          aria-valuemin={SPEED_MIN}
          aria-valuemax={SPEED_MAX}
          aria-valuenow={speed}
        />
        <span className="w-8 tabular-nums text-neutral-500">{speed}×</span>
      </label>

      <button
        type="button"
        onClick={replay}
        disabled={!canReplay}
        className={controlButtonClass}
      >
        Replay
      </button>

      <fieldset className="flex shrink-0 flex-wrap items-center gap-0.5 rounded-lg border border-neutral-200/90 bg-white p-1 shadow-sm">
        <legend className="sr-only">PNG background</legend>
        {EXPORT_BACKGROUNDS.map(({ value, label }) => {
          const selected = exportBackground === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => setExportBackground(value)}
              className={segmentButtonClass(selected)}
            >
              {label}
            </button>
          );
        })}
      </fieldset>

      <button
        type="button"
        onClick={downloadState}
        disabled={!canDownload}
        className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white shadow-sm transition-[background-color,transform] duration-150 ease-out hover:bg-neutral-800 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500 disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100"
      >
        Download
      </button>
    </>
  );

  return (
    <section
      aria-label="Controls"
      className="shrink-0 border-t border-neutral-200/90 bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2.5 md:hidden">
        <p className="text-sm font-medium tracking-tight text-neutral-800">
          Controls
        </p>
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="control-bar-panel"
          onClick={() => setMobileOpen((open) => !open)}
          className={controlButtonClass}
        >
          {mobileOpen ? "Hide" : "Show"}
        </button>
      </div>

      <div
        id="control-bar-panel"
        className={`mx-auto max-w-6xl px-3 pb-3 md:block md:px-6 md:py-3.5 ${
          mobileOpen ? "block" : "hidden"
        }`}
      >
        <div className="flex flex-col gap-3.5 md:flex-row md:flex-wrap md:items-center md:gap-3">
          {controls}
        </div>
      </div>
    </section>
  );
}
