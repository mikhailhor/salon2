import { useEffect, useRef } from "react";
import { LOGO_SRC } from "@/data/filmstrip";
import { useQuality } from "@/hooks/usePerformance";

/**
 * The opening mark flies into the header logo over the first 320px of scroll.
 *
 * Previously this ran a permanent rAF loop that read `offsetHeight` and wrote
 * a `blur()` filter on every frame — a forced reflow plus a full re-filter of a
 * large image on each scroll event, forever. Now it is event-driven, all
 * layout metrics are cached, no filter is animated, and the listeners detach
 * as soon as the intro is finished.
 */
export default function CinematicIntro() {
  const quality = useQuality();
  const wrapRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const logo = logoRef.current;
    const hint = hintRef.current;
    if (!wrap || !logo || !hint) return;

    let raf = 0;
    let alive = true;
    let finished = false;
    let endScale = 0.25;
    let dxMax = 0;
    let dyMax = 0;

    // easeInOutCubic — accelerates out of centre, settles softly into the corner
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const measure = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const desktop = w >= 1024;
      const medium = w >= 768;
      // Header paddings: px-5 / md:px-8 / lg:px-12.
      const pad = desktop ? 48 : medium ? 32 : 20;
      const headerMark = desktop ? 88 : medium ? 80 : 68;
      const cornerX = w - pad - headerMark / 2;
      // Half of the header height: 108 / 112 / 136 px.
      const cornerY = desktop ? 68 : medium ? 56 : 54;
      // One layout read, on resize only — never inside the scroll path.
      const introMark = imgRef.current?.offsetHeight || (desktop ? 384 : 288);
      endScale = headerMark / introMark;
      dxMax = cornerX - w / 2;
      dyMax = cornerY - h / 2;
    };

    const render = () => {
      if (!alive || finished) return;
      const p = Math.min(1, Math.max(0, window.scrollY / 320));
      const pe = ease(p);
      const scale = 1 - pe * (1 - endScale);

      logo.style.transform =
        `translate3d(${(dxMax * pe).toFixed(1)}px, ${(dyMax * pe).toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
      wrap.style.opacity = String(Math.max(0, 1 - pe * 1.35));
      hint.style.opacity = String(Math.max(0, 1 - p * 3));

      const hidden = p >= 1;
      wrap.style.visibility = hidden ? "hidden" : "visible";
      wrap.style.pointerEvents = hidden ? "none" : "auto";
      if (hidden) {
        finished = true;
        detach();
      }
    };

    const onScroll = () => {
      if (finished || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        render();
      });
    };

    const onResize = () => {
      measure();
      render();
    };

    const detach = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };

    measure();
    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    void document.fonts?.ready.then(() => {
      if (alive && !finished) onResize();
    });

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      detach();
    };
    // Quality only affects whether extra CSS effects are enabled, not this loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} className="intro-wrap fixed inset-0 z-[45] bg-ink" aria-hidden="true">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div ref={logoRef} className={quality === "full" ? "will-change-transform" : ""}>
          <div className="relative flex items-center justify-center">
            <img
              ref={imgRef}
              src={LOGO_SRC}
              alt=""
              className="logo-neon-img relative h-[min(18rem,74vw)] w-auto object-contain md:h-96"
            />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <span className="h-px w-24 bg-gradient-to-l from-transparent via-champagne/60 to-transparent md:w-40" />
      </div>

      <div
        ref={hintRef}
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="text-[16px] font-bold tracking-[0.4em] text-ivory/90 uppercase">
          اسکرول کنید
        </span>
        <span className="h-10 w-px origin-top bg-champagne/80 scroll-hint-line" />
      </div>

      <p className="absolute bottom-28 left-1/2 -translate-x-1/2 text-right text-[15px] font-bold tracking-[0.28em] text-ivory/90 uppercase">
        آتلیه زیبایی · تهران
      </p>
    </div>
  );
}
