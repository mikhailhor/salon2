import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { SectionLabel } from "@/components/primitives";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import { cn } from "@/utils/cn";

export default function NewLookbook() {
  const { lookbook, categories } = useData();
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const mainCats = useMemo(() => categories.filter((c) => !c.parentId && c.isActive).sort((a, b) => a.order - b.order), [categories]);

  const filtered = useMemo(() => {
    let items = lookbook.filter((l) => l.isActive);
    if (filter !== "all") {
      items = items.filter((l) => {
        if (l.categoryId === filter) return true;
        const sub = categories.find((c) => c.id === l.subCategoryId);
        if (sub?.parentId === filter) return true;
        return false;
      });
    }
    return items.sort((a, b) => a.order - b.order);
  }, [lookbook, filter, categories]);

  const selectedItem = selected ? filtered.find((l) => l.id === selected) : null;

  return (
    <section id="portfolio" className="render-defer scroll-mt-20 bg-ink-2 py-12 sm:py-20 md:py-28 lg:scroll-mt-40">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-5 md:px-8 lg:px-12">
        <div className="mb-6 flex flex-col gap-5 text-right sm:mb-8 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel className="mb-3 text-[11px] sm:mb-4 sm:text-[13px]">لُک‌بوک</SectionLabel>
            <h2 className="font-serif text-[1.7rem] font-light leading-[1.1] text-ivory sm:text-4xl lg:text-6xl">نمونه‌کارها</h2>
            <p className="mt-3 max-w-xl text-[13px] leading-7 text-ivory-2/90 sm:mt-4 sm:text-sm sm:leading-relaxed">
              مقایسه تعاملی قبل و بعد؛ اسلایدر را بکشید تا تغییر را ببینید. تمام تصاویر از مراجعین واقعی لیندا با رضایت ثبت شده‌اند.
            </p>
          </div>
          <p className="hidden text-xs tracking-[0.15em] text-mist sm:block">{filtered.length} نمونه‌کار</p>
        </div>

        {/* فیلتر اسکرول افقی روی موبایل — حرفه‌ای و تمیز */}
        <div className="relative -mx-4 sm:mx-0">
          <div className="flex gap-2 overflow-x-auto scroll-smooth px-4 pb-3 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn("whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-bold tracking-[0.12em] transition-all sm:px-4 sm:py-2", filter === "all" ? "bg-champagne text-ink shadow-[0_4px_12px_rgba(198,165,106,0.25)]" : "border border-white/10 bg-white/5 text-ivory hover:bg-white/10 active:scale-95")}
            >
              همه <span className="opacity-60">({lookbook.filter((l) => l.isActive).length})</span>
            </button>
            {mainCats.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id)}
                className={cn("whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-bold tracking-[0.12em] transition-all sm:px-4 sm:py-2", filter === cat.id ? "bg-champagne text-ink shadow-[0_4px_12px_rgba(198,165,106,0.25)]" : "border border-white/10 bg-white/5 text-ivory hover:bg-white/10 active:scale-95")}
              >
                {cat.nameFa}
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-l from-ink-2 to-transparent sm:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-r from-ink-2 to-transparent sm:hidden" />
        </div>

        <div className="mt-6 grid gap-4 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const cat = categories.find((c) => c.id === item.categoryId);
            return (
              <div key={item.id} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink transition-all hover:border-white/15 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
                <div className="relative overflow-hidden">
                  {item.mediaType === "video" ? (
                    item.videoUrl ? <video src={item.videoUrl} poster={item.videoThumbnail} controls className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3] bg-ink-2" />
                  ) : item.mediaType === "single" ? (
                    item.image ? <img src={item.image} alt={item.titleFa} className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3] bg-ink-2" />
                  ) : (
                    <BeforeAfterSlider before={item.beforeImage || ""} after={item.afterImage || ""} className="aspect-[4/3] sm:aspect-[4/3]" />
                  )}
                  {item.featured && <span className="absolute top-3 right-3 rounded-full bg-champagne px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-ink shadow-lg">ویژه</span>}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100 sm:hidden">
                    <p className="text-center text-xs text-ivory">👆 بکشید تا مقایسه کنید</p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4 text-right">
                  <h3 className="font-serif text-base leading-tight text-ivory sm:text-lg">{item.titleFa}</h3>
                  <p className="mt-1 text-xs tracking-[0.12em] text-champagne">{cat?.nameFa} {item.serviceName ? `· ${item.serviceName}` : ""}</p>
                  {item.description && <p className="mt-2 line-clamp-2 flex-1 text-xs leading-6 text-ivory-2/80">{item.description}</p>}
                  <button
                    type="button"
                    onClick={() => setSelected(item.id)}
                    className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-champagne/30 bg-champagne/10 py-2.5 text-xs font-bold tracking-[0.15em] text-champagne transition-all hover:bg-champagne hover:text-ink active:scale-[0.98]"
                  >
                    مشاهده جزئیات
                    <span className="text-base">→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-white/10 py-12 text-center">
            <p className="text-sm text-mist">نمونه‌کاری در این دسته یافت نشد.</p>
            <button onClick={() => setFilter("all")} className="mt-3 text-xs text-champagne hover:text-ivory">نمایش همه →</button>
          </div>
        )}
      </div>

      {/* مودال جزئیات — فول‌اسکرین روی موبایل */}
      {selectedItem && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/90 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setSelected(null)}>
          <div className="relative flex max-h-[92vh] max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[1.5rem] border border-white/10 bg-ink sm:max-h-[90vh] sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
              <div>
                <h3 className="font-serif text-lg text-ivory sm:text-2xl">{selectedItem.titleFa}</h3>
                <p className="mt-1 text-xs tracking-[0.12em] text-champagne">{categories.find((c) => c.id === selectedItem.categoryId)?.nameFa}{selectedItem.serviceName ? ` · ${selectedItem.serviceName}` : ""}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-ivory transition-colors hover:bg-white/15 sm:h-10 sm:w-10">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
              <div className="overflow-hidden rounded-xl">
                {selectedItem.mediaType === "video" ? (
                  selectedItem.videoUrl ? <video src={selectedItem.videoUrl} poster={selectedItem.videoThumbnail} controls className="aspect-[4/3] w-full object-contain bg-black sm:aspect-[16/10]" /> : null
                ) : selectedItem.mediaType === "single" ? (
                  selectedItem.image ? <img src={selectedItem.image} alt={selectedItem.titleFa} className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]" /> : null
                ) : (
                  <BeforeAfterSlider before={selectedItem.beforeImage || ""} after={selectedItem.afterImage || ""} className="aspect-[4/3] sm:aspect-[16/10]" />
                )}
              </div>
              {selectedItem.description && <p className="mt-4 text-[13px] leading-7 text-ivory-2/90 sm:text-sm sm:leading-relaxed">{selectedItem.description}</p>}
              {selectedItem.mediaType === "beforeAfter" && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-ink-2 p-3">
                    <p className="text-xs font-bold tracking-[0.12em] text-mist">تصویر قبل</p>
                    <img src={selectedItem.beforeImage} alt="قبل" className="mt-2 aspect-[4/3] w-full rounded-lg object-cover" />
                  </div>
                  <div className="rounded-xl border border-white/10 bg-ink-2 p-3">
                    <p className="text-xs font-bold tracking-[0.12em] text-mist">تصویر بعد</p>
                    <img src={selectedItem.afterImage} alt="بعد" className="mt-2 aspect-[4/3] w-full rounded-lg object-cover" />
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-white/10 p-4 sm:p-6">
              <button onClick={() => setSelected(null)} className="w-full rounded-full bg-champagne py-3.5 text-sm font-bold tracking-[0.15em] text-ink">بستن</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
