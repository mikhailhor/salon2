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
    if (!enabled) return;
    let raf = 0;
    let alive = true;
    let running = true;
    let current = 0;
    let target = 0;

    const measure = () => {
      const el = trackRef.current;
      if (!el) return;
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      const top = el.getBoundingClientRect().top;
      const scrolled = clamp(-top / total);
      target = scrolled;
    };

    const ease = reduced ? 1 : mobile ? 0.14 : 0.078;

    const tick = () => {
      if (!alive) return;
      measure();
      current += (target - current) * ease;
      if (Math.abs(target - current) < 0.0007) current = target;
      setProgress(current);
      if (running) raf = requestAnimationFrame(tick);
    };

    const el = trackRef.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0 },
    );
    if (el) io.observe(el);

    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [enabled, reduced, mobile, trackRef]);

  return progress;
}

export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
