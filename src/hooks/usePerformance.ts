import { useSyncExternalStore } from "react";

/**
 * Adaptive quality.
 *
 * `full`  – the intended cinematic cut: crossfades, a gentle scene blur,
 *           the film grain and the custom cursor.
 * `lite`  – the same content with every continuous GPU/CPU cost removed:
 *           no filters, no blend modes, no backdrop blur, no cursor loop,
 *           no per-frame React work, 30 fps DOM writes, static image swaps.
 *
 * The tier is chosen synchronously before the first render (so nothing has to
 * be torn down and re-mounted), from hardware hints, connection hints and
 * reduced-motion. A runtime frame monitor can further downgrade a device that
 * looked capable on paper but cannot actually keep up; that decision is
 * remembered, so the next visit starts in the cheap mode immediately.
 *
 * `?perf=lite` / `?perf=full` force a tier (handy for comparing the two).
 */
export type Quality = "full" | "lite";

const STORAGE_KEY = "salon-quality";
type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

function forcedTier(): Quality | null {
  if (typeof window === "undefined") return null;
  try {
    const value = new URLSearchParams(window.location.search).get("perf");
    return value === "lite" || value === "full" ? value : null;
  } catch {
    return null;
  }
}

const forced = forcedTier();

function matches(query: string) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(query).matches;
}

function detectTier(): Quality {
  if (forced) return forced;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "lite") return "lite";
    if (stored === "full") return "full";
  } catch {
    /* private mode / storage disabled */
  }

  const nav = (typeof navigator !== "undefined" ? navigator : {}) as NavigatorHints;
  const conn = nav.connection;
  if (conn?.saveData) return "lite";
  if (conn?.effectiveType && ["slow-2g", "2g", "3g"].includes(conn.effectiveType)) return "lite";
  if (matches("(prefers-reduced-motion: reduce)")) return "lite";

  const cores = nav.hardwareConcurrency ?? 0;
  const memory = nav.deviceMemory ?? 0;
  let score = 0;
  if (cores && cores <= 4) score += 2;
  else if (cores && cores <= 6) score += 1;
  if (memory && memory <= 2) score += 2;
  else if (memory && memory <= 4) score += 1;
  if (matches("(pointer: coarse), (hover: none)") && cores && cores <= 6) score += 1;

  return score >= 2 ? "lite" : "full";
}

let current: Quality = detectTier();
const listeners = new Set<() => void>();

function applyClass(quality: Quality) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("perf-lite", quality === "lite");
  root.classList.toggle("perf-full", quality === "full");
  root.dataset.perf = quality;
}

applyClass(current);

export function getQuality(): Quality {
  return current;
}

export function subscribeQuality(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** One-way switch: a struggling device is never promoted back mid-visit. */
export function downgradeQuality(reason: string) {
  if (forced || current === "lite") return;
  current = "lite";
  applyClass(current);
  try {
    window.localStorage.setItem(STORAGE_KEY, "lite");
  } catch {
    /* ignore */
  }
  if (typeof console !== "undefined") {
    console.info(`[salon] وضعیت کم‌مصرف فعال شد (${reason})`);
  }
  for (const listener of listeners) listener();
}

export function useQuality(): Quality {
  return useSyncExternalStore(subscribeQuality, getQuality, getQuality);
}

/**
 * Sample real frame times after the curtain has lifted. A sustained median
 * above ~30 ms means the device cannot hold a smooth 30 fps, so drop to the
 * cheap cut. The monitor samples for a bounded window and then removes itself
 * — it never becomes another permanent per-frame cost.
 */
let monitorStarted = false;

export function startRuntimeMonitor(): () => void {
  if (monitorStarted || current === "lite" || typeof window === "undefined") return () => {};
  monitorStarted = true;

  let alive = true;
  let raf = 0;
  let previous = 0;
  let sinceCheck = 0;
  let startedAt = 0;
  const samples: number[] = [];
  let longTasks = 0;
  let observer: PerformanceObserver | null = null;

  const stop = () => {
    if (!alive) return;
    alive = false;
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
    observer?.disconnect();
  };

  const downgrade = (reason: string) => {
    stop();
    downgradeQuality(reason);
  };

  const tick = (now: number) => {
    if (!alive) return;
    if (previous && !document.hidden) {
      const delta = now - previous;
      // A backgrounded tab or a GC pause is not evidence of a weak GPU.
      if (delta > 0 && delta < 200) {
        samples.push(delta);
        if (samples.length > 90) samples.shift();
        if (++sinceCheck >= 20) {
          sinceCheck = 0;
          if (samples.length >= 60) {
            const sorted = samples.slice().sort((a, b) => a - b);
            const median = sorted[Math.floor(sorted.length / 2)];
            if (median > 30) return downgrade("slow frames");
          }
        }
      }
    }
    previous = now;
    // Sample a bounded window that starts with the first scroll gesture —
    // that is exactly when a weak device shows what it can (or cannot) do.
    if (performance.now() - startedAt > 20000) return stop();
    raf = requestAnimationFrame(tick);
  };

  const onScroll = () => {
    if (!alive || startedAt) return;
    startedAt = performance.now();
    previous = 0;
    raf = requestAnimationFrame(tick);
  };

  try {
    if (typeof PerformanceObserver !== "undefined") {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 120) longTasks += 1;
        }
        if (longTasks >= 3) downgrade("long tasks");
      });
      observer.observe({ entryTypes: ["longtask"] });
    }
  } catch {
    observer = null;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  return stop;
}
