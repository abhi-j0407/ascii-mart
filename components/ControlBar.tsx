"use client";

import { useState } from "react";

import { openUploadPicker } from "@/lib/upload/picker";
import { CANONICAL_STATES } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";

const DENSITY_MIN = 80;
const DENSITY_MAX = 240;
const SPEED_MIN = 0.5;
const SPEED_MAX = 2;
const SPEED_STEP = 0.25;

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

  const canReplay =
    cellModel !== null &&
    sourceImage !== null &&
    playbackStatus !== "processing";

  const controls = (
    <>
      <button
        type="button"
        onClick={openUploadPicker}
        disabled={playbackStatus === "processing"}
        className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Upload image
      </button>

      <fieldset className="flex shrink-0 items-center gap-1 rounded-md border border-neutral-200 bg-white p-1">
        <legend className="sr-only">Display state</legend>
        {CANONICAL_STATES.map(({ value, label }) => {
          const selected = currentState === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => setCurrentState(value)}
              className={`rounded px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-neutral-400 ${
                selected
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {label}
            </button>
          );
        })}
      </fieldset>

      <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-neutral-600 sm:max-w-48">
        <span className="shrink-0 font-medium">Density</span>
        <input
          type="range"
          min={DENSITY_MIN}
          max={DENSITY_MAX}
          value={density}
          onChange={(event) => setDensity(Number(event.target.value))}
          className="h-1.5 w-full cursor-pointer accent-neutral-800"
          aria-valuemin={DENSITY_MIN}
          aria-valuemax={DENSITY_MAX}
          aria-valuenow={density}
        />
        <span className="w-8 shrink-0 tabular-nums text-neutral-500">
          {density}
        </span>
      </label>

      <label className="flex shrink-0 items-center gap-2 text-xs text-neutral-600">
        <span className="font-medium">Speed</span>
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
        <span className="w-8 tabular-nums text-neutral-500">{speed}x</span>
      </label>

      <button
        type="button"
        onClick={replay}
        disabled={!canReplay}
        className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Replay
      </button>

      <button
        type="button"
        onClick={downloadState}
        className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-neutral-900 px-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400"
      >
        Download
      </button>
    </>
  );

  return (
    <section
      aria-label="Controls"
      className="shrink-0 border-t border-neutral-200 bg-white/90 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:hidden">
        <p className="text-sm font-medium text-neutral-800">Controls</p>
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="control-bar-panel"
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-300 bg-white px-3 text-sm font-medium text-neutral-800"
        >
          {mobileOpen ? "Hide" : "Show"}
        </button>
      </div>

      <div
        id="control-bar-panel"
        className={`mx-auto max-w-6xl px-4 pb-4 md:px-6 md:py-4 ${
          mobileOpen ? "block" : "hidden md:block"
        }`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center">
          {controls}
        </div>
      </div>
    </section>
  );
}
