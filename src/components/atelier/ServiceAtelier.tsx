import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { useSalon } from "@/context/SalonContext";
import { SectionLabel } from "@/components/primitives";
import { formatToman, formatDuration } from "@/lib/format";
import { cn } from "@/utils/cn";

export default function ServiceAtelier() {
  const { categories, services, getServicesByCategory } = useData();
  const { openBooking } = useSalon();
  const [activeCat, setActiveCat] = useState<string | null>(null);

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
    // if has subcategories, show services of main + subs? We'll show all under main
    const svc = services.filter((s) => s.categoryId === activeCat || s.subCategoryId && categories.find((c) => c.id === s.subCategoryId)?.parentId === activeCat).filter((s) => s.isActive);
    return svc.sort((a, b) => a.order - b.order);
  }, [activeCat, services, categories]);

  return (
    <section id="services" className="render-defer scroll-mt-28 bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-12">
        <div className="mb-10 flex flex-col gap-6 text-right md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel className="mb-4">آتلیه خدمات</SectionLabel>
            <h2 className="font-serif text-4xl font-light text-ivory sm:text-6xl">خدمات تخصصی</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory-2/90">
              ده آتلیه تخصصی با استاندارد بین‌المللی؛ هر خدمت با مشاوره اختصاصی، مواد اورجینال و گارانتی بازگشت.
            </p>
          </div>
          <p className="text-xs tracking-[0.2em] text-mist">۱۰ دسته · {services.filter((s) => s.isActive).length} خدمت فعال</p>
        </div>

        {/* Category cards - luxury atelier feel */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {mainCategories.map((cat) => {
            const count = services.filter((s) => s.categoryId === cat.id || categories.find((sc) => sc.id === s.subCategoryId)?.parentId === cat.id).length;
            const isActive = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCat(isActive ? null : cat.id)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border text-right transition-all duration-500",
                  isActive ? "border-champagne bg-champagne/10" : "border-white/10 bg-ink-2 hover:border-white/20 hover:bg-ink-3"
                )}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.nameFa}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                </div>
                <div className="relative p-4">
                  <p className="font-serif text-lg leading-none text-ivory">{cat.nameFa}</p>
                  <p className="mt-1 text-[11px] tracking-[0.2em] text-champagne uppercase">{cat.nameEn}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ivory-2/80">{cat.descriptionFa}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] tracking-wide text-mist">{count} خدمت</span>
                    <span className={cn("rounded-full px-3 py-1 text-[11px] tracking-[0.2em] transition-colors", isActive ? "bg-champagne text-ink" : "bg-white/5 text-ivory group-hover:bg-white/10")}>
                      {isActive ? "بستن" : "مشاهده"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active category detail */}
        {activeCategory && (
          <div className="mt-10 animate-[fade-up_0.5s_ease]">
            <div className="rounded-2xl border border-white/10 bg-ink-2 p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4">
                  <img src={activeCategory.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-serif text-2xl text-ivory">{activeCategory.nameFa}</h3>
                    <p className="text-xs tracking-[0.2em] text-champagne uppercase">{activeCategory.nameEn}</p>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-ivory-2/90">{activeCategory.descriptionFa}</p>
                    {subCategories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {subCategories.map((sub) => (
                          <span key={sub.id} className="rounded-full border border-champagne/20 bg-champagne/10 px-3 py-1 text-xs text-champagne">
                            {sub.nameFa}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCat(null)}
                  className="text-xs tracking-[0.2em] text-mist hover:text-ivory"
                >
                  ✕ بستن
                </button>
              </div>

              {/* Services list for this category */}
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedServices.length === 0 ? (
                  <p className="col-span-full py-8 text-center text-sm text-mist">خدمتی در این دسته ثبت نشده است.</p>
                ) : (
                  displayedServices.map((svc) => (
                    <div key={svc.id} className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-ink p-4 transition-colors hover:border-champagne/30">
                      <div className="flex gap-3">
                        <img src={svc.image} alt={svc.nameFa} className="h-16 w-16 rounded-lg object-cover" loading="lazy" />
                        <div className="flex-1">
                          <h4 className="font-serif text-lg text-ivory">{svc.nameFa}</h4>
                          <p className="text-[11px] tracking-[0.18em] text-mist uppercase">{svc.nameEn}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ivory-2/80">{svc.description}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                        <div>
                          <p className="text-xs text-champagne">{formatDuration(svc.durationMinutes)}</p>
                          <p className="text-sm font-bold text-ivory">{formatToman(svc.price)}{svc.priceMax ? ` – ${formatToman(svc.priceMax)}` : ""}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openBooking(svc.id)}
                          className="rounded-full bg-champagne px-4 py-2 text-xs font-bold tracking-[0.15em] text-ink transition-colors hover:bg-champagne-2"
                        >
                          رزرو
                        </button>
                      </div>
                      {!svc.bookingEnabled && <p className="mt-2 text-[11px] text-amber-300">رزرو آنلاین غیرفعال</p>}
                      {svc.depositEnabled && <p className="mt-1 text-[11px] text-mist">بیعانه: {svc.depositType === "percent" ? `${svc.depositValue}%` : formatToman(svc.depositValue)}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {!activeCat && (
          <div className="mt-8 rounded-xl border border-dashed border-white/10 p-6 text-center">
            <p className="text-sm text-ivory-2/80">یک دسته را انتخاب کنید تا خدمات آن را ببینید. یا از طریق دکمه «رزرو» در هدر، مستقیماً خدمت موردنظر را جستجو کنید.</p>
          </div>
        )}
      </div>
    </section>
  );
}
