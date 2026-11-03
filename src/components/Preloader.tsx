import { useEffect, useState } from "react";
import { ALL_IMAGES, BRAND, IMAGES } from "@/data/salon";
import { FILMSTRIP, LOGO_SRC } from "@/data/filmstrip";
import { Mark } from "@/components/primitives";
import { useSalon } from "@/context/SalonContext";
import { getQuality } from "@/hooks/usePerformance";
import { mapLimit, preloadImage, wait } from "@/utils/assetCache";

/**
 * A deliberate warm-up phase.
 *
 * The site pays its cost here, while the visitor is looking at a static
 * curtain, instead of during the first scroll: every image is fetched, the
 * small filmstrip frames are decoded into the browser's image cache, and the
 * webfonts are settled. Nothing on the cinematic track decodes, seeks or
 * reflows later. Loading may take a few seconds longer on a slow connection —
 * that is the trade the experience asks for in exchange for a smooth scroll.
 *
 * Concurrency is bounded (weak CPUs choke on 40 parallel decodes), every
 * fetch has a deadline, and the whole phase has a hard deadline, so a broken
 * asset can never trap anyone behind this screen.
 */
const CRITICAL = [LOGO_SRC, IMAGES.hero, FILMSTRIP[0], FILMSTRIP[1]];
const CRITICAL_SET = new Set(CRITICAL);
const REST = [...new Set([...ALL_IMAGES, ...FILMSTRIP])].filter(
  (src) => !CRITICAL_SET.has(src),
);
const DECODE_SET = new Set(FILMSTRIP);
const TOTAL = CRITICAL.length + REST.length + 1; // +1 for fonts

export default function Preloader() {
  const { setLoaded, reducedMotion } = useSalon();
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let mounted = true;
    const started = performance.now();
    const lite = getQuality() === "lite";
    let done = 0;
    let finished = false;

    const bump = () => {
      done += 1;
      if (mounted && !finished) setProgress(Math.min(1, done / TOTAL));
    };

    const load = async () => {
      // 1. First paint assets, fully decoded.
      await Promise.race([
        Promise.all(
          CRITICAL.map(async (src) => {
            await preloadImage(src, true);
            bump();
          }),
        ),
        wait(8000),
      ]);

      // 2. Fonts settle before the scroll metrics are measured.
      try {
        await Promise.race([document.fonts?.ready ?? Promise.resolve(), wait(4000)]);
      } catch {
        /* fonts API unavailable */
      }
      bump();

      // 3. Everything else, in small batches. Frames are decoded; the big
      //    photographs are only fetched (decoding them all at once would hold
      //    ~100 MB of bitmaps in memory on a low-end device).
      await Promise.race([
        mapLimit(REST, lite ? 2 : 4, async (src) => {
          await preloadImage(src, DECODE_SET.has(src));
          bump();
        }),
        wait(14000),
      ]);
      if (!mounted) return;

      // 4. Two idle frames so layout and GC are done before the first drag.
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      const minimum = reducedMotion ? 200 : 900;
      await wait(Math.max(0, minimum - (performance.now() - started)));
      if (!mounted) return;

      finished = true;
      setProgress(1);
      setLeaving(true);
      setLoaded(true);
      window.setTimeout(() => {
        if (mounted) setGone(true);
      }, lite ? 350 : 700);
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [reducedMotion, setLoaded]);

  if (gone) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink"
      style={{
        opacity: leaving ? 0 : 1,
        transition: "opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: leaving ? "none" : "auto",
      }}
      role="status"
      aria-live="polite"
      aria-label="در حال بارگذاری لیندا"
    >
      <div className="flex w-[min(420px,80vw)] flex-col items-center gap-8">
        <Mark className="h-12 w-12 text-champagne" />
        <p className="font-serif text-2xl tracking-[0.42em] text-ivory uppercase">
          {BRAND.short}
        </p>
        <div className="h-px w-full origin-left bg-white/10">
          <div
            className="h-px origin-left bg-champagne"
            style={{
              width: `${Math.round(progress * 100)}%`,
              transition: "width 0.4s ease-out",
            }}
          />
        </div>
        <p className="font-sans text-[16px] tracking-[0.38em] text-mist uppercase">
          آتلیه زیبایی
        </p>
      </div>
    </div>
  );
}
