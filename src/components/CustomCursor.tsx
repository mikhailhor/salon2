import { useEffect, useRef } from "react";
import { useIsTouch } from "@/hooks/useMedia";

export default function CustomCursor() {
  const touch = useIsTouch();
  const wrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, rx: 0, ry: 0 });
  const state = useRef({ hover: false, hidden: true });

  useEffect(() => {
    if (touch) return;

    const html = document.documentElement;
    html.classList.add("is-cursor-hidden");

    let raf = 0;
    const wrap = wrapRef.current;
    const ring = ringRef.current;
    if (!wrap || !ring) return;

    const tick = () => {
      pos.current.rx += (pos.current.x - pos.current.rx) * 0.18;
      pos.current.ry += (pos.current.y - pos.current.ry) * 0.18;
      wrap.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      ring.style.transform = `translate3d(${pos.current.rx - pos.current.x}px, ${
        pos.current.ry - pos.current.y
      }px, 0) scale(${state.current.hover ? 1.85 : 1})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      if (state.current.hidden) {
        state.current.hidden = false;
        wrap.style.opacity = "1";
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = (e.target as HTMLElement | null)?.closest?.("[data-cursor]") as
        | HTMLElement
        | null;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        wrap.style.opacity = "0";
        state.current.hover = false;
        return;
      }
      wrap.style.opacity = "1";
      state.current.hover = Boolean(t);
    };

    const onLeave = () => {
      wrap.style.opacity = "0";
      state.current.hidden = true;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      html.classList.remove("is-cursor-hidden");
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [touch]);

  if (touch) return null;

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
          className="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ivory/80 transition-[border-color] duration-300"
        />
      </div>
    </div>
  );
}
