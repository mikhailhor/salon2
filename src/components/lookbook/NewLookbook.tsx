import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { SectionLabel } from "@/components/primitives";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import { cn } from "@/utils/cn";
import { formatToman } from "@/lib/format";

export default function NewLookbook() {
  const { lookbook, categories, services } = useData();
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const mainCats = useMemo(() => categories.filter((c) => !c.parentId && c.isActive).sort((a, b) => a.order - b.order), [categories]);

  const filtered = useMemo(() => {
    let items = lookbook.filter((l) => l.isActive);
    if (filter !== "all") {
      items = items.filter((l) => {
        if (l.categoryId === filter) return true;
        // include if category's sub belongs to filter
        const sub = categories.find((c) => c.id === l.subCategoryId);
        if (sub?.parentId === filter) return true;
        return false;
      });
    }
    return items.sort((a, b) => a.order - b.order);
  }, [lookbook, filter, categories]);

  const selectedItem = selected ? filtered.find((l) => l.id === selected) : null;

  return (
    <section id="portfolio" className="render-defer scroll-mt-28 bg-ink-2 py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-12">
        <div className="mb-8 flex flex-col gap-6 text-right md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel className="mb-4">لُک‌بوک</SectionLabel>
            <h2 className="font-serif text-4xl font-light text-ivory sm:text-6xl">نمونه‌کارها</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory-2/90">
              مقایسه تعاملی قبل و بعد؛ اسلایدر را بکشید تا تغییر را ببینید. تمام تصاویر از مراجعین واقعی لیندا با رضایت ثبت شده‌اند.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn("rounded-full px-4 py-2 text-xs tracking-[0.15em] transition-colors", filter === "all" ? "bg-champagne text-ink font-bold" : "border border-white/10 bg-white/5 text-ivory hover:bg-white/10")}
            >
              همه ({lookbook.filter((l) => l.isActive).length})
            </button>
            {mainCats.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id)}
                className={cn("rounded-full px-4 py-2 text-xs tracking-[0.15em] transition-colors", filter === cat.id ? "bg-champagne text-ink font-bold" : "border border-white/10 bg-white/5 text-ivory hover:bg-white/10")}
              >
                {cat.nameFa}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const cat = categories.find((c) => c.id === item.categoryId);
            return (
              <div key={item.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-ink">
                <div className="relative">
                  <BeforeAfterSlider before={item.beforeImage} after={item.afterImage} className="aspect-[4/3]" />
                  {item.featured && <span className="absolute top-3 right-3 rounded-full bg-champagne px-3 py-1 text-[10px] font-bold tracking-[0.15em] text-ink">ویژه</span>}
                </div>
                <div className="p-4 text-right">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-lg text-ivory">{item.titleFa}</h3>
                      <p className="mt-1 text-xs tracking-[0.15em] text-champagne">{cat?.nameFa} {item.serviceName ? `· ${item.serviceName}` : ""}</p>
                      {item.description && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ivory-2/80">{item.description}</p>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(item.id)}
                    className="mt-4 w-full rounded-full border border-champagne/30 bg-champagne/10 py-2.5 text-xs font-bold tracking-[0.2em] text-champagne transition-colors hover:bg-champagne hover:text-ink"
                  >
                    مشاهده جزئیات
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-sm text-mist">نمونه‌کاری در این دسته یافت نشد.</p>
        )}
      </div>

      {/* Detail modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-ink p-4 md:p-6" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setSelected(null)} className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-ivory">✕</button>
            <h3 className="font-serif text-2xl text-ivory">{selectedItem.titleFa}</h3>
            <p className="mt-1 text-xs tracking-[0.15em] text-champagne">{categories.find((c) => c.id === selectedItem.categoryId)?.nameFa}</p>
            <div className="mt-6 overflow-hidden rounded-xl">
              <BeforeAfterSlider before={selectedItem.beforeImage} after={selectedItem.afterImage} className="aspect-[16/10]" />
            </div>
            {selectedItem.description && <p className="mt-4 text-sm leading-relaxed text-ivory-2/90">{selectedItem.description}</p>}
            {selectedItem.serviceName && <p className="mt-3 text-xs text-mist">خدمت: {selectedItem.serviceName}</p>}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 p-3">
                <p className="text-xs text-mist">تصویر قبل</p>
                <img src={selectedItem.beforeImage} alt="قبل" className="mt-2 h-32 w-full rounded-lg object-cover" />
              </div>
              <div className="rounded-xl border border-white/10 p-3">
                <p className="text-xs text-mist">تصویر بعد</p>
                <img src={selectedItem.afterImage} alt="بعد" className="mt-2 h-32 w-full rounded-lg object-cover" />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
