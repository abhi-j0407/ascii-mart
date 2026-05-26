"use client";

import { CanvasPlaceholder } from "@/components/CanvasPlaceholder";
import { ControlBar } from "@/components/ControlBar";

export function AppShell() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-neutral-100 text-neutral-900">
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-4 md:px-8 md:py-6">
        <div className="flex h-full w-full max-w-5xl flex-col">
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="relative aspect-[4/3] w-full max-h-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm ring-1 ring-black/5">
              <CanvasPlaceholder />
            </div>
          </div>
        </div>
      </main>
      <ControlBar />
    </div>
  );
}
