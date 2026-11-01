import { useEffect, useState, type RefObject } from "react";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return reduced;
}

export function useIsMobile(bp = 1024) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp - 1}px)`);
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [bp]);

  return mobile;
}

export function useIsTouch() {
  const [touch, setTouch] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const apply = () => setTouch(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return touch;
}

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

export function useCinematicProgress(
  trackRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  reduced: boolean,
  mobile: boolean,
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!enabled || !el) return;

    let raf = 0;
    let alive = true;
    let ticking = false;
    let current = 0;
    let target = 0;

    const ease = reduced ? 1 : mobile ? 0.14 : 0.078;

    const read = () => {
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      target = clamp((window.scrollY - top) / total);
    };

    const tick = () => {
      if (!alive) return;
      raf = 0;
      read();
      current += (target - current) * ease;
      if (Math.abs(target - current) < 0.0007) current = target;
      setProgress(current);
      if (current !== target) {
        raf = requestAnimationFrame(tick);
      } else {
        ticking = false;
      }
    };

    const schedule = () => {
      if (ticking || !alive) return;
      ticking = true;
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      read();
      schedule();
    };

    read();
    current = target;
    setProgress(current);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    return () => {
      alive = false;
      ticking = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      ro.disconnect();
    };
  }, [enabled, reduced, mobile, trackRef]);

  return progress;
}

export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      const next = window.scrollY > threshold;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);

  return scrolled;
}
