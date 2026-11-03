import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CINEMATIC_SCENES,
  CINEMATIC_SERVICES,
  IMAGES,
  JOURNEY,
  toFaDigits,
} from "@/data/salon";
import {
  FILMSTRIP,
  FILM_END_PROGRESS,
  FILM_FALLBACK,
  FILM_FRAME_COUNT,
} from "@/data/filmstrip";
import { useSalon } from "@/context/SalonContext";
import {
  clamp,
  fadeWindow,
  rangeProgress,
  setAttr,
  setStyle,
  useCinematicProgress,
  useIsMobile,
  useIsTouch,
} from "@/hooks/useMedia";
import { useQuality } from "@/hooks/usePerformance";
import { GoldButton, RevealWords, SectionLabel } from "@/components/primitives";
import { cn } from "@/utils/cn";

const NAILS_INDEX = 6;
const SCENE_COUNT = 5;

/**
 * Only the values that change a handful of times over the whole scroll track
 * live in React state. Everything continuous (opacity, transforms, frames) is
 * written straight to cached DOM nodes from the scroll loop — no reconciliation
 * of this tree on any animation frame.
 */
interface DiscreteState {
  sceneIndex: number;
  svcIndex: number;
  jourIndex: number;
  heroText: boolean;
  heroPara: boolean;
  brandText: boolean;
  brandPara: boolean;
  finaleText: boolean;
}

const INITIAL_STATE: DiscreteState = {
  sceneIndex: 0,
  svcIndex: 0,
  jourIndex: 0,
  heroText: false,
  heroPara: false,
  brandText: false,
  brandPara: false,
  finaleText: false,
};

function sameState(a: DiscreteState, b: DiscreteState) {
  return (
    a.sceneIndex === b.sceneIndex &&
    a.svcIndex === b.svcIndex &&
    a.jourIndex === b.jourIndex &&
    a.heroText === b.heroText &&
    a.heroPara === b.heroPara &&
    a.brandText === b.brandText &&
    a.brandPara === b.brandPara &&
    a.finaleText === b.finaleText
  );
}

const FILM_STEPS = JOURNEY.filter((step) => step.id !== "final");

export default function CinematicExperience() {
  const { reducedMotion, openBooking, navigateTo } = useSalon();
  const quality = useQuality();
  const lite = quality === "lite";
  const mobile = useIsMobile();
  const touch = useIsTouch();

  const [state, setState] = useState<DiscreteState>(INITIAL_STATE);
  const stateRef = useRef(state);

  const trackRef = useRef<HTMLElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const filmRef = useRef<HTMLDivElement | null>(null);
  const frameARef = useRef<HTMLImageElement | null>(null);
  const frameBRef = useRef<HTMLImageElement | null>(null);
  const svcBarRef = useRef<HTMLDivElement | null>(null);
  const nailsRef = useRef<HTMLImageElement | null>(null);
  const finaleImgRef = useRef<HTMLImageElement | null>(null);
  const finalBlockRef = useRef<HTMLDivElement | null>(null);
  const finalClipRef = useRef<HTMLDivElement | null>(null);
  const finalLineRef = useRef<HTMLDivElement | null>(null);

  const heroSceneRef = useRef<HTMLDivElement | null>(null);
  const brandSceneRef = useRef<HTMLDivElement | null>(null);
  const servicesSceneRef = useRef<HTMLDivElement | null>(null);
  const journeySceneRef = useRef<HTMLDivElement | null>(null);
  const finaleSceneRef = useRef<HTMLDivElement | null>(null);

  const journeyImgRefs = useRef<Array<HTMLImageElement | null>>([]);
  const journeyRefSetters = useMemo(
    () =>
      FILM_STEPS.map(
        (_, i) => (el: HTMLImageElement | null) => {
          journeyImgRefs.current[i] = el;
        },
      ),
    [],
  );

  const lastFrameRef = useRef(-1);
  const lastLiteRef = useRef(lite);

  const sceneEls = useCallback(
    () => [
      heroSceneRef.current,
      brandSceneRef.current,
      servicesSceneRef.current,
      journeySceneRef.current,
      finaleSceneRef.current,
    ],
    [],
  );

  const onFrame = useCallback(
    (p: number) => {
      const ops = [
        fadeWindow(p, 0, 0.125, 0.04),
        fadeWindow(p, 0.115, 0.245, 0.04),
        fadeWindow(p, 0.23, 0.625, 0.04),
        fadeWindow(p, 0.61, 0.885, 0.04),
        fadeWindow(p, 0.87, 1.02, 0.04),
      ];
      const scenes = sceneEls();

      for (let i = 0; i < SCENE_COUNT; i += 1) {
        const el = scenes[i];
        const op = ops[i];
        setStyle(el, "opacity", op.toFixed(3));
        setStyle(el, "visibility", op < 0.02 ? "hidden" : "visible");
        setStyle(el, "pointer-events", op > 0.35 ? "auto" : "none");
        setAttr(el, "aria-hidden", op < 0.2 ? "true" : "false");
        // Filters on full-screen layers are the most expensive effect there
        // is. Quantised to 0.5px steps on capable desktops, absent elsewhere.
        if (lite || touch || reducedMotion) {
          setStyle(el, "filter", "none");
        } else {
          const blur = op > 0.985 ? 0 : Math.round((1 - op) * 8) / 2;
          setStyle(el, "filter", blur > 0 ? `blur(${blur}px)` : "none");
        }
      }

      // transform instead of width: no layout on any scroll frame.
      setStyle(progressBarRef.current, "transform", `scaleX(${p.toFixed(4)})`);

      /* ---- filmstrip: two cached bitmaps, zero video decoding ---- */
      const filmOp = 1 - clamp((p - 0.61) / 0.04);
      setStyle(filmRef.current, "opacity", filmOp.toFixed(3));
      setStyle(filmRef.current, "visibility", filmOp < 0.02 ? "hidden" : "visible");

      const frameFloat = clamp(p / FILM_END_PROGRESS) * (FILM_FRAME_COUNT - 1);
      const frameIndex = Math.min(FILM_FRAME_COUNT - 1, Math.floor(frameFloat));
      const mix = clamp(frameFloat - frameIndex);
      if (frameIndex !== lastFrameRef.current || lite !== lastLiteRef.current) {
        setAttr(frameARef.current, "src", FILMSTRIP[frameIndex]);
        if (!lite) {
          setAttr(
            frameBRef.current,
            "src",
            FILMSTRIP[Math.min(FILM_FRAME_COUNT - 1, frameIndex + 1)],
          );
        }
        lastFrameRef.current = frameIndex;
        lastLiteRef.current = lite;
      }
      // Lite swaps whole frames (no two-layer crossfade to composite).
      setStyle(frameARef.current, "opacity", lite ? "1" : (1 - mix).toFixed(3));
      setStyle(frameBRef.current, "opacity", lite ? "0" : mix.toFixed(3));

      /* ---- services ---- */
      const svcCount = CINEMATIC_SERVICES.length;
      const svcFloat = rangeProgress(p, 0.24, 0.62) * svcCount;
      const svcIndex = Math.min(svcCount - 1, Math.floor(svcFloat));
      setStyle(svcBarRef.current, "transform", `scaleX(${(svcFloat % 1).toFixed(3)})`);
      if (!lite) {
        const distance = Math.abs(svcFloat - NAILS_INDEX);
        setStyle(nailsRef.current, "opacity", clamp(1 - distance * 0.95).toFixed(3));
        setStyle(
          nailsRef.current,
          "transform",
          `scale(${(1.02 + clamp(1 - distance) * 0.04).toFixed(3)})`,
        );
      }

      /* ---- journey ---- */
      const jourFloat = rangeProgress(p, 0.62, 0.88) * JOURNEY.length;
      const jourIndex = Math.min(JOURNEY.length - 1, Math.floor(jourFloat));
      const isFinal = jourIndex === JOURNEY.length - 1;

      if (!lite) {
        for (let i = 0; i < FILM_STEPS.length; i += 1) {
          const el = journeyImgRefs.current[i] ?? null;
          const distance = Math.abs(jourFloat - i);
          setStyle(el, "opacity", clamp(1 - distance * 0.9).toFixed(3));
          setStyle(el, "transform", `scale(${(1.03 + (1 - distance) * 0.03).toFixed(3)})`);
        }
      } else {
        // Snapped to the nearest step. setStyle short-circuits unchanged
        // values, so this is four comparisons per frame and no DOM writes.
        for (let i = 0; i < FILM_STEPS.length; i += 1) {
          const el = journeyImgRefs.current[i] ?? null;
          setStyle(el, "opacity", !isFinal && i === jourIndex ? "1" : "0");
          setStyle(el, "transform", "none");
        }
      }

      const finalVisible = isFinal && ops[3] > 0.02;
      setStyle(finalBlockRef.current, "opacity", finalVisible ? "1" : "0");
      setStyle(finalBlockRef.current, "visibility", finalVisible ? "visible" : "hidden");
      const finalP = isFinal
        ? clamp((jourFloat - (JOURNEY.length - 1)) * 1.15)
        : 0;
      // clip-path/left repaint; on lite they are quantised to 12 steps.
      const reveal = lite ? Math.round(finalP * 12) / 12 : finalP;
      setStyle(
        finalClipRef.current,
        "clip-path",
        `inset(0 ${((1 - reveal) * 100).toFixed(1)}% 0 0)`,
      );
      setStyle(finalLineRef.current, "left", `${(reveal * 100).toFixed(1)}%`);

      /* ---- finale ---- */
      if (!lite) {
        const ken = reducedMotion
          ? 1
          : 1.04 + rangeProgress(p, 0.88, 1) * (mobile ? 0.03 : 0.06);
        setStyle(finaleImgRef.current, "transform", `scale(${ken.toFixed(3)})`);
      } else {
        setStyle(finaleImgRef.current, "transform", "none");
      }

      /* ---- discrete React state: at most ~20 updates for the whole track ---- */
      let sceneIndex = CINEMATIC_SCENES.findIndex((s) => p >= s.start && p < s.end);
      if (sceneIndex < 0) sceneIndex = CINEMATIC_SCENES.length - 1;
      const next: DiscreteState = {
        sceneIndex,
        svcIndex,
        jourIndex,
        heroText: ops[0] > 0.45,
        heroPara: ops[0] > 0.6,
        brandText: ops[1] > 0.4,
        brandPara: ops[1] > 0.55,
        finaleText: ops[4] > 0.4,
      };
      if (!sameState(stateRef.current, next)) {
        stateRef.current = next;
        setState(next);
      }
    },
    [lite, touch, reducedMotion, mobile, sceneEls],
  );

  useCinematicProgress(trackRef, {
    enabled: true,
    reduced: reducedMotion,
    touch,
    lite,
    onFrame,
  });

  const activeScene = CINEMATIC_SCENES[state.sceneIndex];
  const svc = CINEMATIC_SERVICES[state.svcIndex];
  const jour = JOURNEY[state.jourIndex];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const track = trackRef.current;
      if (!track) return;
      const total = track.offsetHeight - window.innerHeight;
      const idx = CINEMATIC_SCENES.findIndex((s) => s.id === activeScene.id);
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        const next = CINEMATIC_SCENES[Math.min(CINEMATIC_SCENES.length - 1, idx + 1)];
        window.scrollTo({
          top: track.offsetTop + total * (next.start + 0.02),
          behavior: lite || reducedMotion ? "auto" : "smooth",
        });
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        const prev = CINEMATIC_SCENES[Math.max(0, idx - 1)];
        window.scrollTo({
          top: track.offsetTop + total * (prev.start + 0.02),
          behavior: lite || reducedMotion ? "auto" : "smooth",
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeScene.id, reducedMotion, lite]);

  const goScene = (start: number) => {
    const track = trackRef.current;
    if (!track) return;
    const total = track.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: track.offsetTop + total * (start + 0.01),
      behavior: lite || reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <section
      id="cinematic-track"
      ref={trackRef}
      className="relative h-[620vh] bg-ink sm:h-[760vh] lg:h-[960vh]"
      aria-label="معرفی سینمایی لیندا"
    >
      <div
        id="home"
        className="cinematic-stage sticky top-0 h-[100svh] overflow-hidden bg-ink lg:h-screen"
      >
        <div className="pointer-events-none absolute top-0 left-0 z-30 h-[2px] w-full bg-white/5">
          <div
            ref={progressBarRef}
            className="progress-fill h-full w-full origin-left bg-champagne"
          />
        </div>

        {/* Pre-decoded film frames: no <video>, no seeks, no decoder at runtime. */}
        <div
          ref={filmRef}
          className="film-layer pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <img
            ref={frameARef}
            src={FILMSTRIP[0]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = FILM_FALLBACK;
            }}
          />
          <img
            ref={frameBRef}
            src={FILMSTRIP[1]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-0"
            onError={(e) => {
              e.currentTarget.src = FILM_FALLBACK;
            }}
          />
        </div>
        {/* One layer instead of three stacked full-screen gradients. */}
        <div className="film-overlay pointer-events-none absolute inset-0" />

        {/* SCENE 01 — HERO */}
        <div ref={heroSceneRef} className="scene-layer absolute inset-0">
          <div className="relative z-10 flex h-full flex-col items-end justify-end px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] text-right sm:px-6 md:justify-center md:px-16 md:pb-24 lg:px-24 lg:pb-0">
            <SectionLabel className="mb-6">آرامش زیبایی تهران</SectionLabel>
            <h1 className="max-w-[12ch] font-serif text-[2.6rem] leading-[1.12] font-light text-ivory sm:text-6xl md:text-7xl lg:text-8xl">
              <RevealWords text="زیبایی، از نو تعریف می‌شود." active={state.heroText} />
            </h1>
            <p
              className="mt-8 max-w-md text-sm leading-relaxed text-ivory-2/95 md:text-base"
              style={{
                opacity: state.heroPara ? 1 : 0,
                transform: state.heroPara ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.8s ease, transform 0.8s ease",
              }}
            >
              مزونی خصوصی برای مو، رنگ، پوست و میکاپ؛ هر سیتینگ با آرامش و نگاه
              ادیتوریال، کاملاً برای شما طراحی می‌شود.
            </p>
          </div>
          <div className="absolute bottom-[calc(7.5rem+env(safe-area-inset-bottom,0px))] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 md:bottom-24 lg:bottom-8">
            <span className="text-[15px] tracking-[0.4em] text-ivory/80 uppercase">
              اسکرول کنید
            </span>
            <span className="h-10 w-px origin-top bg-champagne/80 scroll-hint-line" />
          </div>
        </div>

        {/* SCENE 02 — BRAND */}
        <div ref={brandSceneRef} className="scene-layer absolute inset-0">
          <div className="relative z-10 flex h-full items-end px-5 pt-20 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] text-right sm:px-6 md:items-center md:px-16 md:pb-20 lg:px-24">
            <div className="max-w-xl">
              <SectionLabel className="mb-6">مزون</SectionLabel>
              <h2 className="font-serif text-[2.1rem] leading-[1.12] font-light text-ivory sm:text-5xl lg:text-6xl">
                <RevealWords
                  text="جایی که زیبایی به یک تجربه تبدیل می‌شود"
                  active={state.brandText}
                />
              </h2>
              <p
                className="mt-8 max-w-md text-sm leading-relaxed text-ivory-2 md:text-[15px]"
                style={{
                  opacity: state.brandPara ? 1 : 0,
                  transform: state.brandPara ? "none" : "translateY(14px)",
                  transition: "opacity 0.8s ease, transform 0.8s ease",
                }}
              >
                لیندا یک سالن معمولی نیست؛ تئاتری آرام از نور، بافت و مراقبت
                است، جایی که هر مراجعه مثل یک سیتینگ خصوصی طراحی می‌شود و هیچ‌چیز
                به سمت ترندها شتاب نمی‌کند.
              </p>
            </div>
          </div>
        </div>

        {/* SCENE 03 — SERVICES */}
        <div ref={servicesSceneRef} className="scene-layer absolute inset-0">
          <img
            ref={nailsRef}
            src={IMAGES.nails}
            alt="آرت ناخن در نور آتلیه"
            className="cinematic-accent absolute inset-0 h-full w-full object-cover"
          />
          <div className="relative z-10 flex h-full flex-col items-end justify-end px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] text-right sm:px-6 md:px-16 md:pb-20 lg:px-24">
            <SectionLabel className="mb-4">آتلیه</SectionLabel>
            <p className="mb-2 font-sans text-[16px] tracking-[0.4em] text-ivory/80">
              {svc.index} / {toFaDigits(CINEMATIC_SERVICES.length).padStart(2, "۰")}
            </p>
            <h2 className="font-serif text-[2.6rem] leading-[1.1] font-light text-ivory sm:text-6xl lg:text-8xl">
              {svc.name}
            </h2>
            <p className="mt-2 text-[15px] tracking-[0.32em] text-champagne uppercase">
              {svc.eyebrow}
            </p>
            <p className="mt-4 line-clamp-4 max-w-lg text-[13px] leading-relaxed text-ivory-2 sm:text-sm md:line-clamp-none">
              {svc.description}
            </p>
            <div className="mt-8 h-px w-full max-w-xs bg-white/10">
              <div
                ref={svcBarRef}
                className="progress-fill h-px w-full origin-left bg-champagne"
              />
            </div>
          </div>
        </div>

        {/* SCENE 04 — JOURNEY */}
        <div ref={journeySceneRef} className="scene-layer absolute inset-0">
          {FILM_STEPS.map((step, i) => (
            <img
              key={step.id}
              ref={journeyRefSetters[i]}
              src={step.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ))}

          {/* Final look before / after */}
          <div ref={finalBlockRef} className="final-block absolute inset-0">
            <img
              src={IMAGES.hair}
              alt="پیش از سیتینگ"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "center 20%" }}
            />
            <div
              ref={finalClipRef}
              className="final-clip absolute inset-0 overflow-hidden"
            >
              <img
                src={IMAGES.hero}
                alt="پس از سیتینگ"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "center 18%" }}
              />
            </div>
            <div
              ref={finalLineRef}
              className="absolute top-0 bottom-0 left-0 w-px bg-champagne"
            />
            <span className="absolute bottom-[calc(12rem+env(safe-area-inset-bottom,0px))] left-5 text-[13px] tracking-[0.3em] text-ivory/90 uppercase sm:text-[16px] md:bottom-28 md:left-16">
              پیش از سیتینگ
            </span>
            <span className="absolute right-5 bottom-[calc(12rem+env(safe-area-inset-bottom,0px))] text-[13px] tracking-[0.3em] text-ivory/90 uppercase sm:text-[16px] md:bottom-28 md:right-16">
              پس از سیتینگ
            </span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
          <div className="relative z-10 flex h-full flex-col items-end justify-end px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] text-right sm:px-6 md:px-16 md:pb-16 lg:px-24">
            <SectionLabel className="mb-4">از رزرو تا زیبایی</SectionLabel>
            <p className="mb-2 font-sans text-[16px] tracking-[0.4em] text-ivory/80">
              {jour.index} / ۰۵
            </p>
            <h2 className="font-serif text-[2.5rem] leading-[1.1] font-light text-ivory sm:text-6xl lg:text-7xl">
              {jour.title}
            </h2>
            <p className="mt-3 max-w-md font-serif text-lg text-champagne sm:text-2xl">
              {jour.line}
            </p>
            <p className="mt-3 line-clamp-3 max-w-md text-[13px] leading-relaxed text-ivory-2/95 sm:text-sm md:line-clamp-none">
              {jour.body}
            </p>
            <div className="mt-6 flex gap-2 md:mt-8">
              {JOURNEY.map((s, i) => (
                <span
                  key={s.id}
                  className={cn(
                    "h-px w-8 transition-colors duration-500",
                    i <= state.jourIndex ? "bg-champagne" : "bg-white/15",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* SCENE 05 — FINALE */}
        <div ref={finaleSceneRef} className="scene-layer absolute inset-0">
          <img
            ref={finaleImgRef}
            src={IMAGES.chair}
            alt="صندلی خالی آرایش در انتظار شما در آتلیه"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/60" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-16 text-center md:pb-0">
            <SectionLabel className="mb-6">دعوت</SectionLabel>
            <h2 className="max-w-[14ch] font-serif text-[2.6rem] leading-[1.1] font-light text-ivory sm:text-6xl lg:text-7xl">
              <RevealWords text="صندلی شما منتظر است." active={state.finaleText} />
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory-2/95">
              هر روز فقط چند سیتینگ محدود؛ یک ساعت خصوصی در مزون برای خودتان رزرو کنید.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <GoldButton type="button" onClick={() => openBooking()}>
                رزرو نوبت
              </GoldButton>
              <button
                type="button"
                data-cursor="کاوش"
                onClick={() => navigateTo("portfolio")}
                className="text-[16px] tracking-[0.32em] text-ivory/90 uppercase transition-colors hover:text-champagne"
              >
                ادامه به گالری
              </button>
            </div>
          </div>
        </div>

        {/* Scene rail — compact, thumb-reachable version for phones/tablets */}
        <ol className="absolute bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 lg:hidden">
          {CINEMATIC_SCENES.map((s) => {
            const on = activeScene.id === s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => goScene(s.start)}
                  aria-current={on}
                  aria-label={`صحنه ${s.index} ${s.label}`}
                  className="flex h-8 w-7 items-center justify-center"
                >
                  <span
                    className={cn(
                      "block h-1.5 rounded-full transition-all duration-500",
                      on ? "w-6 bg-champagne" : "w-1.5 bg-white/30",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ol>

        {/* Scene rail */}
        <ol className="absolute top-1/2 left-5 z-20 hidden -translate-y-1/2 flex-col gap-4 lg:flex">
          {CINEMATIC_SCENES.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                data-cursor="کاوش"
                onClick={() => goScene(s.start)}
                className="group flex items-center justify-start gap-3"
                aria-current={activeScene.id === s.id}
              >
                <span
                  className={cn(
                    "text-[15px] tracking-[0.28em] uppercase transition-colors duration-500",
                    activeScene.id === s.id
                      ? "text-champagne"
                      : "text-ivory/75 group-hover:text-ivory/90",
                  )}
                >
                  {s.index} {s.label}
                </span>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-all duration-500",
                    activeScene.id === s.id
                      ? "scale-125 bg-champagne"
                      : "bg-white/30",
                  )}
                />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
