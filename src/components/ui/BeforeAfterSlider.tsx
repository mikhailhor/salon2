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
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePos = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const pct = (x / rect.width) * 100;
    setPos(Math.max(2, Math.min(98, pct)));
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
        setDragging(true);
        updatePos(e.clientX);
      }}
      onClick={(e) => updatePos((e as any).clientX)}
      style={{ touchAction: "none" }}
    >
      {/* After image (full) */}
      <img src={after} alt={altAfter} className="absolute inset-0 h-full w-full object-cover" loading="lazy" draggable={false} />
      {/* Before image clipped */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={before}
          alt={altBefore}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ width: `calc(100vw)`, maxWidth: "none" }}
          loading="lazy"
          draggable={false}
        />
        {/* Fix width trick: make inner image same size as container but clipped */}
        <div className="absolute inset-0">
          <img src={before} alt={altBefore} className="h-full w-full object-cover" style={{ width: `${100 / (pos / 100)}%` }} loading="lazy" draggable={false} />
        </div>
      </div>

      {/* Simpler correct approach: use clipPath */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt={altBefore} className="h-full w-full object-cover" loading="lazy" draggable={false} />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-champagne shadow-[0_0_8px_rgba(198,165,106,0.6)]"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-champagne bg-ink/80 backdrop-blur-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-champagne">
            <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 12l-3 3 3 3M15 12l3 3-3 3" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          </svg>
        </div>
      </div>

      <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1 text-[11px] tracking-[0.2em] text-ivory backdrop-blur-sm">بعد</span>
      <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-3 py-1 text-[11px] tracking-[0.2em] text-ivory backdrop-blur-sm">قبل</span>

      {/* Keyboard accessibility */}
      <div className="sr-only" role="slider" aria-valuenow={Math.round(pos)} aria-valuemin={0} aria-valuemax={100} tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPos((p) => Math.min(98, p + 5));
          if (e.key === "ArrowRight") setPos((p) => Math.max(2, p - 5));
        }}
      />
    </div>
  );
}
