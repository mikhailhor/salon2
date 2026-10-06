import { useEffect, useMemo, useRef } from "react";
import {
  CINEMATIC_SCENES,
  CINEMATIC_SERVICES,
  CINEMATIC_VIDEO,
  IMAGES,
  JOURNEY,
  toFaDigits,
} from "@/data/salon";
import { useSalon } from "@/context/SalonContext";
import {
  clamp,
  fadeWindow,
  rangeProgress,
  useCinematicProgress,
  useIsMobile,
  useIsTouch,
  useVideoAllowed,
} from "@/hooks/useMedia";
import { useCinematicVideo } from "@/hooks/useCinematicVideo";
import { GoldButton, RevealWords, SectionLabel } from "@/components/primitives";
import { cn } from "@/utils/cn";

const VIDEO_SRC = CINEMATIC_VIDEO;
const VIDEO_FALLBACK_IMG = "/images/services/makeup.jpg";
const NAILS_INDEX = 6;
const VIDEO_DURATION = 15;
const VIDEO_END_PROGRESS = 0.62;

function progressToVideoTime(progress: number): number {
  return clamp(progress / VIDEO_END_PROGRESS) * VIDEO_DURATION;
}

export default function CinematicExperience() {
  const { reducedMotion, openBooking, navigateTo, loaded } = useSalon();
  const mobile = useIsMobile();
  const touch = useIsTouch();
  /**
   * Data saver, 2g/3g and reduced motion get the still-image cut of the same
   * film: identical scenes and copy, no video bytes and no decoding cost.
   */
  const videoAllowed = useVideoAllowed(reducedMotion);
  const stills = reducedMotion || !videoAllowed;
  const trackRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progress = useCinematicProgress(trackRef, true, reducedMotion, touch);

  const heroOp = fadeWindow(progress, 0, 0.125, 0.04);
  const brandOp = fadeWindow(progress, 0.115, 0.245, 0.04);
  const servicesOp = fadeWindow(progress, 0.23, 0.625, 0.04);
  const journeyOp = fadeWindow(progress, 0.61, 0.885, 0.04);
  const finaleOp = fadeWindow(progress, 0.87, 1.02, 0.04);

  const svcLocal = rangeProgress(progress, 0.24, 0.62);
  const svcCount = CINEMATIC_SERVICES.length;
  const svcFloat = svcLocal * svcCount;
  const svcIndex = Math.min(svcCount - 1, Math.floor(svcFloat));
  const svc = CINEMATIC_SERVICES[svcIndex];

  const jourLocal = rangeProgress(progress, 0.62, 0.88);
  const jourCount = JOURNEY.length;
  const jourFloat = jourLocal * jourCount;
  const jourIndex = Math.min(jourCount - 1, Math.floor(jourFloat));
  const jour = JOURNEY[jourIndex];
  const finalLookP =
    jourIndex === jourCount - 1
      ? clamp((jourFloat - (jourCount - 1)) * 1.15)
      : 0;

  const activeScene = useMemo(() => {
    const found = CINEMATIC_SCENES.find((s) => progress >= s.start && progress < s.end);
    return found ?? CINEMATIC_SCENES[CINEMATIC_SCENES.length - 1];
  }, [progress]);

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
          behavior: reducedMotion ? "auto" : "smooth",
        });
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        const prev = CINEMATIC_SCENES[Math.max(0, idx - 1)];
        window.scrollTo({
          top: track.offsetTop + total * (prev.start + 0.02),
          behavior: reducedMotion ? "auto" : "smooth",
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeScene.id, reducedMotion]);

  const videoOp = stills ? 0 : 1 - clamp((progress - 0.61) / 0.04);
  const videoTarget = progressToVideoTime(progress);

  /**
   * Desktop scrubs the clip with the scroll. On touch devices seeking per
   * frame is what breaks the scroll, so the clip simply plays — muted, looping
   * and native — which is the smoothest possible "video showcase" there.
   */
  useCinematicVideo(videoRef, {
    mode: touch ? "play" : "scrub",
    targetTime: videoTarget,
    // On touch the clip waits for the curtain so it never competes with the
    // hero imagery for the first megabytes of a mobile connection.
    active: !stills && videoOp > 0.02 && (!touch || loaded),
    enabled: !stills,
    duration: VIDEO_DURATION,
  });

  const blurAmt = (op: number) =>
    mobile || touch || reducedMotion ? 0 : (1 - op) * 10;
  /**
   * `undefined` rather than `blur(0px)`: an explicit filter still promotes the
   * whole scene to its own filtered layer, which is exactly the per-frame cost
   * phones and tablets cannot spare.
   */
  const blurFilter = (op: number) => {
    const b = blurAmt(op);
    return b > 0.05 ? `blur(${b}px)` : undefined;
  };
  const ken = (local: number) => (reducedMotion ? 1 : 1.04 + local * (mobile ? 0.03 : 0.06));

  const goScene = (start: number) => {
    const track = trackRef.current;
    if (!track) return;
    const total = track.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: track.offsetTop + total * (start + 0.01),
      behavior: reducedMotion ? "auto" : "smooth",
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
            className="h-full bg-champagne"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {!stills && (
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            poster={VIDEO_FALLBACK_IMG}
            className="pointer-events-none absolute inset-0 h-full w-full transform-gpu object-cover"
            style={{
              opacity: videoOp,
              visibility: videoOp < 0.02 ? "hidden" : "visible",
            }}
            muted
            playsInline
            disablePictureInPicture
            preload={touch ? "metadata" : "auto"}
            aria-hidden="true"
          />
        )}
        {!stills && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-ink/25" />
            <div className="absolute inset-0 bg-gradient-to-l from-ink/70 via-ink/15 to-ink/45" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/80 to-transparent" />
          </div>
        )}

        {/* SCENE 01 — HERO */}
        <div
          className="absolute inset-0"
          style={{
            opacity: heroOp,
            visibility: heroOp < 0.02 ? "hidden" : "visible",
            pointerEvents: heroOp > 0.35 ? "auto" : "none",
            filter: blurFilter(heroOp),
          }}
          aria-hidden={heroOp < 0.2}
        >
          {stills && (
            <img
              src={IMAGES.hero}
              alt="پرتره ادیتوریال از مهمان لیندا"
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                objectPosition: "center 18%",
                transform: `scale(${ken(rangeProgress(progress, 0, 0.12))})`,
              }}
              fetchPriority="high"
            />
          )}
          {stills && (
            <>
              <div className="absolute inset-0 bg-gradient-to-l from-ink/80 via-ink/35 to-transparent" />
              <div className="vignette absolute inset-0" />
            </>
          )}
          <div className="relative z-10 flex h-full flex-col items-end justify-end px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] text-right sm:px-6 md:justify-center md:px-16 md:pb-24 lg:px-24 lg:pb-0">
            <SectionLabel className="mb-6">آرامش زیبایی تهران</SectionLabel>
            <h1 className="max-w-[12ch] font-serif text-[2.6rem] leading-[1.12] font-light text-ivory sm:text-6xl md:text-7xl lg:text-8xl">
              <RevealWords text="زیبایی، از نو تعریف می‌شود." active={heroOp > 0.45} />
            </h1>
            <p
              className="mt-8 max-w-md text-sm leading-relaxed text-ivory-2/95 md:text-base"
              style={{
                opacity: heroOp > 0.6 ? 1 : 0,
                transform: heroOp > 0.6 ? "translateY(0)" : "translateY(16px)",
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
            <span className="h-10 w-px origin-top bg-champagne/80" style={{ animation: "scroll-hint 2.2s ease-in-out infinite" }} />
          </div>
        </div>

        {/* SCENE 02 — BRAND */}
        <div
          className="absolute inset-0"
          style={{
            opacity: brandOp,
            visibility: brandOp < 0.02 ? "hidden" : "visible",
            pointerEvents: brandOp > 0.35 ? "auto" : "none",
            filter: blurFilter(brandOp),
          }}
          aria-hidden={brandOp < 0.2}
        >
          {stills && (
            <img
              src={IMAGES.brandModel}
              alt="مدل لیندا در نور آتلیه"
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                objectPosition: "center 12%",
                transform: `scale(${ken(rangeProgress(progress, 0.12, 0.24))})`,
              }}
            />
          )}
          {stills && (
            <div className="absolute inset-0 bg-ink/55 md:bg-gradient-to-l md:from-ink/85 md:via-ink/45 md:to-ink/20" />
          )}
          <div className="relative z-10 flex h-full items-end px-5 pt-20 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] text-right sm:px-6 md:items-center md:px-16 md:pb-20 lg:px-24">
            <div className="max-w-xl">
              <SectionLabel className="mb-6">مزون</SectionLabel>
              <h2 className="font-serif text-[2.1rem] leading-[1.12] font-light text-ivory sm:text-5xl lg:text-6xl">
                <RevealWords
                  text="جایی که زیبایی به یک تجربه تبدیل می‌شود"
                  active={brandOp > 0.4}
                />
              </h2>
              <p
                className="mt-8 max-w-md text-sm leading-relaxed text-ivory-2 md:text-[15px]"
                style={{
                  opacity: brandOp > 0.55 ? 1 : 0,
                  transform: brandOp > 0.55 ? "none" : "translateY(14px)",
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
        <div
          className="absolute inset-0"
          style={{
            opacity: servicesOp,
            visibility: servicesOp < 0.02 ? "hidden" : "visible",
            pointerEvents: servicesOp > 0.35 ? "auto" : "none",
            filter: blurFilter(servicesOp),
          }}
          aria-hidden={servicesOp < 0.2}
        >
          {stills
            ? CINEMATIC_SERVICES.map((item, i) => {
                const dist = Math.abs(svcFloat - i);
                const op = clamp(1 - dist * 0.95);
                return (
                  <img
                    key={item.id}
                    src={item.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{
                      objectPosition: item.objectPosition,
                      opacity: op,
                      transform: `scale(${1.02 + (1 - dist) * 0.04})`,
                    }}
                  />
                );
              })
            : (
              <img
                src={IMAGES.nails}
                alt="آرت ناخن در نور آتلیه"
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  opacity: clamp(1 - Math.abs(svcFloat - NAILS_INDEX) * 0.95),
                  transform: `scale(${1.02 + clamp(1 - Math.abs(svcFloat - NAILS_INDEX)) * 0.04})`,
                  transition: "opacity 0.6s ease",
                }}
              />
            )}
          {stills && (
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/25" />
          )}
          <div className="relative z-10 flex h-full flex-col items-end justify-end px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] text-right sm:px-6 md:px-16 md:pb-20 lg:px-24">
            <SectionLabel className="mb-4">آتلیه</SectionLabel>
            <p className="mb-2 font-sans text-[16px] tracking-[0.4em] text-ivory/80">
              {svc.index} / {toFaDigits(svcCount).padStart(2, "۰")}
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
                className="h-px bg-champagne"
                style={{ width: `${((svcFloat % 1) * 100).toFixed(1)}%` }}
              />
            </div>
          </div>
        </div>

        {/* SCENE 04 — JOURNEY */}
        <div
          className="absolute inset-0"
          style={{
            opacity: journeyOp,
            visibility: journeyOp < 0.02 ? "hidden" : "visible",
            pointerEvents: journeyOp > 0.35 ? "auto" : "none",
            filter: blurFilter(journeyOp),
          }}
          aria-hidden={journeyOp < 0.2}
        >
          {JOURNEY.map((step, i) => {
            const dist = Math.abs(jourFloat - i);
            const op = clamp(1 - dist * 0.9);
            if (step.id === "final") return null;
            return (
              <img
                key={step.id}
                src={step.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  opacity: op,
                  objectPosition: "center center",
                  transform: `scale(${1.03 + (1 - dist) * 0.03})`,
                }}
              />
            );
          })}

          {/* Final look before / after */}
          <div
            className="absolute inset-0"
            style={{ opacity: jour.id === "final" ? 1 : 0 }}
          >
            <img
              src={IMAGES.hair}
              alt="پیش از سیتینگ"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "center 20%" }}
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath: `inset(0 ${100 - finalLookP * 100}% 0 0)`,
              }}
            >
              <img
                src={IMAGES.hero}
                alt="پس از سیتینگ"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "center 18%" }}
              />
            </div>
            <div
              className="absolute top-0 bottom-0 w-px bg-champagne"
              style={{ left: `${finalLookP * 100}%` }}
            />
            <span className="absolute bottom-[calc(12rem+env(safe-area-inset-bottom,0px))] left-5 text-[13px] tracking-[0.3em] text-ivory/90 uppercase sm:text-[16px] md:bottom-28 md:left-16">
              پیش از سیتینگ
            </span>
            <span className="absolute right-5 bottom-[calc(12rem+env(safe-area-inset-bottom,0px))] text-[13px] tracking-[0.3em] text-ivory/90 uppercase sm:text-[16px] md:right-16 md:bottom-28">
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
                    i <= jourIndex ? "bg-champagne" : "bg-white/15",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* SCENE 05 — FINALE */}
        <div
          className="absolute inset-0"
          style={{
            opacity: finaleOp,
            visibility: finaleOp < 0.02 ? "hidden" : "visible",
            pointerEvents: finaleOp > 0.35 ? "auto" : "none",
            filter: blurFilter(finaleOp),
          }}
          aria-hidden={finaleOp < 0.2}
        >
          <img
            src={IMAGES.chair}
            alt="صندلی خالی آرایش در انتظار شما در آتلیه"
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: "center center",
              transform: `scale(${ken(rangeProgress(progress, 0.88, 1))})`,
            }}
          />
          <div className="absolute inset-0 bg-ink/60" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pb-16 text-center md:pb-0">
            <SectionLabel className="mb-6">دعوت</SectionLabel>
            <h2 className="max-w-[14ch] font-serif text-[2.6rem] leading-[1.1] font-light text-ivory sm:text-6xl lg:text-7xl">
              <RevealWords text="صندلی شما منتظر است." active={finaleOp > 0.4} />
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
