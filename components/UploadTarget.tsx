"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";

import { ACCEPTED_FILE_INPUT } from "@/lib/upload/constants";
import { registerUploadPicker } from "@/lib/upload/picker";
import { useAppStore } from "@/store/useAppStore";

type UploadTargetProps = {
  readonly children: React.ReactNode;
};

export function UploadTarget({ children }: UploadTargetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const processFile = useAppStore((state) => state.processFile);
  const uploadError = useAppStore((state) => state.uploadError);
  const clearUploadError = useAppStore((state) => state.clearUploadError);
  const playbackStatus = useAppStore((state) => state.playbackStatus);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) {
        return;
      }
      void processFile(file);
    },
    [processFile],
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) {
        return;
      }
      for (const item of items) {
        if (!item.type.startsWith("image/")) {
          continue;
        }
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          void processFile(file);
          return;
        }
      }
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [processFile]);

  useEffect(() => registerUploadPicker(openFilePicker), [openFilePicker]);

  const onDragEnter = (event: DragEvent) => {
    event.preventDefault();
    setDragActive(true);
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const onDragLeave = (event: DragEvent) => {
    event.preventDefault();
    if (event.currentTarget === event.target) {
      setDragActive(false);
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  };

  const busy = playbackStatus === "processing";

  return (
    <div
      className="relative flex h-full w-full flex-col"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_INPUT}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        disabled={busy}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {children}

      {dragActive ? (
        <div
          className="pointer-events-none absolute inset-3 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-neutral-400 bg-white/92 backdrop-blur-sm motion-safe:transition-opacity"
          aria-hidden
        >
          <p className="text-sm font-medium text-neutral-800">
            Drop image to upload
          </p>
        </div>
      ) : null}

      {uploadError ? (
        <div
          className="absolute bottom-3 left-3 right-3 z-10 flex items-start justify-between gap-3 rounded-lg border border-red-200/90 bg-red-50 px-3 py-2.5 text-sm text-red-900 shadow-sm"
          role="alert"
        >
          <p>{uploadError}</p>
          <button
            type="button"
            onClick={clearUploadError}
            className="shrink-0 text-xs font-medium text-red-800 underline-offset-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  );
}
