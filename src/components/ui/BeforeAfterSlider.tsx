import { useRef, useState, useEffect, useCallback } from "react";

export default function BeforeAfterSlider({
  before,
  after,
  altBefore = "قبل",
  altAfter = "بعد",
  className = "",
}: {
  before: string;
  after: string;
  altBefore?: string;
  altAfter?: string;
  className?: string;
}) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePos = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const pct = (x / rect.width) * 100;
    setPos(Math.max(4, Math.min(96, pct)));
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragging) return;
    updatePos(e.clientX);
  }, [dragging, updatePos]);

  const handlePointerUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragging, handlePointerMove, handlePointerUp]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden bg-ink-3 ${className}`}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setDragging(true);
        updatePos(e.clientX);
      }}
      onPointerEnter={() => setIsHover(true)}
      onPointerLeave={() => setIsHover(false)}
      style={{ touchAction: "none" }}
    >
      <img src={after} alt={altAfter} className="absolute inset-0 h-full w-full object-cover" loading="lazy" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt={altBefore} className="h-full w-full object-cover" loading="lazy" draggable={false} />
      </div>

      {/* خط جداکننده */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.5)]"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-champagne shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-transform sm:h-10 sm:w-10"
             style={{ transform: `translate(-50%, -50%) scale(${dragging || isHover ? 1.1 : 1})` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-ink">
            <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <span className="absolute bottom-2 left-2 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-bold tracking-[0.15em] text-ivory backdrop-blur-sm sm:bottom-3 sm:left-3 sm:px-3 sm:text-[11px]">بعد</span>
      <span className="absolute bottom-2 right-2 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-bold tracking-[0.15em] text-ivory backdrop-blur-sm sm:bottom-3 sm:right-3 sm:px-3 sm:text-[11px]">قبل</span>

      {/* hint برای موبایل */}
      <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center sm:hidden">
        <span className="rounded-full bg-ink/70 px-3 py-1 text-[10px] tracking-[0.12em] text-ivory/90 backdrop-blur-sm">‹ بکشید ›</span>
      </div>

      <div className="sr-only" role="slider" aria-valuenow={Math.round(pos)} aria-valuemin={0} aria-valuemax={100} tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPos((p) => Math.min(96, p + 5));
          if (e.key === "ArrowRight") setPos((p) => Math.max(4, p - 5));
        }}
      />
    </div>
  );
}
