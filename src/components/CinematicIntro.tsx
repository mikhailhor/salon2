import { useEffect, useRef } from "react";

export default function CinematicIntro() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let alive = true;

    // easeInOutCubic — accelerates out of centre, settles softly into the corner
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const update = () => {
      if (!alive) return;
      const p = Math.min(1, Math.max(0, window.scrollY / 320));
      const pe = ease(p);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const desktop = w >= 1024;
      // target: the header logo, anchored top-right (RTL).
      const cornerX = w - (desktop ? 101 : 66);
      const cornerY = desktop ? 55 : 50;
      const endScale = desktop ? 0.2 : 0.21875;
      const dx = (cornerX - w / 2) * pe;
      const dy = (cornerY - h / 2) * pe;
      const s = 1 - pe * (1 - endScale);

      if (logoRef.current) {
        logoRef.current.style.transform =
          `translate3d(${dx}px, ${dy}px, 0) scale(${s})`;
        logoRef.current.style.filter = `blur(${(1 - pe) * 0.6}px)`;
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
      if (p < 1) raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
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
            <img
              src="/logo.png"
              alt=""
              className="logo-neon-img relative h-64 w-auto object-contain md:h-80"
            />
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
