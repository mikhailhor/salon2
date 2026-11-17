import { useMemo, useState } from "react";
import { fromJalali, toJalali, JALALI_MONTHS, JALALI_WEEKDAYS, getJalaliMonthDays, formatJalali } from "@/lib/jalali";
import { toFaDigits } from "@/lib/format";
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
  const jsDay = firstDayDate.getDay();
  const persianIndex = (jsDay + 1) % 7;
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
    <div className="w-full rounded-2xl border border-white/10 bg-ink-2 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <button type="button" onClick={goPrev} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-ivory transition-colors hover:bg-white/5 active:scale-95">‹</button>
        <p className="font-serif text-base text-ivory sm:text-xl">{JALALI_MONTHS[cursor.jm - 1]} {toFaDigits(cursor.jy)}</p>
        <button type="button" onClick={goNext} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-ivory transition-colors hover:bg-white/5 active:scale-95">›</button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] tracking-[0.12em] text-mist sm:gap-1 sm:text-xs">
        {JALALI_WEEKDAYS.map((d) => (
          <div key={d} className="py-2 font-bold text-[10px] sm:text-xs">{d.slice(0, 1)}</div>
        ))}
        {cells.map((c, i) => {
          if (!c.day) return <div key={`e-${i}`} />;
          const isClosed = isPast(c.date!) || c.date!.getDay() === 5;
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
                "relative flex aspect-square items-center justify-center rounded-xl text-[13px] transition-all sm:rounded-lg sm:text-sm",
                isDisabled && "cursor-not-allowed text-white/15",
                !isDisabled && !selected && "text-ivory hover:bg-white/10 active:scale-90",
                selected && "bg-champagne font-bold text-ink shadow-[0_2px_8px_rgba(198,165,106,0.4)]",
                isToday && !selected && "ring-1 ring-champagne/50"
              )}
            >
              {toFaDigits(c.day!)}
              {isHoliday && <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-red-400" />}
            </button>
          );
        })}
      </div>
      <div className="mt-3 rounded-xl bg-ink-3 p-2.5 sm:mt-4 sm:p-3">
        <p className="text-xs leading-5 text-mist sm:leading-relaxed">
          جمعه‌ها تعطیل · تاریخ‌های گذشته قابل انتخاب نیست
        </p>
        {value && (
          <p className="mt-1 text-xs font-bold text-champagne">
            ✓ {formatJalali(new Date(`${value}T12:00:00`))}
          </p>
        )}
      </div>
    </div>
  );
}
