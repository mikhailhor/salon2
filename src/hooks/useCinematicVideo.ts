import { useEffect, useRef, useState, type RefObject } from "react";
import { clamp } from "@/hooks/useMedia";

export type CinematicVideoMode = "scrub" | "play";

interface Options {
  /**
   * `scrub` follows the scroll position frame by frame (desktop, where the
   * browser can seek a big file fast enough).
   * `play` runs the clip as native, muted, looping playback — always smoother
   * than seeking on touch devices.
   */
  mode: CinematicVideoMode;
  /** Target position in seconds, used by `scrub`. */
  targetTime?: number;
  /** Should the clip be running right now (visible + allowed)? */
  active?: boolean;
  /** Duration used before metadata is known. */
  duration?: number;
  enabled?: boolean;
}

/**
 * Drives the cinematic background clip.
 *
 * Scroll-driven scrubbing is the janky part of the experience: a seek costs a
 * decode, and issuing a new `currentTime` on every animation frame (or on
 * every momentum frame of a finger drag) queues seeks faster than the decoder
 * can answer. What happens here instead:
 *
 *  - never more than one seek in flight (`video.seeking` gates the loop, the
 *    `seeked` event resumes it);
 *  - `fastSeek()` for long jumps, exact seeks for short ones;
 *  - if the device still cannot answer seeks quickly, the hook degrades to
 *    native playback once instead of stuttering forever;
 *  - decoding stops as soon as the clip leaves the viewport.
 */
export function useCinematicVideo(
  videoRef: RefObject<HTMLVideoElement | null>,
  {
    mode,
    targetTime = 0,
    active = true,
    duration = 15,
    enabled = true,
  }: Options,
) {
  const targetRef = useRef(targetTime);
  targetRef.current = targetTime;

  const durationRef = useRef(duration);
  durationRef.current = duration;

  const kickRef = useRef<() => void>(() => {});

  const [degraded, setDegraded] = useState(false);
  const [inView, setInView] = useState(true);

  const playMode = mode === "play" || degraded;

  /* Real duration, once the browser knows it. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;
    const read = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        durationRef.current = video.duration;
      }
    };
    read();
    video.addEventListener("loadedmetadata", read);
    video.addEventListener("durationchange", read);
    return () => {
      video.removeEventListener("loadedmetadata", read);
      video.removeEventListener("durationchange", read);
    };
  }, [enabled, videoRef]);

  /* Stop decoding whenever the layer is off-screen. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "15%" },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [enabled, videoRef]);

  /* ------------------------------------------------ scrub (desktop) */
  useEffect(() => {
    const video: HTMLVideoElement | null = videoRef.current;
    if (!video || !enabled || playMode) return;

    // Belt and braces for autoplay policies: a decorative clip must never
    // make a sound, and must never go fullscreen on a tap.
    video.muted = true;
    video.setAttribute("playsinline", "");

    let raf = 0;
    let alive = true;
    let seekingAt = 0;
    let slowSeeks = 0;
    let startedAt = performance.now();

    const EPS = 0.02;
    const EASE = 0.22;
    const fastSeek = (
      video as HTMLVideoElement & { fastSeek?: (time: number) => void }
    ).fastSeek;

    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const schedule = () => {
      if (!raf && alive) raf = requestAnimationFrame(tick);
    };
    kickRef.current = schedule;

    const tick = () => {
      raf = 0;
      if (!alive) return;

      const target = clamp(targetRef.current, 0, Math.max(0, durationRef.current - 0.05));
      const diff = target - video.currentTime;

      if (Math.abs(diff) < EPS) return; // settled: let the loop die
      if (video.seeking) {
        schedule(); // one seek at a time — `seeked` will keep us going
        return;
      }
      if (video.readyState < 2) {
        if (performance.now() - startedAt < 12000) schedule();
        return;
      }

      const next = video.currentTime + diff * EASE;
      try {
        if (typeof fastSeek === "function" && Math.abs(diff) > 1.1) fastSeek.call(video, next);
        else video.currentTime = next;
      } catch {
        /* seeking can throw on a detached/unsupported source — ignore */
      }
      schedule();
    };

    const onSeeking = () => {
      seekingAt = performance.now();
    };
    const onSeeked = () => {
      if (!seekingAt) return;
      const cost = performance.now() - seekingAt;
      seekingAt = 0;
      if (cost > 260) {
        slowSeeks += 1;
        if (slowSeeks >= 3) setDegraded(true);
      } else if (slowSeeks > 0) {
        slowSeeks -= 1;
      }
    };

    video.addEventListener("seeking", onSeeking);
    video.addEventListener("seeked", onSeeked);
    startedAt = performance.now();
    schedule();

    return () => {
      alive = false;
      stop();
      video.removeEventListener("seeking", onSeeking);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [enabled, playMode, videoRef]);

  /* Move the scrub target: cheap, the rAF loop above does the work. */
  useEffect(() => {
    if (playMode) return;
    kickRef.current();
  }, [targetTime, playMode]);

  /* ---------------------------------- native playback (touch / fallback) */
  useEffect(() => {
    const video: HTMLVideoElement | null = videoRef.current;
    if (!video || !enabled) return;

    if (!(playMode && active && inView)) {
      video.pause();
      return;
    }

    video.muted = true;
    video.setAttribute("playsinline", "");
    video.loop = true;
    let cancelled = false;

    const attempt = () => {
      if (cancelled) return;
      const played = video.play();
      if (played && typeof played.catch === "function") {
        played.catch(() => {
          /* blocked by an autoplay policy — retried on the first gesture */
        });
      }
    };

    attempt();

    // iOS low-power mode and data saver block autoplay: the first gesture of
    // the visitor is a legal moment to start, so listen for it once.
    const onGesture = () => attempt();
    window.addEventListener("pointerdown", onGesture, { once: true, passive: true });
    window.addEventListener("touchstart", onGesture, { once: true, passive: true });
    window.addEventListener("keydown", onGesture, { once: true });
    window.addEventListener("scroll", onGesture, { once: true, passive: true });

    return () => {
      cancelled = true;
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("scroll", onGesture);
    };
  }, [enabled, playMode, active, inView, videoRef]);

  /** A frozen clip should not hold a decoder while it is invisible. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;
    if (!active || !inView) video.pause();
  }, [enabled, active, inView, videoRef]);

  return { playMode, degraded };
}
