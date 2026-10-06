import { useEffect, useState, type RefObject } from "react";

/* ------------------------------------------------------------------ *
 * Media queries
 * All hooks read their value synchronously on the first render, so the
 * layout never paints in the wrong (cinematic) state for a frame — that
 * flash is what used to trigger a full re-mount right after load.
 * ------------------------------------------------------------------ */

export function queryMatches(query: string) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(query).matches;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => queryMatches(query));

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(query);
    const apply = () => setMatches(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [query]);

  return matches;
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Small screens — cinematic mode is never used here. */
export function useIsMobile(bp = 1024) {
  return useMediaQuery(`(max-width: ${bp - 1}px)`);
}

/** Touch input is available (phones, tablets, touch laptops, touch screens). */
export function useIsTouch() {
  return useMediaQuery("(hover: none), (pointer: coarse)");
}

/** Data saver or a 2g/3g radio: skip eager media, keep the page light. */
export function prefersLightData() {
  if (typeof navigator === "undefined") return false;
  const conn = getConnection();
  if (!conn) return false;
  if (conn.saveData) return true;
  return ["slow-2g", "2g", "3g"].includes(conn.effectiveType ?? "");
}

/**
 * Video backgrounds are only worth their bytes on decent connections.
 * Respects `prefers-reduced-motion`, data saver and 2g/3g networks.
 */
export function useVideoAllowed(reducedMotion: boolean) {
  const [allowed, setAllowed] = useState(() => canPlayVideo());

  useEffect(() => {
    const apply = () => setAllowed(canPlayVideo());
    apply();
    const conn = getConnection();
    conn?.addEventListener?.("change", apply);
    return () => conn?.removeEventListener?.("change", apply);
  }, []);

  return allowed && !reducedMotion;
}

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

function getConnection(): NetworkInformation | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: NetworkInformation }).connection;
}

function canPlayVideo() {
  if (typeof navigator === "undefined") return true;
  const conn = getConnection();
  if (!conn) return true;
  if (conn.saveData) return false;
  const slow = ["slow-2g", "2g", "3g"];
  return !conn.effectiveType || !slow.includes(conn.effectiveType);
}

/* ------------------------------------------------------------------ *
 * Small math helpers used by the pinned cinematic track
 * ------------------------------------------------------------------ */

export function clamp(n: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, n));
}

export function rangeProgress(p: number, start: number, end: number) {
  if (end <= start) return 0;
  return clamp((p - start) / (end - start));
}

export function fadeWindow(p: number, start: number, end: number, fade = 0.034) {
  const enter = clamp((p - start) / fade);
  const exit = clamp((end - p) / fade);
  return Math.min(enter, exit);
}

/* ------------------------------------------------------------------ *
 * Scroll progress for the pinned cinematic track
 *
 * Two things keep this cheap enough to stay smooth while a finger is
 * dragging the page:
 *   1. layout metrics are cached (reading `offsetHeight` /
 *      `getBoundingClientRect()` inside the rAF loop forced a reflow on
 *      every single frame);
 *   2. the loop follows a passive `scroll` listener and stops itself as
 *      soon as the eased value has caught up, instead of running forever.
 * ------------------------------------------------------------------ */

export function useCinematicProgress(
  trackRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  reduced: boolean,
  touch: boolean,
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const el = trackRef.current;
    if (!el) return;

    let raf = 0;
    let alive = true;
    let inView = true;
    let current = 0;
    let target = 0;
    let committed = -1;
    let lastCommit = -1;

    // Cached metrics (document space).
    let top = 0;
    let span = 1;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      top = rect.top + window.scrollY;
      span = Math.max(1, el.offsetHeight - window.innerHeight);
    };

    const readTarget = () => clamp((window.scrollY - top) / span);

    // Touch needs to track the finger closely; a slower ease is what makes
    // the desktop version feel cinematic.
    const ease = reduced ? 1 : touch ? 0.34 : 0.09;
    // Committing at ~32fps on touch halves the React work per scroll frame.
    const minFrameMs = touch && !reduced ? 1000 / 32 : 0;

    const tick = (now: number) => {
      raf = 0;
      if (!alive) return;

      current += (target - current) * ease;
      if (Math.abs(target - current) < 0.0006) current = target;

      if (
        current !== committed &&
        (minFrameMs === 0 || lastCommit < 0 || now - lastCommit >= minFrameMs)
      ) {
        committed = current;
        lastCommit = now;
        setProgress(current);
      }

      if (current !== target) raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (!raf && alive) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (!inView) return; // nothing on screen to update
      target = readTarget();
      kick();
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    // First read: jump straight to the current position instead of
    // animating from zero (e.g. after toggling cinematic mode).
    measure();
    current = target = readTarget();
    committed = -1;
    setProgress(current);
    raf = requestAnimationFrame(tick);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            measure();
            onScroll();
          })
        : null;
    ro?.observe(el);

    // The mobile URL bar changes the viewport height while scrolling.
    const vv = window.visualViewport;
    vv?.addEventListener("resize", onResize);

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              inView = entry.isIntersecting;
              if (inView) {
                onResize();
                kick();
              }
            },
            { threshold: 0 },
          )
        : null;
    io?.observe(el);

    void document.fonts?.ready.then(() => {
      if (alive) onResize();
    });

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      vv?.removeEventListener("resize", onResize);
      ro?.disconnect();
      io?.disconnect();
      inView = false;
    };
  }, [enabled, reduced, touch, trackRef]);

  return progress;
}

/**
 * Passive, rAF-throttled "has the page been scrolled" flag.
 */
export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);

  return scrolled;
}
