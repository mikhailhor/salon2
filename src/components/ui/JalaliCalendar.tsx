import { useMemo, useState } from "react";
import { fromJalali, toJalali, JALALI_MONTHS, JALALI_WEEKDAYS, getJalaliMonthDays, formatJalali, isJalaliLeap } from "@/lib/jalali";
import { cn } from "@/utils/cn";

interface Props {
  value: string | null; // ISO YYYY-MM-DD
  onChange: (iso: string) => void;
  disabledDates?: Set<string>;
  holidays?: Set<string>;
}

export function JalaliCalendar({ value, onChange, disabledDates, holidays }: Props) {
  const today = new Date();
  const initialJalali = useMemo(() => {
    if (value) {
      const d = new Date(`${value}T12:00:00`);
      return toJalali(d);
    }
    return toJalali(today);
  }, [value]);

  const [cursor, setCursor] = useState(() => ({ jy: initialJalali.jy, jm: initialJalali.jm }));

  const daysInMonth = getJalaliMonthDays(cursor.jy, cursor.jm);
  const firstDayDate = fromJalali(cursor.jy, cursor.jm, 1);
  // Persian week: Sat=0 .. Fri=6. Need offset for grid
  const jsDay = firstDayDate.getDay(); // 0 Sun ..6 Sat
  const persianIndex = (jsDay + 1) % 7; // Sat=0
  const startPad = persianIndex;

  const cells: Array<{ day: number | null; iso: string | null; date: Date | null }> = [];
  for (let i = 0; i < startPad; i++) cells.push({ day: null, iso: null, date: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = fromJalali(cursor.jy, cursor.jm, d);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    cells.push({ day: d, iso, date });
  }

  const goPrev = () => {
    let { jy, jm } = cursor;
    jm--;
    if (jm < 1) { jm = 12; jy--; }
    setCursor({ jy, jm });
  };
  const goNext = () => {
    let { jy, jm } = cursor;
    jm++;
    if (jm > 12) { jm = 1; jy++; }
    setCursor({ jy, jm });
  };

  const isPast = (date: Date) => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return dStart < todayStart;
  };

  return (
    <div className="max-w-md rounded-xl border border-white/10 bg-ink-2 p-4">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={goPrev} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-ivory hover:bg-white/5">‹</button>
        <p className="font-serif text-xl text-ivory">{JALALI_MONTHS[cursor.jm - 1]} {cursor.jy}</p>
        <button type="button" onClick={goNext} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-ivory hover:bg-white/5">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[12px] tracking-[0.15em] text-mist">
        {JALALI_WEEKDAYS.map((d) => (
          <div key={d} className="py-2 font-bold">{d.slice(0, 1)}</div>
        ))}
        {cells.map((c, i) => {
          if (!c.day) return <div key={`e-${i}`} />;
          const isClosed = isPast(c.date!) || c.date!.getDay() === 5; // Friday closed (JS Fri=5)
          const isHoliday = holidays?.has(c.iso!) || false;
          const isDisabled = isClosed || isHoliday || disabledDates?.has(c.iso!) || false;
          const selected = value === c.iso;
          const isToday = c.iso === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          return (
            <button
              key={c.iso}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange(c.iso!)}
              className={cn(
                "relative aspect-square rounded-lg text-sm transition-colors",
                isDisabled && "cursor-not-allowed text-white/15",
                !isDisabled && !selected && "text-ivory hover:bg-white/10",
                selected && "bg-champagne text-ink font-bold",
                isToday && !selected && "ring-1 ring-champagne/50"
              )}
            >
              {c.day}
              {isHoliday && <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-red-400" />}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-mist">
        روزهای جمعه تعطیل هستند. تاریخ‌های گذشته قابل انتخاب نیستند. تقویم شمسی است و در دیتابیس به صورت میلادی ذخیره می‌شود.
      </p>
      {value && (
        <p className="mt-2 text-xs text-champagne">
          انتخاب: {formatJalali(new Date(`${value}T12:00:00`))}
        </p>
      )}
    </div>
  );
}
