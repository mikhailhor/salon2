import { useEffect, useRef } from "react";

export default function CinematicIntro() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let alive = true;
    let queued = false;
    let rendered = -1;

    // easeInOutCubic — accelerates out of centre, settles softly into the corner
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const measureTarget = () => {
      const mark = document.querySelector<HTMLElement>("[data-intro-mark]");
      if (mark) {
        const r = mark.getBoundingClientRect();
        if (r.width > 0) {
          return { x: r.right - r.width / 2, y: r.top + r.height / 2 };
        }
      }
      const w = window.innerWidth;
      const desktop = w >= 1024;
      return { x: w - (desktop ? 80 : 42), y: desktop ? 55 : 42 };
    };

    const update = () => {
      if (!alive) return;
      raf = 0;
      queued = false;

      const p = Math.min(1, Math.max(0, window.scrollY / 320));
      // Nothing to do while parked at either end — this is the common case.
      if (rendered === p) return;

      const pe = ease(p);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const target = measureTarget();
      const dx = (target.x - w / 2) * pe;
      const dy = (target.y - h / 2) * pe;
      // Intro mark is 256px (or 320px from md up); the header mark is 44/64px.
      const endScale = w >= 768 ? 64 / 320 : 44 / 256;
      const s = 1 - pe * (1 - endScale);

      if (logoRef.current) {
        logoRef.current.style.transform =
          `translate3d(${dx}px, ${dy}px, 0) scale(${s})`;
      }
      if (wrapRef.current) {
        wrapRef.current.style.opacity = String(Math.max(0, 1 - pe * 1.35));
        const hidden = p >= 1;
        wrapRef.current.style.visibility = hidden ? "hidden" : "visible";
        wrapRef.current.style.pointerEvents = hidden ? "none" : "auto";
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = String(Math.max(0, 1 - p * 3));
      }
      rendered = p;
    };

    const queue = () => {
      if (queued || !alive) return;
      queued = true;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[45] bg-ink"
      aria-hidden="true"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div ref={logoRef} className="will-change-transform">
          <div className="relative flex items-center justify-center">
            <span
              className="logo-neon absolute -inset-10 rounded-full"
              aria-hidden="true"
            />
            <span
              className="logo-neon-core absolute -inset-4 rounded-full"
              aria-hidden="true"
            />
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img
                src="/logo.png"
                alt=""
                width={512}
                height={512}
                className="logo-neon-img relative h-64 w-auto object-contain md:h-80"
              />
            </picture>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="h-px w-24 bg-gradient-to-l from-transparent via-champagne/60 to-transparent md:w-40" />
      </div>

      <div
        ref={hintRef}
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="text-[16px] font-bold tracking-[0.4em] text-ivory/90 uppercase">
          اسکرول کنید
        </span>
        <span
          className="h-10 w-px origin-top bg-champagne/80"
          style={{ animation: "scroll-hint 2.2s ease-in-out infinite" }}
        />
      </div>

      <p className="absolute bottom-28 left-1/2 -translate-x-1/2 text-right text-[15px] font-bold tracking-[0.28em] text-ivory/90 uppercase">
        آتلیه زیبایی · تهران
      </p>
    </div>
  );
}
