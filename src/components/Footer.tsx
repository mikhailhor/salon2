import { useSalon } from "@/context/SalonContext";
import { useData } from "@/context/DataContext";
import { GoldButton, IconChat, Logo } from "@/components/primitives";
export default function Footer() {
  const { openBooking, navigateTo } = useSalon();
  const { settings } = useData();
  return (
    <footer className="render-defer relative border-t border-white/8 bg-ink">
      <div className="gold-line absolute top-0 right-0 left-0" />
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 sm:gap-10 sm:px-5 sm:py-16 md:grid-cols-2 md:px-8 md:py-20 lg:grid-cols-4 lg:px-12 lg:py-24">
        <div className="flex flex-col gap-4 sm:gap-6">
          <Logo onClick={() => navigateTo("home")} withText={false} markClassName="h-12 w-auto sm:h-14 md:h-16 lg:h-20" />
          <p className="max-w-xs text-[13px] leading-7 text-ivory-2/95 sm:text-sm">
            {settings.brandName}؛ مزونی خصوصی برای مو، رنگ، پوست و میکاپ در تهران، هر سیتینگ فقط با تعیین وقت قبلی.
          </p>
          <div className="flex flex-wrap gap-2">
            {settings.socialLinks.map((s) => (
              <a key={s.platform} href={s.url} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-champagne transition-colors hover:bg-white/5 hover:text-ivory">{s.platform}</a>
            ))}
          </div>
          <a href={`https://wa.me/${settings.whatsapp}`} className="inline-flex w-fit items-center gap-2 rounded-full border border-champagne/20 bg-champagne/10 px-4 py-2 text-xs font-bold tracking-[0.12em] text-champagne transition-colors hover:bg-champagne/15" target="_blank" rel="noreferrer">
            <IconChat className="h-4 w-4" /> واتساپ: {settings.whatsappDisplay}
          </a>
        </div>
        <div className="rounded-2xl border border-white/5 bg-ink-2 p-5 sm:bg-transparent sm:p-0 sm:border-0">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-champagne uppercase sm:mb-5 sm:text-[13px]">آدرس</p>
          <p className="text-[13px] leading-7 text-ivory-2 sm:text-sm">{settings.location}</p>
          <a href={`https://www.google.com/maps/search/${encodeURIComponent(settings.mapsQuery)}`} className="mt-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-champagne transition-colors hover:text-ivory sm:text-[13px]" target="_blank" rel="noreferrer">نمایش در نقشه <span>→</span></a>
        </div>
        <div className="rounded-2xl border border-white/5 bg-ink-2 p-5 sm:bg-transparent sm:p-0 sm:border-0">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-champagne uppercase sm:mb-5 sm:text-[13px]">رزرو وقت و مشاوره</p>
          <ul className="space-y-3">
            {settings.phones.map((p) => (
              <li key={p.value} className="flex items-center justify-between gap-3 rounded-xl bg-ink-3 px-3 py-2.5 sm:bg-transparent sm:px-0 sm:py-0">
                <span className="text-xs text-mist sm:text-sm">{p.label}</span>
                <a href={p.wa ? `https://wa.me/${p.wa}` : `tel:${p.tel}`} className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-ivory transition-colors hover:bg-white/10 sm:bg-transparent sm:px-0 sm:py-0 sm:text-sm sm:text-ivory-2 hover:text-champagne" dir="ltr">{p.value}</a>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-white/5 px-3 py-2 text-xs leading-5 text-mist sm:bg-transparent sm:px-0 sm:py-0">{settings.workingHoursNote}</p>
        </div>
        <div className="rounded-2xl border border-champagne/15 bg-champagne/[0.06] p-5 sm:border-white/5 sm:bg-ink-2 sm:p-6">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-champagne uppercase sm:mb-5 sm:text-[13px]">نوبت بعدی شما</p>
          <p className="mb-4 text-[13px] leading-7 text-ivory-2/90 sm:mb-5 sm:text-sm">هر رزرو خصوصی است؛ فقط با تعیین وقت قبلی و با هماهنگی مستقیم با تیم {settings.brandName}.</p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <GoldButton type="button" onClick={() => openBooking()} className="w-full justify-center py-3 text-sm sm:w-auto">رزرو نوبت</GoldButton>
            <a href={`https://wa.me/${settings.whatsapp}`} className="inline-flex w-full items-center justify-center rounded-full border border-champagne/30 px-6 py-3 text-xs font-bold tracking-[0.15em] text-ivory transition-colors hover:bg-champagne/10 sm:w-auto" target="_blank" rel="noreferrer">واتساپ</a>
          </div>
          <p className="mt-4 text-xs leading-6 text-ivory-2/70">{settings.locationShort}</p>
        </div>
      </div>
      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-5 text-xs tracking-wide text-mist sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-6 sm:text-sm md:px-8 lg:px-12">
          <p>© {new Date().getFullYear()} {settings.brandShort}. تمامی حقوق محفوظ است.</p>
          <p className="flex items-center gap-2 text-xs tracking-[0.15em]"><span className="h-px w-4 bg-mist/50 sm:w-6" />{settings.city} · فقط با تعیین وقت</p>
        </div>
      </div>
    </footer>
  );
}
