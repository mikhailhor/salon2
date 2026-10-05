import { useEffect, useMemo, useState } from "react";
import {
  PORTFOLIO,
  PORTFOLIO_FILTERS,
  SERVICE_CATEGORY_LABELS,
  toFaDigits,
  type PortfolioItem,
  type ServiceCategory,
} from "@/data/salon";
import { IconArrow, IconClose, SectionLabel } from "@/components/primitives";
import { cn } from "@/utils/cn";

export default function PortfolioSection() {
  const [filter, setFilter] = useState<"All" | ServiceCategory>("All");
  const [active, setActive] = useState<PortfolioItem | null>(null);
  const items = useMemo(() => filter === "All" ? PORTFOLIO : PORTFOLIO.filter((p) => p.category === filter), [filter]);

  return (
    <section id="portfolio" className="scroll-mt-24 bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-12">
        <div className="mb-12 flex flex-col gap-8 text-right md:mb-16 md:flex-row md:items-end md:justify-between">
          <div><SectionLabel className="mb-5">لُک‌بوک</SectionLabel><h2 className="font-serif text-4xl font-light text-ivory sm:text-6xl">نمونه‌کارهای ما</h2></div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="فیلتر نمونه‌کارها">
            {PORTFOLIO_FILTERS.map((f) => <button key={f} type="button" role="tab" aria-selected={filter === f} data-cursor="کاوش" onClick={() => setFilter(f)} className={cn("px-4 py-2 text-[16px] tracking-[0.28em] transition-colors duration-300", filter === f ? "bg-champagne text-ink" : "text-ivory/85 hover:text-ivory")}>{f === "All" ? "همه" : SERVICE_CATEGORY_LABELS[f]}</button>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {items.map((item) => <button key={item.id} type="button" data-cursor="مشاهده" onClick={() => setActive(item)} className="group relative aspect-[3/4] overflow-hidden bg-ink-3 text-right">
            <img src={item.image} alt={`${item.title} — ${item.subtitle}`} className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]" style={{ objectPosition: item.objectPosition }} loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-90 transition-all duration-500 group-hover:translate-y-0"><p className="font-serif text-xl text-ivory">{item.title}</p><p className="mt-1 text-[16px] tracking-[0.28em] text-champagne">{SERVICE_CATEGORY_LABELS[item.category]}</p></div>
          </button>)}
        </div>
      </div>
      {active && <Lightbox item={active} items={items} onClose={() => setActive(null)} onChange={setActive} />}
    </section>
  );
}

function Lightbox({ item, items, onClose, onChange }: { item: PortfolioItem; items: PortfolioItem[]; onClose: () => void; onChange: (item: PortfolioItem) => void }) {
  const idx = items.findIndex((p) => p.id === item.id);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange(items[(idx + 1) % items.length]);
      if (e.key === "ArrowLeft") onChange(items[(idx - 1 + items.length) % items.length]);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; prev?.focus(); };
  }, [idx, items, onChange, onClose]);

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/94 p-4 backdrop-blur-sm md:p-10" role="dialog" aria-modal="true" aria-label={item.title} onClick={onClose}>
    <button type="button" aria-label="بستن" onClick={onClose} className="absolute top-5 right-5 text-ivory" data-cursor="بستن"><IconClose className="h-7 w-7" /></button>
    <button type="button" aria-label="نمونه قبلی" className="absolute top-1/2 left-3 -translate-y-1/2 p-3 text-ivory md:left-8" data-cursor="قبلی" onClick={(e) => { e.stopPropagation(); onChange(items[(idx - 1 + items.length) % items.length]); }}><IconArrow className="h-6 w-6 rotate-180" /></button>
    <button type="button" aria-label="نمونه بعدی" className="absolute top-1/2 right-3 -translate-y-1/2 p-3 text-ivory md:right-8" data-cursor="بعدی" onClick={(e) => { e.stopPropagation(); onChange(items[(idx + 1) % items.length]); }}><IconArrow className="h-6 w-6" /></button>
    <figure className="relative max-h-[86vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
      <img src={item.image} alt={`${item.title} — ${item.subtitle}`} className="mx-auto max-h-[74vh] w-auto object-contain" style={{ objectPosition: item.objectPosition }} />
      <figcaption className="mt-6 flex items-end justify-between gap-6 text-right"><div><p className="font-serif text-3xl text-ivory">{item.title}</p><p className="mt-1 text-[15px] tracking-[0.28em] text-champagne">{SERVICE_CATEGORY_LABELS[item.category]} · {item.subtitle}</p></div><p className="text-[15px] tracking-[0.28em] text-mist">{toFaDigits(idx + 1).padStart(2, "۰")} / {toFaDigits(items.length).padStart(2, "۰")}</p></figcaption>
    </figure>
  </div>;
}