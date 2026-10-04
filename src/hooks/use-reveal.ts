import { useEffect } from "react";

/**
 * Scroll reveals for every `[data-reveal]` element of the page (see index.css).
 * One IntersectionObserver, each element reveals once. Elements already above the viewport
 * (back navigation, anchor links, restored scroll) are shown at once, never animated late.
 */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.in-view)"));
    if (!els.length) return;
    if (!("IntersectionObserver" in window) || !document.documentElement.classList.contains("js-motion")) {
      els.forEach((el) => el.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting || e.boundingClientRect.bottom < 0) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    els.forEach((el) => {
      if (el.getBoundingClientRect().bottom < 0) el.classList.add("in-view");
      else io.observe(el);
    });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
