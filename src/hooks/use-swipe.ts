import { useRef } from "react";

/** Horizontal swipe on touch screens; returns -1 / +1 / 0. */
export function useSwipe(onSwipe: (dir: -1 | 1) => void) {
  const start = useRef<number | null>(null);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") start.current = e.clientX;
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (start.current === null) return;
      const dx = e.clientX - start.current;
      start.current = null;
      if (Math.abs(dx) > 40) onSwipe(dx < 0 ? 1 : -1);
    },
  };
}
