import { useEffect, useRef } from "react";
import { useIsTouch, usePrefersReducedMotion } from "@/hooks/useMedia";
import { useQuality } from "@/hooks/usePerformance";

/**
 * The old cursor ran a 60 fps rAF loop for the entire lifetime of the page,
 * even when the pointer was motionless (and it used a full-screen blend-mode
 * layer). It now runs only while the ring is actually catching up, and is not
 * mounted at all on touch, reduced-motion or low-power devices.
 */
export default function CustomCursor() {
  const touch = useIsTouch();
  const reduced = usePrefersReducedMotion();
  const quality = useQuality();
  const enabled = !touch && !reduced && quality === "full";

  const wrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    const wrap = wrapRef.current;
    const ring = ringRef.current;
    if (!wrap || !ring) return;

    html.classList.add("is-cursor-hidden");
    const pos = { x: 0, y: 0, rx: 0, ry: 0 };
    let hover = false;
    let scale = 1;
    let raf = 0;
    let alive = true;

    const tick = () => {
      raf = 0;
      if (!alive) return;
      const dx = pos.x - pos.rx;
      const dy = pos.y - pos.ry;
      pos.rx += dx * 0.18;
      pos.ry += dy * 0.18;
      const target = hover ? 1.85 : 1;
      scale += (target - scale) * 0.18;

      wrap.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      ring.style.transform =
        `translate3d(${(pos.rx - pos.x).toFixed(2)}px, ${(pos.ry - pos.y).toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;

      if (
        Math.abs(dx) > 0.15 ||
        Math.abs(dy) > 0.15 ||
        Math.abs(target - scale) > 0.01
      ) {
        raf = requestAnimationFrame(tick);
      }
    };

    const kick = () => {
      if (!raf && alive) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      wrap.style.opacity = "1";
      kick();
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        wrap.style.opacity = "0";
        hover = false;
      } else {
        wrap.style.opacity = "1";
        hover = Boolean(target?.closest?.("[data-cursor]"));
      }
      kick();
    };

    const onLeave = () => {
      wrap.style.opacity = "0";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      alive = false;
      html.classList.remove("is-cursor-hidden");
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed top-0 left-0 z-[80] opacity-0 mix-blend-difference"
      style={{ marginLeft: 0, marginTop: 0 }}
      aria-hidden="true"
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <div className="h-1.5 w-1.5 rounded-full bg-ivory" />
        <div
          ref={ringRef}
          className="cursor-ring absolute top-1/2 left-1/2 h-10 w-10 rounded-full border border-ivory/80"
        />
      </div>
    </div>
  );
}
