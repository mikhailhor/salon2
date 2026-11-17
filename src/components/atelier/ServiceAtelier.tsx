import { useMemo, useState, useRef } from "react";
import { useData } from "@/context/DataContext";
import { useSalon } from "@/context/SalonContext";
import { SectionLabel } from "@/components/primitives";
import { formatToman, formatDuration } from "@/lib/format";
import { cn } from "@/utils/cn";

export default function ServiceAtelier() {
  const { categories, services } = useData();
  const { openBooking } = useSalon();
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const mainCategories = useMemo(
    () => categories.filter((c) => !c.parentId && c.isActive).sort((a, b) => a.order - b.order),
    [categories]
  );

  const activeCategory = activeCat ? categories.find((c) => c.id === activeCat) : null;
  const subCategories = useMemo(
    () => (activeCat ? categories.filter((c) => c.parentId === activeCat && c.isActive) : []),
    [categories, activeCat]
  );

  const displayedServices = useMemo(() => {
    if (!activeCat) return [];
    const svc = services.filter((s) => s.categoryId === activeCat || (s.subCategoryId && categories.find((c) => c.id === s.subCategoryId)?.parentId === activeCat)).filter((s) => s.isActive);
    return svc.sort((a, b) => a.order - b.order);
  }, [activeCat, services, categories]);

  const handleSelect = (catId: string) => {
    const isActive = activeCat === catId;
    setActiveCat(isActive ? null : catId);
    if (!isActive) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  };

  return (
    <section id="services" className="render-defer scroll-mt-20 bg-ink py-12 sm:py-20 md:py-28 lg:scroll-mt-40">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-5 md:px-8 lg:px-12">
        <div className="mb-6 flex flex-col gap-4 text-right sm:mb-10 sm:gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel className="mb-3 text-[11px] sm:mb-4 sm:text-[13px]">آتلیه خدمات</SectionLabel>
            <h2 className="font-serif text-[1.7rem] font-light leading-[1.1] text-ivory sm:text-4xl lg:text-6xl">خدمات تخصصی</h2>
            <p className="mt-3 max-w-xl text-[13px] leading-7 text-ivory-2/90 sm:mt-4 sm:text-sm sm:leading-relaxed">
              ده آتلیه تخصصی با استاندارد بین‌المللی؛ هر خدمت با مشاوره اختصاصی، مواد اورجینال و گارانتی بازگشت.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="hidden text-xs tracking-[0.15em] text-mist sm:inline">۱۰ دسته · {services.filter((s) => s.isActive).length} خدمت فعال</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-ivory sm:hidden">{services.filter((s) => s.isActive).length} خدمت</span>
          </div>
        </div>

        {/* کارت‌ها — روی موبایل ۱ ستون، بعد ۲، ۳، ۵ */}
        <div className="grid grid-cols-1 gap-3 grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {mainCategories.map((cat) => {
            const count = services.filter((s) => s.categoryId === cat.id || categories.find((sc) => sc.id === s.subCategoryId)?.parentId === cat.id).length;
            const isActive = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat.id)}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-2xl border text-right transition-all duration-500",
                  "min-h-[220px] sm:min-h-[280px]",
                  isActive ? "border-champagne bg-champagne/10 shadow-[0_8px_24px_rgba(198,165,106,0.15)]" : "border-white/10 bg-ink-2 hover:border-white/20 hover:bg-ink-3 active:scale-[0.98]"
                )}
              >
                <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[4/3]">
                  <img
                    src={cat.image}
                    alt={cat.nameFa}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                  <div className="absolute top-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] font-bold tracking-[0.15em] text-ivory backdrop-blur-sm sm:text-[11px]">{count} خدمت</div>
                  {isActive && <div className="absolute inset-0 ring-2 ring-champagne/50 ring-inset" />}
                </div>
                <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                  <p className="font-serif text-[1.1rem] leading-none text-ivory sm:text-lg">{cat.nameFa}</p>
                  <p className="mt-1 text-[10px] tracking-[0.18em] text-champagne uppercase sm:text-[11px]">{cat.nameEn}</p>
                  <p className="mt-2 line-clamp-2 flex-1 text-xs leading-6 text-ivory-2/80 sm:leading-relaxed">{cat.descriptionFa}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-mist sm:hidden">{isActive ? "بستن جزئیات" : "مشاهده + رزرو"}</span>
                    <span className={cn("rounded-full px-3 py-1.5 text-xs font-bold tracking-[0.12em] transition-colors sm:px-3 sm:py-1 sm:text-[11px]", isActive ? "bg-champagne text-ink" : "bg-white/5 text-ivory group-hover:bg-white/10")}>
                      {isActive ? "✕ بستن" : "مشاهده"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* جزئیات دسته فعال — ریسپانسیو کامل */}
        {activeCategory && (
          <div ref={detailRef} className="mt-6 scroll-mt-24 animate-[fade-up_0.5s_ease] sm:mt-10">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-2 sm:rounded-3xl">
              <div className="relative h-32 overflow-hidden sm:h-40">
                <img src={activeCategory.image} alt={activeCategory.nameFa} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-6 md:p-8">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="hidden h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 sm:block sm:h-20 sm:w-20">
                      <img src={activeCategory.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-ivory sm:text-2xl">{activeCategory.nameFa}</h3>
                      <p className="text-xs tracking-[0.15em] text-champagne uppercase">{activeCategory.nameEn}</p>
                      <p className="mt-1 hidden max-w-lg text-xs leading-relaxed text-ivory-2/90 sm:block sm:text-sm">{activeCategory.descriptionFa}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveCat(null)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-ink/60 text-ivory backdrop-blur-sm transition-colors hover:bg-white/10 sm:h-10 sm:w-10"
                    aria-label="بستن"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 md:p-8">
                <p className="text-xs leading-6 text-ivory-2/90 sm:hidden">{activeCategory.descriptionFa}</p>
                {subCategories.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {subCategories.map((sub) => (
                      <span key={sub.id} className="rounded-full border border-champagne/20 bg-champagne/10 px-3 py-1.5 text-xs font-medium text-champagne">
                        {sub.nameFa}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {displayedServices.length === 0 ? (
                    <p className="col-span-full rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-mist">خدمتی در این دسته ثبت نشده است.</p>
                  ) : (
                    displayedServices.map((svc) => (
                      <div key={svc.id} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink transition-all hover:border-champagne/20 hover:bg-ink-3">
                        <div className="flex gap-3 p-4">
                          <img src={svc.image} alt={svc.nameFa} className="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16" loading="lazy" />
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate font-serif text-base text-ivory sm:text-lg">{svc.nameFa}</h4>
                            <p className="truncate text-[10px] tracking-[0.15em] text-mist uppercase sm:text-[11px]">{svc.nameEn}</p>
                            <p className="mt-1 line-clamp-2 text-xs leading-6 text-ivory-2/80">{svc.description}</p>
                          </div>
                        </div>
                        <div className="mt-auto flex items-center justify-between border-t border-white/5 bg-ink-2/50 px-4 py-3">
                          <div>
                            <p className="text-xs text-champagne">{formatDuration(svc.durationMinutes)}</p>
                            <p className="text-sm font-bold text-ivory">{formatToman(svc.price)}{svc.priceMax ? ` – ${formatToman(svc.priceMax)}` : ""}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openBooking(svc.id)}
                            className="min-h-[40px] rounded-full bg-champagne px-5 py-2 text-xs font-bold tracking-[0.12em] text-ink transition-all hover:bg-champagne-2 active:scale-95"
                          >
                            رزرو
                          </button>
                        </div>
                        {!svc.bookingEnabled && <p className="bg-amber-500/10 px-4 py-1.5 text-center text-[11px] text-amber-300">رزرو آنلاین غیرفعال — تماس بگیرید</p>}
                        {svc.depositEnabled && <p className="px-4 pb-2 text-center text-[11px] text-mist">بیعانه: {svc.depositType === "percent" ? `${svc.depositValue}%` : formatToman(svc.depositValue)}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!activeCat && (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-ink-2/50 p-5 text-center sm:mt-8 sm:p-6">
            <p className="text-[13px] leading-7 text-ivory-2/80 sm:text-sm">👆 یک دسته را انتخاب کنید تا خدمات آن را ببینید. یا از طریق دکمه «رزرو» در هدر، مستقیماً خدمت موردنظر را جستجو کنید.</p>
          </div>
        )}
      </div>
    </section>
  );
}
