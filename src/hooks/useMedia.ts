import { useEffect, useRef, useState, type RefObject } from "react";
import type { Quality } from "@/hooks/usePerformance";

/* ------------------------------------------------------------------ *
 * Media queries
 * All hooks read their value synchronously on the first render, so the
 * layout never paints in the wrong state for a frame — that flash is what
 * used to trigger a full re-mount right after load.
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

/** Small screens (phones in portrait, narrow tablets). */
export function useIsMobile(bp = 1024) {
  return useMediaQuery(`(max-width: ${bp - 1}px)`);
}

/** Touch input is available (phones, tablets, touch laptops, touch screens). */
export function useIsTouch() {
  return useMediaQuery("(hover: none), (pointer: coarse)");
}

/**
 * Every viewport gets the cinematic cut; the expensive effects inside it are
 * what get switched off on weak hardware, not the experience itself.
 */
export function useCinematicCapable() {
  return true;
}

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

export function prefersLightData() {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as NavigatorHints).connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  return Boolean(conn.effectiveType && ["slow-2g", "2g", "3g"].includes(conn.effectiveType));
}

/** Native (non-scrubbed) video is only worth its decoder on the full tier. */
export function useVideoAllowed(reducedMotion: boolean, quality: Quality) {
  return !reducedMotion && quality === "full" && !prefersLightData();
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

/** Cheap, cached DOM writes: never touch style for a value already applied. */
const styleCache = new WeakMap<HTMLElement, Record<string, string>>();

export function setStyle(element: HTMLElement | null, prop: string, value: string) {
  if (!element) return;
  let last = styleCache.get(element);
  if (!last) {
    last = {};
    styleCache.set(element, last);
  }
  if (last[prop] === value) return;
  last[prop] = value;
  element.style.setProperty(prop, value);
}

export function setAttr(element: HTMLElement | null, name: string, value: string) {
  if (!element) return;
  const key = `attr:${name}`;
  let last = styleCache.get(element);
  if (!last) {
    last = {};
    styleCache.set(element, last);
  }
  if (last[key] === value) return;
  last[key] = value;
  element.setAttribute(name, value);
}

interface ProgressOptions {
  enabled: boolean;
  reduced: boolean;
  touch: boolean;
  lite: boolean;
  /** Called at most `maxFps` times per second with the eased scroll progress. */
  onFrame: (progress: number) => void;
}

/**
 * Scroll progress for the pinned cinematic track — DOM-driven.
 *
 * The old version put progress in React state, so every animation frame
 * re-rendered the whole 5-scene tree (dozens of full-screen layers, images,
 * gradients and text). That reconciliation was the main source of stutter on
 * slow CPUs. Here the loop writes styles straight to cached DOM nodes and only
 * notifies React about discrete changes (which scene / service / step is on).
 *
 * Layout metrics are cached; the loop follows a passive scroll listener and
 * stops itself as soon as the eased value settles.
 */
export function useCinematicProgress(
  trackRef: RefObject<HTMLElement | null>,
  { enabled, reduced, touch, lite, onFrame }: ProgressOptions,
) {
  const frameRef = useRef(onFrame);
  frameRef.current = onFrame;

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

    // Lite snaps to the finger: no easing loop means no catch-up frames after
    // the drag has ended and no work while the page is at rest.
    const ease = lite || reduced ? 1 : touch ? 0.34 : 0.12;
    const minFrameMs = lite ? 1000 / 30 : touch ? 1000 / 45 : 0;

    const tick = (now: number) => {
      raf = 0;
      if (!alive || !inView) return;

      current += (target - current) * ease;
      if (Math.abs(target - current) < 0.0005) current = target;
      const settled = current === target;

      // Always commit the final value, even if the frame budget skipped it.
      if (
        current !== committed &&
        (settled || lastCommit < 0 || now - lastCommit >= minFrameMs)
      ) {
        committed = current;
        lastCommit = now;
        frameRef.current(current);
      }

      if (!settled) raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (!raf && alive && inView) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      if (!inView || document.hidden) return;
      target = readTarget();
      kick();
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    // Coalesce mobile URL-bar viewport changes into one measurement per frame.
    let measureRaf = 0;
    const scheduleMeasure = () => {
      if (measureRaf) return;
      measureRaf = requestAnimationFrame(() => {
        measureRaf = 0;
        if (alive) onResize();
      });
    };

    measure();
    current = target = readTarget();
    committed = current;
    frameRef.current(current);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    window.addEventListener("orientationchange", scheduleMeasure, { passive: true });
    const vv = window.visualViewport;
    vv?.addEventListener("resize", scheduleMeasure);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleMeasure)
        : null;
    ro?.observe(el);

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              inView = entry.isIntersecting;
              if (inView) {
                onResize();
                kick();
              } else if (raf) {
                cancelAnimationFrame(raf);
                raf = 0;
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
      if (measureRaf) cancelAnimationFrame(measureRaf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("orientationchange", scheduleMeasure);
      vv?.removeEventListener("resize", scheduleMeasure);
      ro?.disconnect();
      io?.disconnect();
    };
  }, [enabled, reduced, touch, lite, trackRef]);
}

/** Passive, rAF-throttled "has the page been scrolled" flag (one re-render). */
export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(() =>
    typeof window === "undefined" ? false : window.scrollY > threshold,
  );

  useEffect(() => {
    let raf = 0;
    let last = scrolled;
    const read = () => {
      raf = 0;
      const next = window.scrollY > threshold;
      if (next !== last) {
        last = next;
        setScrolled(next);
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold]);

  return scrolled;
}
