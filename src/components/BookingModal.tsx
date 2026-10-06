import { useEffect, useMemo, useRef, useState } from "react";
import {
  BOOKING_JOURNEY,
  BOOKING_SERVICES,
  BRAND,
  IMAGES,
  STYLISTS,
  TIME_SLOTS,
  toFaDigits,
} from "@/data/salon";
import { useSalon } from "@/context/SalonContext";
import { GoldButton, GhostButton, IconClose, SectionLabel } from "@/components/primitives";
import { cn } from "@/utils/cn";

const STEPS = [
  "خدمت",
  "استایلیست",
  "تاریخ",
  "ساعت",
  "اطلاعات",
  "تأیید",
] as const;

export default function BookingModal() {
  const {
    bookingOpen,
    closeBooking,
    booking,
    setBooking,
    resetBooking,
    reducedMotion,
  } = useSalon();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"form" | "journey">("form");
  const [errors, setErrors] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!bookingOpen) {
      const t = window.setTimeout(() => {
        setStep(0);
        setPhase("form");
        setErrors(null);
      }, 400);
      return () => window.clearTimeout(t);
    }
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBooking();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [bookingOpen, closeBooking]);

  const service = BOOKING_SERVICES.find((s) => s.id === booking.serviceId);
  const stylist = STYLISTS.find((s) => s.id === booking.stylistId);

  const stylistsForService = useMemo(() => {
    if (!service) return STYLISTS;
    return STYLISTS.filter((s) =>
      s.specialties.some((sp) => service.specialties.includes(sp)),
    );
  }, [service]);

  const canNext = () => {
    if (step === 0) return Boolean(booking.serviceId);
    if (step === 1) return Boolean(booking.stylistId);
    if (step === 2) return Boolean(booking.date);
    if (step === 3) return Boolean(booking.time);
    if (step === 4)
      return booking.name.trim().length > 1 && booking.phone.trim().length > 5;
    return true;
  };

  const next = () => {
    if (!canNext()) {
      setErrors("برای ادامه، این مرحله را کامل کنید.");
      return;
    }
    setErrors(null);
    if (step < 5) setStep((s) => s + 1);
  };

  const confirm = () => {
    if (!canNext()) return;
    setPhase("journey");
  };

  const finish = () => {
    resetBooking();
    closeBooking();
  };

  const stepImage =
    step === 0
      ? service?.image ?? IMAGES.hair
      : step === 1
        ? stylist?.image ?? IMAGES.portrait
        : step === 2
          ? IMAGES.interior
          : step === 3
            ? IMAGES.chair
            : step === 4
              ? IMAGES.brandModel
              : IMAGES.hero;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[55] transition-[opacity,visibility] duration-500",
        bookingOpen
          ? "visible opacity-100"
          : "invisible pointer-events-none opacity-0",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="رزرو نوبت"
    >
      <div className="absolute inset-0 bg-ink/85 backdrop-blur-sm" onClick={closeBooking} />
      <div className="absolute inset-0 overscroll-contain overflow-y-auto md:inset-6 md:overflow-hidden lg:inset-10">
        <div className="relative min-h-full bg-ink md:flex md:min-h-full md:overflow-hidden md:border md:border-white/10">
          <button
            ref={closeRef}
            type="button"
            aria-label="بستن رزرو"
            onClick={closeBooking}
            className="fixed top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-ink/60 text-ivory backdrop-blur-sm md:absolute md:top-6 md:right-6 md:h-auto md:w-auto md:bg-transparent md:backdrop-blur-none"
            data-cursor="کاوش"
          >
            <IconClose className="h-6 w-6" />
          </button>

          {phase === "journey" ? (
            <BookingJourney onDone={finish} reduced={reducedMotion} />
          ) : (
            <>
              <div className="relative hidden h-auto md:block md:w-[42%] lg:w-[46%]">
                <img
                  src={stepImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/20" />
                <div className="absolute right-0 bottom-0 left-0 p-10">
                  <SectionLabel>لیندا</SectionLabel>
                  <p className="mt-4 font-serif text-4xl text-ivory">
                    یک سیتینگ خصوصی.
                  </p>
                </div>
              </div>

              <div className="relative flex flex-1 flex-col px-6 py-16 md:overflow-y-auto md:px-10 lg:px-14">
                <SectionLabel className="mb-3">رزرو</SectionLabel>
                <h2 className="font-serif text-3xl text-ivory md:text-4xl">
                  رزرو نوبت
                </h2>

                <ol className="mt-8 mb-10 flex flex-wrap gap-2" aria-label="مراحل رزرو">
                  {STEPS.map((label, i) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => i <= step && setStep(i)}
                        className={cn(
                          "px-2 py-1 text-[15px] tracking-[0.22em] uppercase",
                          i === step
                            ? "text-champagne"
                            : i < step
                              ? "text-ivory/90"
                              : "text-ivory/75",
                        )}
                      >
                        {toFaDigits(i + 1).padStart(2, "۰")} {label}
                      </button>
                    </li>
                  ))}
                </ol>

                <div className="flex-1">
                  {step === 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {BOOKING_SERVICES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          data-cursor="کاوش"
                          onClick={() =>
                            setBooking({
                              serviceId: s.id,
                              stylistId: null,
                            })
                          }
                          className={cn(
                            "border p-5 text-right transition-colors duration-300",
                            booking.serviceId === s.id
                              ? "border-champagne bg-champagne/10"
                              : "border-white/10 hover:border-white/30",
                          )}
                        >
                          <p className="font-serif text-2xl text-ivory">
                            {s.name}
                          </p>
                          <p className="mt-2 text-[15px] tracking-[0.2em] text-mist uppercase">
                            {s.duration} · {s.price}
                          </p>
                          <p className="mt-2 text-sm text-ivory-2/90">{s.description}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 1 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {stylistsForService.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          data-cursor="کاوش"
                          onClick={() => setBooking({ stylistId: s.id })}
                          className={cn(
                            "flex gap-4 border p-3 text-right transition-colors",
                            booking.stylistId === s.id
                              ? "border-champagne bg-champagne/10"
                              : "border-white/10 hover:border-white/30",
                          )}
                        >
                          <img
                            src={s.image}
                            alt=""
                            className="h-20 w-16 object-cover"
                          />
                          <span>
                            <span className="block font-serif text-xl text-ivory">
                              {s.name}
                            </span>
                            <span className="mt-1 block text-[16px] tracking-[0.22em] text-champagne uppercase">
                              {s.role}
                            </span>
                            <span className="mt-2 block text-xs leading-relaxed text-ivory-2/90">
                              {s.bio}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 2 && (
                    <Calendar
                      value={booking.date}
                      onChange={(date) => setBooking({ date, time: null })}
                    />
                  )}

                  {step === 3 && (
                    <TimeGrid
                      date={booking.date}
                      value={booking.time}
                      onChange={(time) => setBooking({ time })}
                    />
                  )}

                  {step === 4 && (
                    <div className="grid max-w-lg gap-6">
                      <Field
                        label="نام"
                        value={booking.name}
                        onChange={(v) => setBooking({ name: v })}
                        required
                      />
                      <Field
                        label="شماره تماس"
                        value={booking.phone}
                        onChange={(v) => setBooking({ phone: v })}
                        required
                        type="tel"
                      />
                      <Field
                        label="ایمیل"
                        value={booking.email}
                        onChange={(v) => setBooking({ email: v })}
                        type="email"
                      />
                      <Field
                        label="توضیحات (اختیاری)"
                        value={booking.notes}
                        onChange={(v) => setBooking({ notes: v })}
                        multiline
                      />
                    </div>
                  )}

                  {step === 5 && (
                    <div className="max-w-lg">
                      <p className="font-serif text-2xl text-ivory">
                        تأیید سیتینگ شما
                      </p>
                      <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
                        {[
                          ["خدمت", service?.name ?? "—"],
                          ["استایلیست", stylist?.name ?? "—"],
                          ["تاریخ", formatDate(booking.date)],
                          ["ساعت", booking.time ?? "—"],
                          ["مدت", service?.duration ?? "—"],
                          ["هزینه پایه", service?.price ?? "—"],
                          ["مهمان", booking.name],
                          ["شماره تماس", booking.phone],
                          ["ایمیل", booking.email || "—"],
                        ].map(([k, v]) => (
                          <div
                            key={k}
                            className="flex items-baseline justify-between gap-6 py-3"
                          >
                            <dt className="text-[16px] tracking-[0.28em] text-mist uppercase">
                              {k}
                            </dt>
                            <dd className="text-sm text-ivory">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>

                {errors && (
                  <p className="mt-6 text-sm text-champagne" role="alert">
                    {errors}
                  </p>
                )}

                <div className="mt-10 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setErrors(null);
                      if (step === 0) closeBooking();
                      else setStep((s) => s - 1);
                    }}
                    className="text-[16px] tracking-[0.28em] text-ivory/80 uppercase hover:text-ivory"
                  >
                    {step === 0 ? "انصراف" : "بازگشت"}
                  </button>
                  {step < 5 ? (
                    <GoldButton type="button" onClick={next}>
                      ادامه
                    </GoldButton>
                  ) : (
                    <GoldButton type="button" onClick={confirm}>
                      تأیید نهایی نوبت
                    </GoldButton>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  multiline?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block" htmlFor={id}>
      <span className="text-[16px] tracking-[0.28em] text-mist uppercase">
        {label}
        {required ? " *" : ""}
      </span>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="mt-2 w-full resize-none border-b border-white/20 bg-transparent py-2 text-ivory outline-none focus:border-champagne"
        />
      ) : (
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full border-b border-white/20 bg-transparent py-2 text-ivory outline-none focus:border-champagne"
        />
      )}
    </label>
  );
}

function Calendar({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string) => void;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startPad = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = cursor.toLocaleString("fa-IR-u-ca-gregory", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-md">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          aria-label="ماه قبل"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="text-ivory/90 hover:text-ivory"
        >
          ‹
        </button>
        <p className="font-serif text-2xl text-ivory">{monthLabel}</p>
        <button
          type="button"
          aria-label="ماه بعد"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="text-ivory/90 hover:text-ivory"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[16px] tracking-[0.18em] text-mist uppercase">
        {["د", "س", "چ", "پ", "ج", "ش", "ی"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const date = new Date(year, month, d);
          const iso = toISO(date);
          const closed = isClosed(date);
          const selected = value === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={closed}
              onClick={() => onChange(iso)}
              className={cn(
                "aspect-square text-sm transition-colors",
                closed && "cursor-not-allowed text-white/15",
                !closed && !selected && "text-ivory hover:bg-white/8",
                selected && "bg-champagne text-ink",
              )}
            >
              {d}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-mist">دوشنبه‌ها تعطیل هستند. تاریخ‌های گذشته قابل انتخاب نیستند.</p>
    </div>
  );
}

function TimeGrid({
  date,
  value,
  onChange,
}: {
  date: string | null;
  value: string | null;
  onChange: (v: string) => void;
}) {
  const taken = useMemo(() => takenSlots(date), [date]);
  return (
    <div>
      <p className="mb-6 text-sm text-ivory-2/90">
        ساعت‌های آزاد برای {formatDate(date)}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {TIME_SLOTS.map((t) => {
          const busy = taken.has(t);
          return (
            <button
              key={t}
              type="button"
              disabled={busy}
              onClick={() => onChange(t)}
              className={cn(
                "border py-3 text-sm tracking-wide transition-colors",
                busy && "cursor-not-allowed border-white/5 text-white/20",
                !busy && value !== t && "border-white/10 text-ivory hover:border-champagne/50",
                value === t && "border-champagne bg-champagne text-ink",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookingJourney({
  onDone,
  reduced,
}: {
  onDone: () => void;
  reduced: boolean;
}) {
  const { booking } = useSalon();
  const [scene, setScene] = useState(0);
  const service = BOOKING_SERVICES.find((s) => s.id === booking.serviceId);
  const stylist = STYLISTS.find((s) => s.id === booking.stylistId);
  const last = scene >= BOOKING_JOURNEY.length - 1;

  useEffect(() => {
    if (last) return;
    const t = window.setTimeout(
      () => setScene((s) => s + 1),
      reduced ? 900 : 3200,
    );
    return () => window.clearTimeout(t);
  }, [scene, last, reduced]);

  const current = BOOKING_JOURNEY[scene];

  return (
    <div className="relative min-h-[100dvh] w-full md:min-h-full">
      {BOOKING_JOURNEY.map((s, i) => (
        <img
          key={s.id}
          src={s.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === scene ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-ink/55" />
      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 py-20 text-center md:min-h-full">
        <SectionLabel className="mb-8">
          {toFaDigits(scene + 1).padStart(2, "۰")} / ۰۴
        </SectionLabel>
        <h2 className="max-w-[16ch] font-serif text-4xl font-light text-ivory sm:text-6xl">
          {current.title}
        </h2>
        <p className="mt-6 max-w-md font-serif text-xl text-champagne">
          {current.line}
        </p>

        {last && (
          <div className="mt-12 w-full max-w-md border border-white/10 bg-ink/70 p-8 text-right backdrop-blur-sm">
            <p className="text-[16px] tracking-[0.32em] text-champagne">
              سیتینگ شما
            </p>
            <ul className="mt-5 space-y-2 text-sm text-ivory-2">
              <li className="flex justify-between gap-4">
                <span>خدمت</span>
                <span className="text-ivory">{service?.name}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>استایلیست</span>
                <span className="text-ivory">{stylist?.name}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>تاریخ</span>
                <span className="text-ivory">{formatDate(booking.date)}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>ساعت</span>
                <span className="text-ivory">{booking.time}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>مهمان</span>
                <span className="text-ivory">{booking.name}</span>
              </li>
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-mist">
              پیام تأیید به {booking.email || booking.phone} ارسال می‌شود. آدرس مزون:
              {BRAND.location}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <GoldButton type="button" onClick={onDone}>
                بستن
              </GoldButton>
              <GhostButton type="button" onClick={() => setScene(0)}>
                پخش دوباره
              </GhostButton>
            </div>
          </div>
        )}

        {!last && (
          <button
            type="button"
            onClick={() => setScene((s) => Math.min(BOOKING_JOURNEY.length - 1, s + 1))}
            className="mt-12 text-[16px] tracking-[0.32em] text-ivory/80 uppercase hover:text-champagne"
          >
            ادامه
          </button>
        )}
      </div>
      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/10">
        <div
          className="h-full bg-champagne transition-[width] duration-700"
          style={{
            width: `${((scene + 1) / BOOKING_JOURNEY.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isClosed(d: Date) {
  const now = startOfDay(new Date());
  if (startOfDay(d) < now) return true;
  if (d.getDay() === 1) return true;
  return false;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("fa-IR-u-ca-gregory", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function takenSlots(date: string | null) {
  const set = new Set<string>();
  if (!date) return set;
  let hash = 0;
  for (let i = 0; i < date.length; i++) hash = (hash * 31 + date.charCodeAt(i)) >>> 0;
  TIME_SLOTS.forEach((t, i) => {
    if ((hash + i * 17) % 7 === 0) set.add(t);
  });
  return set;
}
