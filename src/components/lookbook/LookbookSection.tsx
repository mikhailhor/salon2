import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { SectionLabel, GoldButton } from "@/components/primitives";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import { cn } from "@/utils/cn";
import { MEDIA_TYPE_LABEL } from "@/constants/lookbookFilters";

interface Props {
  onOpenGallery: (categoryId: string | null, mediaType?: string) => void;
}

export default function LookbookSection({ onOpenGallery }: Props) {
  const { categories, lookbook } = useData();
  const mainCats = useMemo(() => categories.filter((c) => !c.parentId && c.isActive).sort((a, b) => a.order - b.order), [categories]);
  const [selectedCat, setSelectedCat] = useState<string>(() => mainCats[0]?.id ?? "");

  // update when cats load
  if (!selectedCat && mainCats.length > 0) {
    setSelectedCat(mainCats[0].id);
  }

  const previewItem = useMemo(() => {
    if (!selectedCat) return null;
    const items = lookbook.filter((l) => l.isActive && (l.categoryId === selectedCat || categories.find((c) => c.id === l.subCategoryId)?.parentId === selectedCat)).sort((a, b) => a.order - b.order);
    if (items.length === 0) return null;
    // ترجیح: اول beforeAfter، بعد single، بعد video؛ در صورت نبود، اولین آیتم
    const beforeAfter = items.find((i) => i.mediaType === "beforeAfter" && i.beforeImage && i.afterImage);
    if (beforeAfter) return beforeAfter;
    const single = items.find((i) => i.mediaType === "single" && i.image);
    if (single) return single;
    return items[0];
  }, [lookbook, selectedCat, categories]);

  const selectedCategory = categories.find((c) => c.id === selectedCat);

  return (
    <section id="portfolio" className="bg-ink-2 py-10 sm:py-16 lg:py-20 scroll-mt-20 lg:scroll-mt-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-5 md:px-8 lg:px-12">
        {/* هدر */}
        <div className="text-right">
          <SectionLabel className="text-[11px] sm:text-[13px]">نمونه‌کارها</SectionLabel>
          <h2 className="mt-3 font-serif text-[1.7rem] font-light leading-tight text-ivory sm:text-4xl lg:text-5xl">هر دسته، یک قاب — قبل و بعد واقعی</h2>
          <p className="mt-3 max-w-xl text-[13px] leading-7 text-ivory-2/80 sm:text-sm sm:leading-relaxed">ابتدا دسته را انتخاب کنید؛ یک کارت منتخب (اغلب قبل/بعد) نمایش داده می‌شود و با «مشاهده گالری» به صفحه کامل فیلتردار همان دسته می‌روید.</p>
        </div>

        {/* فیلتر دسته — اسکرول افقی تمیز روی موبایل */}
        <div className="relative mt-6 -mx-4 sm:mx-0">
          <div className="flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {mainCats.map((cat) => {
              const active = cat.id === selectedCat;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCat(cat.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-[11px] font-bold tracking-[0.12em] transition-all sm:text-xs",
                    active
                      ? "border-champagne bg-champagne text-ink shadow-[0_4px_12px_rgba(198,165,106,0.2)]"
                      : "border-white/10 bg-ink text-ivory hover:border-white/20 hover:bg-white/[0.04] active:scale-[0.98]"
                  )}
                >
                  <span className="hidden h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/10 bg-ink-2 sm:block">
                    <img src={cat.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </span>
                  {cat.nameFa}
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-l from-ink-2 to-transparent sm:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-r from-ink-2 to-transparent sm:hidden" />
        </div>

        {/* کارت منتخب */}
        <div className="mx-auto mt-6 max-w-[720px] sm:mt-8">
          {!previewItem ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-ink p-8 text-center">
              <p className="font-serif text-lg text-ivory">{selectedCategory?.nameFa}</p>
              <p className="mt-2 text-sm text-mist">برای این دسته هنوز نمونه‌کاری ثبت نشده است.</p>
              <button type="button" onClick={() => onOpenGallery(selectedCat)} className="mt-4 inline-flex rounded-full bg-white/5 px-5 py-2.5 text-xs font-bold text-ivory hover:bg-white/10">مشاهده گالری همین دسته →</button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
              {/* مدیا */}
              <div className="relative overflow-hidden">
                {previewItem.mediaType === "beforeAfter" && previewItem.beforeImage && previewItem.afterImage ? (
                  <BeforeAfterSlider before={previewItem.beforeImage} after={previewItem.afterImage} className="aspect-[4/3] sm:aspect-[16/10]" />
                ) : previewItem.mediaType === "single" && previewItem.image ? (
                  <img src={previewItem.image} alt={previewItem.titleFa} className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]" loading="lazy" />
                ) : previewItem.mediaType === "video" && previewItem.videoUrl ? (
                  <div className="relative aspect-[4/3] overflow-hidden bg-black sm:aspect-[16/10]">
                    <video src={previewItem.videoUrl} poster={previewItem.videoThumbnail} className="h-full w-full object-contain" muted playsInline />
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/70 text-ivory backdrop-blur">▶</span>
                    </span>
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-ink-2 sm:aspect-[16/10]" />
                )}

                {/* نشان‌ها */}
                <div className="pointer-events-none absolute right-3 top-3 flex gap-1.5">
                  <span className="rounded-full bg-ink/75 px-2.5 py-1 text-[11px] font-bold text-ivory backdrop-blur">{MEDIA_TYPE_LABEL[previewItem.mediaType]}</span>
                  {previewItem.featured && <span className="rounded-full bg-champagne px-2.5 py-1 text-[10px] font-bold text-ink">ویژه</span>}
                </div>
              </div>

              {/* توضیح */}
              <div className="p-4 text-right sm:p-5">
                <p className="text-xs tracking-[0.14em] text-champagne">{selectedCategory?.nameFa}</p>
                <h3 className="mt-1 font-serif text-lg font-bold text-ivory sm:text-xl">{previewItem.titleFa}</h3>
                {previewItem.description && <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-ivory-2/80">{previewItem.description}</p>}
                {previewItem.serviceName && (
                  <p className="mt-2 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-ivory-2/90">{previewItem.serviceName}</p>
                )}

                <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <GoldButton type="button" onClick={() => onOpenGallery(selectedCat)} className="w-full justify-center py-3.5 text-xs tracking-[0.16em] sm:w-auto sm:px-7">
                    مشاهده گالری — {selectedCategory?.nameFa}
                  </GoldButton>
                  <p className="text-center text-[11px] tracking-wide text-mist sm:text-right">ورودی گالری همین دسته با همین فیلتر باز می‌شود</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* راهنما */}
        <p className="mx-auto mt-4 max-w-[720px] text-center text-[11px] leading-6 text-mist sm:text-xs">
          این پیش‌نمایش فقط یک قاب منتخب است؛ تمام آثار دسته را در صفحه‌ی گالری با فیلتر نوع رسانه (تک‌عکس / قبل‌بعد / ویدیو) ببینید.
        </p>
      </div>
    </section>
  );
}
