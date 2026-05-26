"use client";

import { useEffect, useRef } from "react";

import { useAppStore } from "@/store/useAppStore";

/**
 * Loads the bundled demo and starts playback on first visit (locked #7).
 */
export function DemoBootstrap() {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;
    void useAppStore.getState().bootstrapDemo();
  }, []);

  return null;
}
