import { useEffect, useRef, useState } from "react";
import {
  CINEMATIC_SERVICES,
  CINEMATIC_VIDEO,
  IMAGES,
  JOURNEY,
} from "@/data/salon";
import { useData } from "@/context/DataContext";
import { useSalon } from "@/context/SalonContext";
import { useVideoAllowed } from "@/hooks/useMedia";
import { useNativeVideo } from "@/hooks/useCinematicVideo";
import { useQuality } from "@/hooks/usePerformance";
import { GoldButton, GhostButton, SectionLabel } from "@/components/primitives";
import { cn } from "@/utils/cn";

export function StorySections() {
  const { openBooking, navigateTo, reducedMotion } = useSalon();

  return (
    <>
      <section id="home" className="relative flex min-h-[100svh] min-h-[100dvh] items-end overflow-hidden bg-ink md:min-h-screen md:items-center">
        <img src={IMAGES.hero} alt="پرتره ادیتوریال از مهمان لیندا" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 18%" }} fetchPriority="high" />
        <HeroVideo reducedMotion={reducedMotion} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent sm:bg-gradient-to-l sm:from-ink/82 sm:via-ink/40 sm:to-transparent" />
        <div className="vignette absolute inset-0 opacity-60 sm:opacity-100" />
        <div className="relative z-10 w-full max-w-[1440px] px-4 py-10 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] text-right sm:px-6 sm:py-24 md:mr-auto md:px-16 md:pb-24 lg:px-24">
          <SectionLabel className="mb-3 text-[11px] sm:mb-6 sm:text-[13px]">آرامش زیبایی تهران</SectionLabel>
          <h1 className="max-w-[12ch] font-serif text-[1.9rem] leading-[1.15] font-light text-ivory text-[2.1rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">زیبایی، از نو تعریف می‌شود.</h1>
          <p className="mt-4 max-w-[28ch] text-[13px] leading-7 text-ivory-2/95 sm:mt-8 sm:max-w-md sm:text-sm sm:leading-relaxed md:text-base">مزونی خصوصی برای مو، رنگ، پوست و میکاپ؛ هر سیتینگ با آرامش و نگاه ادیتوریال، کاملاً برای شما طراحی می‌شود.</p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
            <GoldButton type="button" onClick={() => openBooking()} className="w-full justify-center py-3.5 text-sm sm:w-auto">رزرو نوبت</GoldButton>
            <GhostButton type="button" onClick={() => navigateTo("services")} className="w-full justify-center py-3.5 text-sm sm:w-auto">مشاهده خدمات</GhostButton>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-ivory/60 sm:mt-8">
            <span className="h-px w-6 bg-champagne/50" />
            <span className="tracking-[0.15em]">تهران · صادقیه · فقط با تعیین وقت</span>
          </div>
        </div>
      </section>

      <section className="render-defer relative overflow-hidden bg-ink py-12 sm:py-20 md:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 sm:gap-12 sm:px-5 md:grid-cols-2 md:px-8 lg:px-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[3/4] md:aspect-[4/5] md:rounded-none"><img src={IMAGES.brandModel} alt="موج‌های عسلی مو در نور آتلیه" className="h-full w-full object-cover" style={{ objectPosition: "center 12%" }} loading="lazy" /></div>
          <div className="max-w-lg text-right">
            <SectionLabel className="mb-3 text-[11px] sm:mb-6 sm:text-[13px]">مزون</SectionLabel>
            <h2 className="font-serif text-[1.7rem] leading-[1.2] font-light text-ivory sm:text-4xl lg:text-5xl">جایی که زیبایی به یک تجربه تبدیل می‌شود</h2>
            <p className="mt-4 text-[13px] leading-7 text-ivory-2 sm:mt-8 sm:text-sm sm:leading-relaxed md:text-[15px]">لیندا یک سالن معمولی نیست؛ تئاتری آرام از نور، بافت و مراقبت است، جایی که هر مراجعه مثل یک سیتینگ خصوصی طراحی می‌شود.</p>
            <p className="mt-3 text-[13px] leading-7 text-ivory-2/90 sm:mt-5 sm:text-sm sm:leading-relaxed">این مزون را در قلب صادقیه شکل داده‌ایم؛ هنرمندانی را کنار هم آورده‌ایم که زیبایی را یک هنر می‌دانند. سیتینگ محدود، بدون عجله و بدون نمایش اضافه؛ جز خود شما.</p>
            <div className="mt-6 flex gap-3 sm:mt-8">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-ivory">۱۵ سال تجربه</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-ivory">مواد اورجینال</span>
            </div>
          </div>
        </div>
      </section>

      <JourneyBlock />
    </>
  );
}

function HeroVideo({ reducedMotion }: { reducedMotion: boolean }) {
  const { loaded } = useSalon();
  const quality = useQuality();
  const ref = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setArmed(true), 3200);
    return () => window.clearTimeout(t);
  }, []);

  const allowed = useVideoAllowed(reducedMotion, quality) && (loaded || armed);

  useNativeVideo(ref, { active: allowed, enabled: allowed });

  if (!allowed) return null;

  return (
    <video
      ref={ref}
      src={CINEMATIC_VIDEO}
      poster={IMAGES.hero}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      disablePictureInPicture
      aria-hidden="true"
      onLoadedData={() => setReady(true)}
      className={cn(
        "absolute inset-0 h-full w-full transform-gpu object-cover transition-opacity duration-1000",
        ready ? "opacity-100" : "opacity-0",
      )}
      style={{ objectPosition: "center 18%" }}
    />
  );
}

export function ServicesBlock() {
  const { openBooking } = useSalon();
  return (
    <section id="services" className="render-defer scroll-mt-20 bg-ink-2 py-12 sm:py-20 md:py-28 lg:scroll-mt-40">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-5 md:px-8 lg:px-12">
        <div className="mb-8 flex flex-col gap-4 text-right sm:mb-16 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div><SectionLabel className="mb-3 text-[11px] sm:mb-5 sm:text-[13px]">آتلیه</SectionLabel><h2 className="font-serif text-[1.9rem] font-light text-ivory sm:text-4xl lg:text-6xl">خدمات</h2></div>
          <p className="max-w-sm text-[13px] leading-7 text-ivory-2/90 sm:text-sm sm:leading-relaxed">ده تخصص، با یک زبان مشترک؛ هر سیتینگ طراحی می‌شود و به سمت یک کاتالوگ شتاب نمی‌کند.</p>
        </div>
        <ul className="divide-y divide-white/8 border-y border-white/8">
          {CINEMATIC_SERVICES.map((s) => (
            <li key={s.id} className="group grid grid-cols-1 gap-3 py-6 text-right sm:gap-6 sm:py-8 md:grid-cols-12 md:items-center">
              <p className="text-[12px] tracking-[0.28em] text-champagne sm:text-[13px] md:col-span-1">{s.index}</p>
              <div className="md:col-span-4"><h3 className="font-serif text-xl text-ivory sm:text-2xl lg:text-3xl">{s.name}</h3><p className="mt-1 text-xs tracking-[0.28em] text-mist sm:text-[13px]">{s.eyebrow}</p></div>
              <p className="text-[13px] leading-7 text-ivory-2/95 sm:text-sm sm:leading-relaxed md:col-span-5">{s.description}</p>
              <div className="md:col-span-2 md:justify-self-end"><button type="button" data-cursor="رزرو" onClick={() => openBooking()} className="inline-flex min-h-[44px] items-center text-sm tracking-[0.2em] text-champagne transition-colors hover:text-ivory sm:text-[15px]">رزرو →</button></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function JourneyBlock() {
  return (
    <section id="ritual" className="render-defer scroll-mt-20 bg-ink py-12 sm:py-20 md:py-28 lg:scroll-mt-40">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-5 md:px-8 lg:px-12">
        <SectionLabel className="mb-3 text-[11px] sm:mb-5 sm:text-[13px]">مسیر</SectionLabel>
        <h2 className="mb-8 max-w-[16ch] font-serif text-[1.7rem] font-light text-ivory sm:mb-16 sm:text-4xl lg:text-6xl">از رزرو تا زیبایی</h2>
        <ol className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-10">
          {JOURNEY.map((step, i) => (
            <li key={step.id} className="relative text-right">
              {i < JOURNEY.length - 1 && <span className="absolute top-5 right-[28px] hidden h-px w-[calc(100%-12px)] bg-champagne/30 md:block" />}
              <p className="mb-2 font-sans text-xs tracking-[0.28em] text-champagne sm:mb-4 sm:text-[13px]">{step.index}</p>
              <h3 className="font-serif text-lg text-ivory sm:text-xl lg:text-2xl">{step.title}</h3>
              <p className="mt-2 text-xs leading-6 text-ivory-2/95 sm:mt-3 sm:text-sm sm:leading-relaxed">{step.line}</p>
            </li>
          ))}
        </ol>
        <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-2xl sm:mt-20 sm:aspect-[16/8] sm:rounded-none">
          <img src={IMAGES.hair} alt="پیش از سیتینگ" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 20%" }} loading="lazy" />
          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: "inset(0 42% 0 0)" }}><img src={IMAGES.hero} alt="پس از سیتینگ" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 18%" }} loading="lazy" /></div>
          <div className="absolute top-0 bottom-0 left-[58%] w-px bg-champagne" />
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1 text-[10px] tracking-[0.2em] text-ivory backdrop-blur-sm sm:bottom-6 sm:left-6 sm:bg-transparent sm:px-0 sm:py-0 sm:text-[13px] sm:backdrop-blur-none">پیش از سیتینگ</span>
          <span className="absolute right-3 bottom-3 rounded-full bg-ink/70 px-3 py-1 text-[10px] tracking-[0.2em] text-ivory backdrop-blur-sm sm:right-6 sm:bottom-6 sm:bg-transparent sm:px-0 sm:py-0 sm:text-[13px] sm:backdrop-blur-none">پس از سیتینگ</span>
        </div>
      </div>
    </section>
  );
}

export function AppointmentCta() {
  const { openBooking } = useSalon();
  return (
    <section className="render-defer relative overflow-hidden bg-ink-2">
      <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-4 py-12 sm:gap-12 sm:px-5 sm:py-20 md:grid-cols-2 md:px-8 md:py-28 lg:px-12">
        <div className="relative mx-auto w-full max-w-md order-2 md:order-1"><div className="rounded-[1.5rem] border border-white/10 bg-ink p-2.5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] sm:rounded-[2rem] sm:p-3 sm:shadow-[0_40px_80px_rgba(0,0,0,0.45)]"><div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] sm:rounded-[1.4rem]"><img src={IMAGES.hero} alt="پرتره‌ای از لیندا" className="h-full w-full object-cover" style={{ objectPosition: "center 18%" }} loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" /><p className="absolute right-4 bottom-4 font-serif text-lg text-ivory sm:right-5 sm:bottom-5 sm:text-xl">لیندا</p></div></div></div>
        <div className="text-right order-1 md:order-2"><SectionLabel className="mb-3 text-[11px] sm:mb-5 sm:text-[13px]">رزرو</SectionLabel><h2 className="font-serif text-[1.7rem] font-light leading-[1.2] text-ivory sm:text-4xl lg:text-6xl">فقط کافی است نوبت خود را انتخاب کنید</h2><p className="mt-4 max-w-md text-[13px] leading-7 text-ivory-2/95 sm:mt-6 sm:text-sm sm:leading-relaxed">خدمت، هنرمند و تاریخ را انتخاب کنید؛ باقی ماجرا پیش از رسیدن شما آماده است: نور، ابزارها و صندلی‌ای که از همین حالا نامتان را می‌داند.</p><GoldButton type="button" onClick={() => openBooking()} className="mt-6 w-full justify-center py-3.5 text-sm sm:mt-10 sm:w-auto">رزرو نوبت</GoldButton></div>
      </div>
    </section>
  );
}

export function AboutSection() {
  const { openBooking } = useSalon();
  const { specialists } = useData();
  return (
    <section id="about" className="render-defer scroll-mt-20 bg-ink py-12 sm:py-20 md:py-28 lg:scroll-mt-40">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 sm:gap-14 sm:px-5 md:grid-cols-2 md:px-8 lg:px-12">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl md:rounded-none"><img src={IMAGES.interior} alt="فضای داخلی لیندا در شب" className="h-full w-full object-cover" loading="lazy" /></div>
        <div className="max-w-lg text-right"><SectionLabel className="mb-3 text-[11px] sm:mb-6 sm:text-[13px]">درباره ما</SectionLabel><h2 className="font-serif text-[1.7rem] font-light text-ivory sm:text-4xl lg:text-5xl">درباره لیندا</h2><p className="mt-4 text-[13px] leading-7 text-ivory-2/95 sm:mt-8 sm:text-sm sm:leading-relaxed">یک مزون، نه یک بازار شلوغ. روز را خلوت نگه می‌داریم تا کار بزرگ‌تر باشد؛ چند سیتینگ، چند هنرمند و یک آدرس در قلب صادقیه.</p><p className="mt-3 text-[13px] leading-7 text-ivory-2/90 sm:mt-5 sm:text-sm sm:leading-relaxed">مو مثل یک ترکیب‌بندی کوتاه می‌شود، رنگ مثل نور نقاشی می‌شود و میکاپ معماری چهره است. عروس، تئاتری خصوصی است؛ شما همان خودتان می‌روید، فقط شفاف‌تر.</p><GoldButton type="button" onClick={() => openBooking()} className="mt-6 w-full justify-center py-3.5 text-sm sm:mt-10 sm:w-auto">اطلاعات بیشتر</GoldButton></div>
      </div>
      <div className="mx-auto mt-12 max-w-[1440px] px-4 sm:mt-24 sm:px-5 md:px-8 lg:px-12"><SectionLabel className="mb-4 text-[11px] sm:mb-5 sm:text-[13px]">هنرمندان</SectionLabel><h3 className="mb-6 font-serif text-2xl text-ivory sm:mb-12 sm:text-3xl lg:text-4xl">چهار دست، یک زبان.</h3><ul className="grid gap-6 sm:gap-8 grid-cols-2 lg:grid-cols-4">{specialists.filter((s)=>s.isActive).map((s) => <li key={s.id} className="text-right"><div className="aspect-[3/4] overflow-hidden rounded-xl md:rounded-none"><img src={s.image} alt={s.name} className="h-full w-full object-cover" loading="lazy" /></div><p className="mt-3 font-serif text-lg text-ivory sm:mt-4 sm:text-xl lg:text-2xl">{s.name}</p><p className="mt-1 text-xs tracking-[0.2em] text-champagne sm:text-[13px]">{s.role}</p><p className="mt-2 line-clamp-3 text-xs leading-6 text-ivory-2/90 sm:mt-3 sm:line-clamp-none sm:text-sm sm:leading-relaxed">{s.bio}</p></li>)}</ul></div>
    </section>
  );
}

export function MobileBookBar() {
  const { openBooking, bookingOpen } = useSalon();
  return (
    <div
      className={cn(
        "fixed right-0 bottom-0 left-0 z-40 border-t border-white/10 bg-ink/95 px-4 pt-3 backdrop-blur-md lg:hidden",
        "pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]",
        bookingOpen && "hidden",
      )}
    >
      <GoldButton type="button" onClick={() => openBooking()} className="w-full py-3.5 text-sm shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
        رزرو نوبت — همین حالا
      </GoldButton>
    </div>
  );
}
