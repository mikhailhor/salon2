import { CINEMATIC_SERVICES, IMAGES, JOURNEY, STYLISTS } from "@/data/salon";
import { useSalon } from "@/context/SalonContext";
import { GoldButton, GhostButton, SectionLabel } from "@/components/primitives";
import { cn } from "@/utils/cn";

export function StorySections() {
  const { openBooking, navigateTo } = useSalon();

  return (
    <>
      <section id="home" className="relative flex min-h-screen items-end overflow-hidden bg-ink md:items-center">
        <img src={IMAGES.hero} alt="پرتره ادیتوریال از مهمان لیندا" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 18%" }} fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-l from-ink/82 via-ink/40 to-transparent" />
        <div className="vignette absolute inset-0" />
        <div className="relative z-10 max-w-[1440px] px-6 py-28 text-right md:mr-auto md:px-16 lg:px-24">
          <SectionLabel className="mb-6">آرامش زیبایی تهران</SectionLabel>
          <h1 className="max-w-[12ch] font-serif text-5xl leading-[1.15] font-light text-ivory sm:text-7xl lg:text-8xl">زیبایی، از نو تعریف می‌شود.</h1>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-ivory-2 md:text-base">مزونی خصوصی برای مو، رنگ، پوست و میکاپ؛ هر سیتینگ با آرامش و نگاه ادیتوریال، کاملاً برای شما طراحی می‌شود.</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <GoldButton type="button" onClick={() => openBooking()}>رزرو نوبت</GoldButton>
            <GhostButton type="button" onClick={() => navigateTo("services")}>مشاهده خدمات</GhostButton>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-24 md:py-32">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 md:grid-cols-2 md:px-8 lg:px-12">
          <div className="relative aspect-[3/4] overflow-hidden md:aspect-[4/5]"><img src={IMAGES.brandModel} alt="موج‌های عسلی مو در نور آتلیه" className="h-full w-full object-cover" style={{ objectPosition: "center 12%" }} loading="lazy" /></div>
          <div className="max-w-lg text-right">
            <SectionLabel className="mb-6">مزون</SectionLabel>
            <h2 className="font-serif text-4xl leading-[1.2] font-light text-ivory sm:text-5xl">جایی که زیبایی به یک تجربه تبدیل می‌شود</h2>
            <p className="mt-8 text-sm leading-relaxed text-ivory-2 md:text-[15px]">لیندا یک سالن معمولی نیست؛ تئاتری آرام از نور، بافت و مراقبت است، جایی که هر مراجعه مثل یک سیتینگ خصوصی طراحی می‌شود.</p>
            <p className="mt-5 text-sm leading-relaxed text-ivory-2/90">این مزون را در قلب صادقیه شکل داده‌ایم؛ هنرمندانی را کنار هم آورده‌ایم که زیبایی را یک هنر می‌دانند. سیتینگ محدود، بدون عجله و بدون نمایش اضافه؛ جز خود شما.</p>
          </div>
        </div>
      </section>

      <ServicesBlock />
      <JourneyBlock />
    </>
  );
}

export function ServicesBlock() {
  const { openBooking } = useSalon();
  return (
    <section id="services" className="scroll-mt-24 bg-ink-2 py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-12">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 text-right md:flex-row md:items-end">
          <div><SectionLabel className="mb-5">آتلیه</SectionLabel><h2 className="font-serif text-4xl font-light text-ivory sm:text-6xl">خدمات</h2></div>
          <p className="max-w-sm text-sm leading-relaxed text-ivory-2/90">ده تخصص، با یک زبان مشترک؛ هر سیتینگ طراحی می‌شود و به سمت یک کاتالوگ شتاب نمی‌کند.</p>
        </div>
        <ul className="divide-y divide-white/8 border-y border-white/8">
          {CINEMATIC_SERVICES.map((s) => (
            <li key={s.id} className="group grid grid-cols-1 items-center gap-6 py-8 text-right md:grid-cols-12">
              <p className="text-[15px] tracking-[0.28em] text-champagne md:col-span-1">{s.index}</p>
              <div className="md:col-span-4"><h3 className="font-serif text-3xl text-ivory">{s.name}</h3><p className="mt-1 text-[15px] tracking-[0.28em] text-mist">{s.eyebrow}</p></div>
              <p className="text-sm leading-relaxed text-ivory-2/95 md:col-span-5">{s.description}</p>
              <div className="md:col-span-2 md:justify-self-end"><button type="button" data-cursor="رزرو" onClick={() => openBooking()} className="text-[16px] tracking-[0.28em] text-champagne transition-colors hover:text-ivory">رزرو</button></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function JourneyBlock() {
  return (
    <section id="ritual" className="scroll-mt-24 bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-12">
        <SectionLabel className="mb-5">مسیر</SectionLabel>
        <h2 className="mb-16 max-w-[16ch] font-serif text-4xl font-light text-ivory sm:text-6xl">از رزرو تا زیبایی</h2>
        <ol className="grid gap-10 md:grid-cols-5">
          {JOURNEY.map((step, i) => (
            <li key={step.id} className="relative text-right">
              {i < JOURNEY.length - 1 && <span className="absolute top-5 right-[28px] hidden h-px w-[calc(100%-12px)] bg-champagne/30 md:block" />}
              <p className="mb-4 font-sans text-[15px] tracking-[0.32em] text-champagne">{step.index}</p>
              <h3 className="font-serif text-2xl text-ivory">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory-2/95">{step.line}</p>
            </li>
          ))}
        </ol>
        <div className="relative mt-20 aspect-[16/8] overflow-hidden">
          <img src={IMAGES.hair} alt="پیش از سیتینگ" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 20%" }} loading="lazy" />
          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: "inset(0 42% 0 0)" }}><img src={IMAGES.hero} alt="پس از سیتینگ" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 18%" }} loading="lazy" /></div>
          <div className="absolute top-0 bottom-0 left-[58%] w-px bg-champagne" />
          <span className="absolute bottom-6 left-6 text-[16px] tracking-[0.3em] text-ivory">پیش از سیتینگ</span>
          <span className="absolute right-6 bottom-6 text-[16px] tracking-[0.3em] text-ivory">پس از سیتینگ</span>
        </div>
      </div>
    </section>
  );
}

export function AppointmentCta() {
  const { openBooking } = useSalon();
  return (
    <section className="relative overflow-hidden bg-ink-2">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-24 md:grid-cols-2 md:px-8 md:py-28 lg:px-12">
        <div className="relative mx-auto w-full max-w-md"><div className="rounded-[2rem] border border-white/10 bg-ink p-3 shadow-[0_40px_80px_rgba(0,0,0,0.45)]"><div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem]"><img src={IMAGES.hero} alt="پرتره‌ای از لیندا" className="h-full w-full object-cover" style={{ objectPosition: "center 18%" }} loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" /><p className="absolute right-5 bottom-5 font-serif text-xl text-ivory">لیندا</p></div></div></div>
        <div className="text-right"><SectionLabel className="mb-5">رزرو</SectionLabel><h2 className="font-serif text-4xl font-light text-ivory sm:text-6xl">فقط کافی است نوبت خود را انتخاب کنید</h2><p className="mt-6 max-w-md text-sm leading-relaxed text-ivory-2/95">خدمت، هنرمند و تاریخ را انتخاب کنید؛ باقی ماجرا پیش از رسیدن شما آماده است: نور، ابزارها و صندلی‌ای که از همین حالا نامتان را می‌داند.</p><GoldButton type="button" onClick={() => openBooking()} className="mt-10">رزرو نوبت</GoldButton></div>
      </div>
    </section>
  );
}

export function AboutSection() {
  const { openBooking } = useSalon();
  return (
    <section id="about" className="scroll-mt-24 bg-ink py-24 md:py-32">
      <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-5 md:grid-cols-2 md:px-8 lg:px-12">
        <div className="relative aspect-[4/5] overflow-hidden"><img src={IMAGES.interior} alt="فضای داخلی لیندا در شب" className="h-full w-full object-cover" loading="lazy" /></div>
        <div className="max-w-lg text-right"><SectionLabel className="mb-6">درباره ما</SectionLabel><h2 className="font-serif text-4xl font-light text-ivory sm:text-5xl">درباره لیندا</h2><p className="mt-8 text-sm leading-relaxed text-ivory-2/95">یک مزون، نه یک بازار شلوغ. روز را خلوت نگه می‌داریم تا کار بزرگ‌تر باشد؛ چند سیتینگ، چند هنرمند و یک آدرس در قلب صادقیه.</p><p className="mt-5 text-sm leading-relaxed text-ivory-2/90">مو مثل یک ترکیب‌بندی کوتاه می‌شود، رنگ مثل نور نقاشی می‌شود و میکاپ معماری چهره است. عروس، تئاتری خصوصی است؛ شما همان خودتان می‌روید، فقط شفاف‌تر.</p><GoldButton type="button" onClick={() => openBooking()} className="mt-10">اطلاعات بیشتر</GoldButton></div>
      </div>
      <div className="mx-auto mt-24 max-w-[1440px] px-5 md:px-8 lg:px-12"><SectionLabel className="mb-5">هنرمندان</SectionLabel><h3 className="mb-12 font-serif text-3xl text-ivory sm:text-4xl">چهار دست، یک زبان.</h3><ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{STYLISTS.map((s) => <li key={s.id} className="text-right"><div className="aspect-[3/4] overflow-hidden"><img src={s.image} alt={s.name} className="h-full w-full object-cover" loading="lazy" /></div><p className="mt-4 font-serif text-2xl text-ivory">{s.name}</p><p className="mt-1 text-[16px] tracking-[0.28em] text-champagne">{s.role}</p><p className="mt-3 text-sm leading-relaxed text-ivory-2/90">{s.bio}</p></li>)}</ul></div>
    </section>
  );
}

export function MobileBookBar() {
  const { openBooking, bookingOpen } = useSalon();
  return <div className={cn("fixed right-0 bottom-0 left-0 z-40 border-t border-white/10 bg-ink/90 p-3 backdrop-blur-md lg:hidden", bookingOpen && "hidden")}><GoldButton type="button" onClick={() => openBooking()} className="w-full">رزرو نوبت</GoldButton></div>;
}