import { useEffect, useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { useSalon } from "@/context/SalonContext";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import { GoldButton, GhostButton } from "@/components/primitives";
import { cn } from "@/utils/cn";
import { LOOKBOOK_FILTERS, MEDIA_TYPE_LABEL } from "@/constants/lookbookFilters";
import type { LookbookMediaType } from "@/types";

interface Props {
  initialCategory: string | null;
  initialType: LookbookMediaType | "";
  onBack: () => void;
}

export default function GalleryPage({ initialCategory, initialType, onBack }: Props) {
  const { lookbook, categories } = useData();
  const { setBooking, openBooking } = useSalon();
  const mainCats = useMemo(() => categories.filter((c) => !c.parentId && c.isActive).sort((a, b) => a.order - b.order), [categories]);

  const [catFilter, setCatFilter] = useState<string | null>(initialCategory);
  const [typeFilter, setTypeFilter] = useState<"" | LookbookMediaType>(initialType || "");
  const [activeId, setActiveId] = useState<string | null>(null);

  // همگام با ورودی اولیه وقتی مستقیم با hash وارد شد
  useEffect(() => {
    setCatFilter(initialCategory);
    setTypeFilter(initialType || "");
  }, [initialCategory, initialType]);

  // به‌روزرسانی هش برای ماندگاری فیلتر (بدون افزودن تاریخچه جدید)
  useEffect(() => {
    const params = new URLSearchParams();
    if (catFilter) params.set("cat", catFilter);
    if (typeFilter) params.set("type", typeFilter);
    const qs = params.toString();
    const newHash = qs ? `#gallery?${qs}` : "#gallery";
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, "", newHash);
    }
  }, [catFilter, typeFilter]);

  const visible = useMemo(() => {
    return lookbook
      .filter((x) => x.isActive)
      .filter((x) => !catFilter || x.categoryId === catFilter || categories.find((c) => c.id === x.subCategoryId)?.parentId === catFilter)
      .filter((x) => !typeFilter || x.mediaType === typeFilter)
      .sort((a, b) => a.order - b.order);
  }, [lookbook, catFilter, typeFilter, categories]);

  const active = activeId ? visible.find((x) => x.id === activeId) || null : null;

  // قفل اسکرول بدنه هنگام مودال
  useEffect(() => {
    if (active) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  return (
    <div className="min-h-screen bg-ink pt-[64px] sm:pt-[72px] lg:pt-[88px]">
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-12">
        {/* سرصفحه گالری — بدون دکمه (دکمه بازگشت زیر کارت‌ها داخل صفحه قرار دارد) */}
        <div className="flex items-center justify-between gap-3 text-xs text-mist">
          <span className="inline-flex items-center gap-2">
            <span>خانه</span>
            <span>›</span>
            <span className="font-bold text-ivory">گالری</span>
          </span>
          <span className="rounded-full bg-ink-2 px-3 py-1 text-xs text-mist">{visible.length} اثر</span>
        </div>

        <div className="mt-6 text-right">
          <h1 className="font-serif text-2xl font-light text-ivory sm:text-3xl lg:text-4xl">گالری آثار لیندا</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-7 text-ivory-2/80 sm:text-sm">
            با همین فیلترِ دسته از پیش‌نمایش وارد شده‌اید؛ می‌توانید نوع رسانه را تغییر دهید، دسته را عوض کنید، و با «بازگشت» دقیقاً به همان نقطه‌ی قبلی برگردید.
          </p>
        </div>

        {/* فیلتر نوع رسانه */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {LOOKBOOK_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTypeFilter(f.id as any)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-bold transition-colors sm:text-[11px]",
                typeFilter === f.id ? "border-champagne bg-champagne text-ink" : "border-white/10 bg-white/5 text-ivory hover:border-white/15"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* فیلتر دسته — اسکرول افقی */}
        <div className="relative mt-3 -mx-4 sm:mx-0">
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 sm:gap-2 sm:px-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <button type="button" onClick={() => setCatFilter(null)} className={cn("shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold", !catFilter ? "border-champagne bg-champagne text-ink" : "border-white/10 bg-white/5 text-ivory")}>همه دسته‌ها</button>
            {mainCats.map((c) => (
              <button key={c.id} type="button" onClick={() => setCatFilter(c.id)} className={cn("shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold", catFilter === c.id ? "border-champagne bg-champagne text-ink" : "border-white/10 bg-white/5 text-ivory")}>
                {c.nameFa}
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-l from-ink to-transparent sm:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-r from-ink to-transparent sm:hidden" />
        </div>

        {/* گرید */}
        {visible.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <p className="text-sm text-mist">با این فیلتر موردی یافت نشد.</p>
            <div className="mt-3 flex justify-center gap-2">
              <button type="button" onClick={() => { setCatFilter(null); setTypeFilter(""); }} className="rounded-full bg-white/5 px-4 py-2 text-xs text-ivory">پاک کردن فیلترها</button>
              <button type="button" onClick={onBack} className="rounded-full border border-white/10 px-4 py-2 text-xs text-ivory">بازگشت</button>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => {
              const cat = categories.find((c) => c.id === item.categoryId);
              const thumb = item.mediaType === "single" ? item.image : item.mediaType === "video" ? item.videoThumbnail : item.afterImage || item.beforeImage;
              return (
                <div key={item.id} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-2 transition-colors hover:border-white/15">
                  <button type="button" onClick={() => setActiveId(item.id)} className="relative aspect-[4/3] w-full overflow-hidden bg-ink-3 text-right">
                    {thumb ? <img src={thumb} alt={item.titleFa} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" /> : <div className="flex h-full items-center justify-center text-xs text-mist">بدون تصویر</div>}
                    <span className="absolute right-3 top-3 rounded-full bg-ink/75 px-2.5 py-1 text-[10px] font-bold text-ivory backdrop-blur">{MEDIA_TYPE_LABEL[item.mediaType]}</span>
                    {item.mediaType === "video" && <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow">▶</span></span>}
                    {item.featured && <span className="absolute left-3 top-3 rounded-full bg-champagne px-2.5 py-1 text-[10px] font-bold text-ink">ویژه</span>}
                  </button>
                  <div className="flex flex-1 flex-col p-4 text-right">
                    <h3 className="line-clamp-1 font-serif text-base font-bold text-ivory">{item.titleFa}</h3>
                    <p className="mt-1 line-clamp-1 text-xs tracking-[0.12em] text-champagne">{cat?.nameFa} {item.serviceName ? `· ${item.serviceName}` : ""}</p>
                    {item.description && <p className="mt-2 line-clamp-2 text-xs leading-6 text-ivory-2/75">{item.description}</p>}
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => setActiveId(item.id)} className="flex-1 rounded-full bg-white/5 py-2.5 text-xs font-bold text-ivory hover:bg-white/10">نمایش</button>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.serviceId) setBooking({ serviceId: item.serviceId });
                          openBooking();
                        }}
                        className="rounded-full border border-champagne/20 bg-champagne/10 px-4 py-2.5 text-xs font-bold text-champagne hover:bg-champagne hover:text-ink"
                      >
                        رزرو
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {visible.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-xs font-bold tracking-wide text-ivory transition-colors hover:border-white/25 hover:bg-white/10 active:scale-[0.98]"
            >
              <span aria-hidden>→</span>
              بازگشت به نمونه‌کارها
            </button>
          </div>
        )}

        {/* مودال جزئیات */}
        {active && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/80 backdrop-blur-sm p-0 sm:items-center sm:p-4" onClick={() => setActiveId(null)} role="dialog" aria-modal="true">
            <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-ink shadow-[0_24px_64px_rgba(0,0,0,0.5)] sm:max-h-[88vh] sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
                <div className="text-right">
                  <h3 className="font-serif text-base font-bold text-ivory sm:text-lg">{active.titleFa}</h3>
                  <p className="mt-1 text-xs tracking-[0.12em] text-champagne">{categories.find((c) => c.id === active.categoryId)?.nameFa} · {MEDIA_TYPE_LABEL[active.mediaType]} {active.serviceName ? `· ${active.serviceName}` : ""}</p>
                </div>
                <button type="button" onClick={() => setActiveId(null)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-ivory hover:bg-white/15">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="bg-ink-2">
                  {active.mediaType === "single" && active.image && <img src={active.image} alt={active.titleFa} className="max-h-[52vh] w-full object-contain bg-black sm:max-h-[56vh]" />}
                  {active.mediaType === "beforeAfter" && active.beforeImage && active.afterImage && <BeforeAfterSlider before={active.beforeImage} after={active.afterImage} className="aspect-[4/3] sm:aspect-[16/10]" />}
                  {active.mediaType === "video" && active.videoUrl && <video src={active.videoUrl} poster={active.videoThumbnail} controls playsInline className="max-h-[52vh] w-full bg-black object-contain sm:max-h-[56vh]" />}
                </div>

                <div className="p-4 text-right sm:p-5">
                  {active.description && <p className="text-[13px] leading-7 text-ivory-2/90">{active.description}</p>}
                  {active.mediaType === "beforeAfter" && active.beforeImage && active.afterImage && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/10 bg-ink-2 p-2">
                        <p className="text-xs font-bold text-mist">قبل</p>
                        <img src={active.beforeImage} alt="قبل" className="mt-2 aspect-[4/3] w-full rounded-lg object-cover" />
                      </div>
                      <div className="rounded-xl border border-white/10 bg-ink-2 p-2">
                        <p className="text-xs font-bold text-mist">بعد</p>
                        <img src={active.afterImage} alt="بعد" className="mt-2 aspect-[4/3] w-full rounded-lg object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-white/10 p-4 sm:flex-row sm:justify-between">
                <div className="flex gap-2">
                  <GoldButton type="button" onClick={() => { if (active.serviceId) setBooking({ serviceId: active.serviceId }); openBooking(); }} className="flex-1 justify-center py-3 text-xs sm:flex-none">رزرو این خدمت</GoldButton>
                  <GhostButton type="button" onClick={() => setActiveId(null)} className="flex-1 justify-center rounded-full border border-white/10 py-3 text-xs sm:flex-none">بستن</GhostButton>
                </div>
                <button type="button" onClick={onBack} className="rounded-full bg-white/5 px-5 py-3 text-xs font-bold text-ivory hover:bg-white/10">بازگشت به نمونه‌کارها ←</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
