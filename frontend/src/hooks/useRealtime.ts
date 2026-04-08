"use client";
import { useEffect, useRef, useCallback } from "react";

interface UseRealtimeOptions {
  /** Poll interval in milliseconds (default 30_000) */
  interval?: number;
  /** Run immediately on mount? (default true) */
  immediate?: boolean;
  /** Pause polling when tab is hidden? (default true) */
  pauseOnHidden?: boolean;
}

/**
 * Runs `fn` on mount and then every `interval` ms.
 * Pauses when the browser tab is not visible.
 */
export function useRealtime(
  fn: () => void | Promise<void>,
  options: UseRealtimeOptions = {}
) {
  const { interval = 30_000, immediate = true, pauseOnHidden = true } = options;
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const tick = useCallback(() => {
    if (pauseOnHidden && document.hidden) return;
    fnRef.current();
  }, [pauseOnHidden]);

  useEffect(() => {
    if (immediate) tick();
    const id = setInterval(tick, interval);

    const handleVisibility = () => {
      if (!document.hidden) tick(); // refresh immediately on tab focus
    };
    if (pauseOnHidden) {
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [tick, interval, immediate, pauseOnHidden]);
}
