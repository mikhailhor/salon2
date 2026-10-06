import { useEffect, useState } from "react";
import { ALL_IMAGES, BRAND } from "@/data/salon";
import { Mark } from "@/components/primitives";
import { useSalon } from "@/context/SalonContext";
import { prefersLightData, useIsTouch } from "@/hooks/useMedia";

export default function Preloader() {
  const { setLoaded, reducedMotion } = useSalon();
  const touch = useIsTouch();
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let mounted = true;
    const started = performance.now();

    /**
     * Warming the cache is nice on wifi and rude on a phone hotspot, and it
     * must never hold the visitor hostage: the curtain lifts after `cap` at the
     * latest, no matter how many images are still in flight.
     */
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const cap = reducedMotion ? 250 : touch ? 2400 : 4200;

    const load = async () => {
      let done = 0;
      const warm =
        prefersLightData() || ALL_IMAGES.length === 0
          ? Promise.resolve()
          : Promise.all(
              ALL_IMAGES.map(
                (src) =>
                  new Promise<void>((resolve) => {
                    const img = new Image();
                    const settle = () => {
                      done += 1;
                      if (mounted) setProgress(done / ALL_IMAGES.length);
                      resolve();
                    };
                    img.onload = settle;
                    img.onerror = settle;
                    img.src = src;
                  }),
              ),
            ).then(() => undefined);

      await Promise.race([warm, wait(cap)]);
      if (!mounted) return;
      setProgress(1);

      const min = reducedMotion ? 200 : 1600;
      await wait(Math.max(0, min - (performance.now() - started)));
      if (!mounted) return;
      setLeaving(true);
      setLoaded(true);
      window.setTimeout(() => {
        if (mounted) setGone(true);
      }, reducedMotion ? 80 : 900);
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
