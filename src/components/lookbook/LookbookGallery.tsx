import { useMemo, useState, useRef, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { useSalon } from "@/context/SalonContext";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import { SectionLabel, GoldButton, GhostButton } from "@/components/primitives";
import { cn } from "@/utils/cn";
import { MEDIA_TYPE_LABEL, LOOKBOOK_FILTERS } from "@/constants/lookbookFilters";
import type { LookbookMediaType } from "@/types";

export default function LookbookGallery() {
  const { lookbook, categories } = useData();
  const { setBooking, openBooking, navigateTo } = useSalon();
  const [typeFilter, setTypeFilter] = useState<"" | LookbookMediaType>("");
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement | null>(null);

  const visible = useMemo(() => {
    return lookbook
      .filter((x) => x.isActive)
      .filter((x) => !typeFilter || x.mediaType === typeFilter)
      .filter((x) => !catFilter || x.categoryId === catFilter)
      .sort((a, b) => a.order - b.order);
  }, [lookbook, typeFilter, catFilter]);

  useEffect(() => {
    if (!activeId && visible.length > 0) setActiveId(visible[0].id);
  }, [visible, activeId]);

  // وقتی فیلتر عوض شد، به ابتدای اسکرول برگرد (و active را تنظیم کن)
  useEffect(() => {
    if (visible.length > 0) setActiveId(visible[0].id);
    galleryRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [typeFilter, catFilter]);

  // اسکرول به آیتم فعال
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeId]);

  const active = visible.find((x) => x.id === activeId) || null;

  return (
    <section id="portfolio" className="border-y border-white/10 bg-ink-2 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 scroll-mt-20 lg:scroll-mt-24">
      <div className="mx-auto w-full max-w-[1400px]">
        <SectionLabel>نمونه‌کارها</SectionLabel>
        <h2 className="mt-3 font-serif text-[clamp(1.4rem,5vw,2.2rem)] font-bold leading-tight text-ivory">گالری آثار — قبل/بعد، تک‌عکس، ویدیو</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-on-dark-muted">هر کارت «مشاهده گالری» دارد؛ با اسکرول افقی همه آثار را ببینید و با فیلتر نوع رسانه محدود کنید. هر تصویر توسط ادمین قابل آپلود و مدیریت است.</p>

        {/* فیلتر نوع رسانه */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {LOOKBOOK_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTypeFilter(f.id as any)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                typeFilter === f.id ? "border-champagne bg-champagne text-ink" : "border-white/10 bg-white/5 text-ivory hover:border-white/20"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* فیلتر دسته */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setCatFilter(null)} className={cn("rounded-full border px-3 py-1.5 text-xs", !catFilter ? "border-champagne bg-champagne text-ink" : "border-white/10 bg-white/5 text-ivory")}>همه دسته‌ها</button>
          {categories.filter((c) => !c.parentId).slice(0, 10).map((c) => (
            <button key={c.id} type="button" onClick={() => setCatFilter(c.id)} className={cn("rounded-full border px-3 py-1.5 text-xs", catFilter === c.id ? "border-champagne bg-champagne text-ink" : "border-white/10 bg-white/5 text-ivory")}>{c.nameFa}</button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-mist">موردی با این فیلتر یافت نشد.</p>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
            {/* نمایشگر اصلی */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink">
              {active && (
                <div>
                  {active.mediaType === "single" && active.image && (
                    <img src={active.image} alt={active.titleFa} className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[480px]" />
                  )}
                  {active.mediaType === "beforeAfter" && active.beforeImage && active.afterImage && (
                    <BeforeAfterSlider before={active.beforeImage} after={active.afterImage} className="h-[320px] sm:h-[420px] lg:h-[480px]" />
                  )}
                  {active.mediaType === "video" && active.videoUrl && (
                    <video src={active.videoUrl} poster={active.videoThumbnail} controls playsInline className="h-[320px] w-full bg-black object-contain sm:h-[420px] lg:h-[480px]" />
                  )}
                  <div className="border-t border-white/10 p-4 sm:p-5">
                    <p className="font-serif text-base font-bold text-ivory sm:text-lg">{active.titleFa}</p>
                    {active.description && <p className="mt-1 text-xs leading-6 text-ink-on-dark-muted line-clamp-2">{active.description}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-mist">{MEDIA_TYPE_LABEL[active.mediaType]}</span>
                      {active.serviceName && <span className="rounded-full bg-champagne/10 px-2 py-1 text-[11px] text-champagne">{active.serviceName}</span>}
                      <span className="ml-auto text-[11px] text-mist">{categories.find((c) => c.id === active.categoryId)?.nameFa || ""}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <GoldButton
                        type="button"
                        onClick={() => {
                          if (active.serviceId) setBooking({ serviceId: active.serviceId });
                          openBooking();
                        }}
                      >
                        رزرو این خدمت
                      </GoldButton>
                      <GhostButton type="button" onClick={() => navigateTo("services")}>مشاهده خدمات</GhostButton>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ریل اسکرول افقی کارت‌ها — همان صفحه گالری قابل اسکرول */}
            <div className="flex flex-col">
              <div
                ref={galleryRef}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden pb-2 pt-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10"
                aria-label="گالری قابل اسکرول"
              >
                {visible.map((item) => {
                  const isActive = item.id === activeId;
                  const thumb = item.mediaType === "single" ? item.image : item.mediaType === "video" ? item.videoThumbnail : item.afterImage || item.beforeImage;
                  return (
                    <div
                      key={item.id}
                      ref={isActive ? (activeRef as any) : undefined}
                      className={cn(
                        "group relative flex w-[220px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border bg-ink text-right transition-all",
                        isActive ? "border-champagne ring-1 ring-champagne" : "border-white/10 hover:border-white/20"
                      )}
                    >
                      <div className="relative h-[160px] overflow-hidden bg-ink-2">
                        {thumb ? <img src={thumb} alt={item.titleFa} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center text-xs text-mist">بدون تصویر</div>}
                        <span className="absolute right-2 top-2 rounded-full bg-ink/80 px-2 py-1 text-[10px] font-bold text-ivory backdrop-blur-sm">{MEDIA_TYPE_LABEL[item.mediaType]}</span>
                      </div>
                      <div className="p-3">
                        <p className="line-clamp-1 font-serif text-sm font-bold text-ivory">{item.titleFa}</p>
                        <p className="mt-1 line-clamp-1 text-[11px] text-mist">{item.description || categories.find((c) => c.id === item.categoryId)?.nameFa || ""}</p>
                        <button
                          type="button"
                          onClick={() => setActiveId(item.id)}
                          className={cn("mt-3 w-full rounded-full px-3 py-2 text-xs font-bold", isActive ? "bg-champagne text-ink" : "bg-white/10 text-ivory hover:bg-white/15")}
                        >
                          مشاهده گالری
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-center text-[11px] tracking-wide text-mist">← اسکرول افقی کنید →</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
