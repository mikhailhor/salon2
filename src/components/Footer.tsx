import { BRAND } from "@/data/salon";
import { useSalon } from "@/context/SalonContext";
import { GoldButton, IconChat, Logo } from "@/components/primitives";
export default function Footer() {
  const { openBooking, navigateTo } = useSalon();

  return (
    <footer className="relative border-t border-white/8 bg-ink">
      <div className="gold-line absolute top-0 right-0 left-0" />
      <div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-20 md:grid-cols-2 md:px-8 lg:grid-cols-4 lg:px-12 lg:py-24">
        <div className="flex flex-col gap-6">
          <Logo onClick={() => navigateTo("home")} withText={false} markClassName="h-16 w-auto md:h-20" />
          <p className="max-w-xs text-sm leading-7 text-ivory-2/95">
            {BRAND.name}؛ مزونی خصوصی برای مو، رنگ، پوست و میکاپ در تهران،
            هر سیتینگ فقط با تعیین وقت قبلی.
          </p>
          <a
            href={`https://wa.me/${BRAND.whatsapp}`}
            data-cursor="کاوش"
            className="inline-flex w-fit items-center gap-2 text-[15px] tracking-[0.18em] text-champagne"
            target="_blank"
            rel="noreferrer"
          >
            <IconChat className="h-4 w-4" />
            واتساپ: {BRAND.whatsappDisplay}
          </a>
        </div>

        <div>
          <p className="mb-5 text-[16px] tracking-[0.32em] text-champagne uppercase">
            آدرس
          </p>
          <p className="text-sm leading-7 text-ivory-2">{BRAND.location}</p>
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(BRAND.mapsQuery)}`}
            data-cursor="کاوش"
            className="mt-4 inline-block text-[16px] tracking-[0.24em] text-champagne uppercase transition-colors hover:text-ivory"
            target="_blank"
            rel="noreferrer"
          >
            نمایش در نقشه
          </a>
        </div>

        <div>
          <p className="mb-5 text-[16px] tracking-[0.32em] text-champagne uppercase">
            رزرو وقت و مشاوره
          </p>
          <ul className="space-y-3 text-sm text-ivory-2">
            {BRAND.phones.map((p) => (
              <li key={p.value} className="flex items-baseline justify-between gap-6">
                <span className="text-mist">{p.label}</span>
                <a
                  href={p.wa ? `https://wa.me/${p.wa}` : `tel:${p.tel}`}
                  className="text-ivory-2 transition-colors hover:text-champagne"
                  dir="ltr"
                >
                  {p.value}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-5 text-[16px] tracking-[0.32em] text-champagne uppercase">
            نوبت بعدی شما
          </p>
          <p className="mb-5 max-w-xs text-sm leading-relaxed text-ivory-2/95">
            هر رزرو خصوصی است؛ فقط با تعیین وقت قبلی و با هماهنگی مستقیم با تیم
            لیندا جعفرپناه.
          </p>
          <div className="flex flex-wrap gap-3">
            <GoldButton type="button" onClick={() => openBooking()}>
              رزرو نوبت
            </GoldButton>
            <a
              href={`https://wa.me/${BRAND.whatsapp}`}
              data-cursor="کاوش"
              className="inline-flex items-center justify-center border border-champagne/40 px-8 py-3.5 font-sans text-[16px] font-bold uppercase tracking-[0.24em] text-ivory transition-colors duration-500 hover:border-champagne hover:bg-champagne/10"
              target="_blank"
              rel="noreferrer"
            >
              واتساپ
            </a>
          </div>
          <p className="mt-6 max-w-xs text-sm leading-7 text-ivory-2/90">
            {BRAND.locationShort}
          </p>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-3 px-5 py-6 text-[15px] tracking-wide text-mist md:flex-row md:items-center md:px-8 lg:px-12">
          <p>© {new Date().getFullYear()} لیندا. تمامی حقوق محفوظ است.</p>
          <p className="tracking-[0.22em]">تهران · فقط با تعیین وقت</p>
        </div>
      </div>
    </footer>
  );
}
