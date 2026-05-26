"use client";

import { AsciiCanvas } from "@/components/AsciiCanvas";
import { CanvasFrame } from "@/components/CanvasFrame";
import { ControlBar } from "@/components/ControlBar";
import { DemoBootstrap } from "@/components/DemoBootstrap";
import { UploadTarget } from "@/components/UploadTarget";

export function AppShell() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-neutral-100 text-neutral-900">
      <DemoBootstrap />
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-3 py-3 sm:px-6 sm:py-5">
        <div className="flex h-full w-full max-w-6xl flex-col">
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <UploadTarget>
              <CanvasFrame>
                <AsciiCanvas />
              </CanvasFrame>
            </UploadTarget>
          </div>
        </div>
      </main>
      <ControlBar />
    </div>
  );
}
