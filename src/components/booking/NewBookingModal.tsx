import { useEffect, useMemo, useState, useRef } from "react";
import { useData } from "@/context/DataContext";
import { useSalon } from "@/context/SalonContext";
import { useAuth } from "@/context/AuthContext";
import { GoldButton, GhostButton, IconClose, SectionLabel } from "@/components/primitives";
import { cn } from "@/utils/cn";
import { JalaliCalendar } from "@/components/ui/JalaliCalendar";
import { formatToman, calcDeposit, formatDuration, TIME_SLOTS, BOOKING_STATUSES } from "@/lib/format";
import { toJalaliString } from "@/lib/jalali";

const STEPS = ["دسته‌بندی", "خدمت", "متخصص", "تاریخ و ساعت", "اطلاعات", "تأیید"] as const;

export default function NewBookingModal() {
  const { bookingOpen, closeBooking, booking, setBooking, resetBooking } = useSalon();
  const { categories, services, specialists, settings, getAvailableSlots, createBooking } = useData();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const mainCategories = useMemo(() => categories.filter((c) => !c.parentId && c.isActive).sort((a, b) => a.order - b.order), [categories]);

  const selectedCategory = useMemo(() => categories.find((c) => c.id === booking.serviceId ? services.find((s) => s.id === booking.serviceId)?.categoryId : null), []) as any;

  // Determine category from selected service or standalone category state
  // We store category selection separately as temporary state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (bookingOpen) {
      // if booking has serviceId, infer category
      if (booking.serviceId) {
        const svc = services.find((s) => s.id === booking.serviceId);
        if (svc) setSelectedCategoryId(svc.categoryId);
      }
    } else {
      const t = setTimeout(() => {
        setStep(0);
        setErrors(null);
        setSuccess(false);
        setSelectedCategoryId(null);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [bookingOpen, booking.serviceId, services]);

  // When category changes, reset service if needed
  const servicesForCategory = useMemo(() => {
    if (!selectedCategoryId) return [];
    // include subcategories services
    const subs = categories.filter((c) => c.parentId === selectedCategoryId).map((c) => c.id);
    return services.filter((s) => (s.categoryId === selectedCategoryId || subs.includes(s.subCategoryId || "")) && s.isActive && s.bookingEnabled).sort((a, b) => a.order - b.order);
  }, [selectedCategoryId, services, categories]);

  const selectedService = useMemo(() => services.find((s) => s.id === booking.serviceId), [services, booking.serviceId]);
  const selectedSpecialist = useMemo(() => specialists.find((s) => s.id === booking.stylistId), [specialists, booking.stylistId]);

  const specialistsForService = useMemo(() => {
    if (!selectedService) return specialists.filter((s) => s.isActive);
    return specialists.filter((s) => s.isActive && (s.categoryIds.includes(selectedService.categoryId) || s.categoryIds.includes(selectedService.subCategoryId || "")));
  }, [selectedService, specialists]);

  const availableSlots = useMemo(() => {
    if (!booking.date || !booking.stylistId) return [];
    return getAvailableSlots(booking.date, booking.stylistId);
  }, [booking.date, booking.stylistId, getAvailableSlots]);

  // Auto-select logic when coming from atelier
  useEffect(() => {
    if (bookingOpen && booking.serviceId && !selectedCategoryId) {
      const svc = services.find((s) => s.id === booking.serviceId);
      if (svc) {
        setSelectedCategoryId(svc.categoryId);
        setStep(2); // jump to specialist step if service pre-selected? Actually per spec should pre-select category+service and let user fill rest.
        // We'll keep step 0 but show selected; or set step to 2
      }
    }
  }, [bookingOpen, booking.serviceId, services, selectedCategoryId]);

  const canNext = () => {
    if (step === 0) return !!selectedCategoryId;
    if (step === 1) return !!booking.serviceId;
    if (step === 2) return !!booking.stylistId;
    if (step === 3) return !!booking.date && !!booking.time;
    if (step === 4) return booking.name.trim().length > 1 && booking.phone.trim().length > 5;
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

  const handleConfirm = () => {
    if (!selectedService || !selectedSpecialist || !booking.date || !booking.time) {
      setErrors("اطلاعات رزرو ناقص است.");
      return;
    }
    // calc pricing
    const total = selectedService.price;
    let deposit = 0;
    if (settings.depositGlobalEnabled || selectedService.depositEnabled) {
      if (selectedService.depositEnabled) {
        deposit = calcDeposit(total, selectedService.depositType, selectedService.depositValue);
      } else if (settings.depositGlobalEnabled) {
        deposit = calcDeposit(total, settings.depositGlobalType, settings.depositGlobalValue);
      }
    }
    const remaining = total - deposit;
    const jalali = toJalaliString(new Date(`${booking.date}T12:00:00`));
    const res = createBooking({
      customerId: user?.id || `guest_${Date.now()}`,
      serviceId: selectedService.id,
      categoryId: selectedService.categoryId,
      subCategoryId: selectedService.subCategoryId || null,
      specialistId: selectedSpecialist.id,
      date: booking.date,
      jalaliDate: jalali,
      timeSlot: booking.time,
      status: deposit > 0 ? "awaiting_payment" : "pending",
      totalPrice: total,
      depositAmount: deposit,
      remainingAmount: remaining,
      paymentStatus: deposit > 0 ? "unpaid" : "unpaid",
      notes: booking.notes,
      customerName: booking.name || user?.fullName || "مهمان",
      customerPhone: booking.phone || user?.phone || "",
      customerEmail: booking.email || user?.email || "",
    });
    if (!res.ok) {
      setErrors(res.message || "خطا در ثبت رزرو");
      return;
    }
    setSuccess(true);
  };

  // Prefill user data when authenticated
  useEffect(() => {
    if (user && bookingOpen && !booking.name) {
      setBooking({ name: user.fullName, phone: user.phone, email: user.email || "" });
    }
  }, [user, bookingOpen]);

  if (!bookingOpen && !success) {
    // still need to keep mounted for animation? We handle via parent
  }

  const totalPrice = selectedService?.price || 0;
  const depositAmount = selectedService && (selectedService.depositEnabled || settings.depositGlobalEnabled)
    ? selectedService.depositEnabled
      ? calcDeposit(totalPrice, selectedService.depositType, selectedService.depositValue)
      : calcDeposit(totalPrice, settings.depositGlobalType, settings.depositGlobalValue)
    : 0;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[55] transition-[opacity,visibility] duration-500",
        bookingOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0"
      )}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-ink/85 backdrop-blur-sm" onClick={closeBooking} />
      <div className="absolute inset-0 overscroll-contain overflow-y-auto lg:inset-6 lg:overflow-hidden">
        <div className="relative min-h-full bg-ink lg:flex lg:min-h-full lg:overflow-hidden lg:border lg:border-white/10">
          <button ref={closeRef} type="button" aria-label="بستن" onClick={closeBooking} className="fixed top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-ink/60 text-ivory backdrop-blur-sm lg:absolute lg:top-6 lg:right-6">
            <IconClose className="h-6 w-6" />
          </button>

          {success ? (
            <div className="flex w-full flex-col items-center justify-center p-8 text-center">
              <div className="max-w-lg rounded-2xl border border-champagne/20 bg-champagne/10 p-8">
                <p className="font-serif text-3xl text-ivory">رزرو شما ثبت شد!</p>
                <p className="mt-3 text-sm leading-relaxed text-ivory-2/90">
                  رزرو برای {selectedService?.nameFa} در تاریخ {booking.date} ساعت {booking.time} ثبت شد.
                  {depositAmount > 0 ? ` مبلغ بیعانه ${formatToman(depositAmount)} برای تأیید نهایی باید پرداخت شود.` : " همکاران ما به زودی با شما تماس می‌گیرند."}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <GoldButton onClick={() => { setSuccess(false); resetBooking(); closeBooking(); }}>بستن</GoldButton>
                  <GhostButton onClick={() => { setSuccess(false); setStep(0); }}>رزرو دیگر</GhostButton>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="relative hidden h-auto w-[42%] overflow-hidden lg:block">
                <img src={selectedService?.image || "/images/hero/hero-01.jpg"} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/20" />
                <div className="absolute right-0 bottom-0 left-0 p-8">
                  <SectionLabel>لیندا</SectionLabel>
                  <p className="mt-3 font-serif text-3xl text-ivory">رزرو حرفه‌ای</p>
                  <p className="mt-2 text-sm leading-relaxed text-ivory-2/90">هر سیتینگ خصوصی است؛ بیعانه به تومان، تقویم جلالی و تأیید آنی.</p>
                  {selectedService && (
                    <div className="mt-6 rounded-xl border border-white/10 bg-ink/60 p-4 backdrop-blur-sm">
                      <p className="text-sm font-bold text-ivory">{selectedService.nameFa}</p>
                      <p className="text-xs text-champagne">{formatDuration(selectedService.durationMinutes)} · {formatToman(selectedService.price)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative flex flex-1 flex-col px-6 py-16 md:px-10 lg:overflow-y-auto lg:px-12">
                <SectionLabel className="mb-3">رزرو آنلاین</SectionLabel>
                <h2 className="font-serif text-3xl text-ivory">رزرو نوبت</h2>

                <ol className="mt-6 mb-6 flex flex-wrap gap-2">
                  {STEPS.map((label, i) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => i <= step && setStep(i)}
                        className={cn("rounded-full px-3 py-1.5 text-xs tracking-wide transition-colors", i === step ? "bg-champagne text-ink font-bold" : i < step ? "bg-white/10 text-ivory" : "bg-white/5 text-mist")}
                      >
                        {i + 1}. {label}
                      </button>
                    </li>
                  ))}
                </ol>

                <div className="flex-1">
                  {step === 0 && (
                    <div>
                      <p className="mb-4 text-sm text-ivory-2/90">دسته‌بندی خدمت را انتخاب کنید:</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {mainCategories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => { setSelectedCategoryId(cat.id); setBooking({ serviceId: null }); }}
                            className={cn("flex gap-3 rounded-xl border p-3 text-right transition-colors", selectedCategoryId === cat.id ? "border-champagne bg-champagne/10" : "border-white/10 hover:border-white/20")}
                          >
                            <img src={cat.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                            <div>
                              <p className="font-serif text-lg text-ivory">{cat.nameFa}</p>
                              <p className="text-xs tracking-[0.15em] text-champagne">{cat.nameEn}</p>
                              <p className="mt-1 line-clamp-2 text-xs text-ivory-2/80">{cat.descriptionFa}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div>
                      <p className="mb-4 text-sm text-ivory-2/90">خدمت موردنظر را انتخاب کنید:</p>
                      {servicesForCategory.length === 0 ? (
                        <p className="py-6 text-center text-sm text-mist">خدمتی یافت نشد.</p>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {servicesForCategory.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setBooking({ serviceId: s.id, stylistId: null })}
                              className={cn("rounded-xl border p-4 text-right transition-colors", booking.serviceId === s.id ? "border-champagne bg-champagne/10" : "border-white/10 hover:border-white/20")}
                            >
                              <p className="font-serif text-lg text-ivory">{s.nameFa}</p>
                              <p className="mt-1 text-xs tracking-[0.15em] text-mist">{s.nameEn} · {formatDuration(s.durationMinutes)}</p>
                              <p className="mt-2 text-sm font-bold text-champagne">{formatToman(s.price)}{s.priceMax ? ` – ${formatToman(s.priceMax)}` : ""}</p>
                              <p className="mt-2 line-clamp-2 text-xs text-ivory-2/80">{s.description}</p>
                              {s.depositEnabled && <p className="mt-2 text-[11px] text-mist">بیعانه: {s.depositType === "percent" ? `${s.depositValue}%` : formatToman(s.depositValue)}</p>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <p className="mb-4 text-sm text-ivory-2/90">متخصص موردنظر را انتخاب کنید:</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {specialistsForService.map((sp) => (
                          <button
                            key={sp.id}
                            type="button"
                            onClick={() => setBooking({ stylistId: sp.id })}
                            className={cn("flex gap-3 rounded-xl border p-3 text-right", booking.stylistId === sp.id ? "border-champagne bg-champagne/10" : "border-white/10 hover:border-white/20")}
                          >
                            <img src={sp.image} alt={sp.name} className="h-16 w-16 rounded-lg object-cover" />
                            <div>
                              <p className="font-serif text-base text-ivory">{sp.name}</p>
                              <p className="text-xs tracking-[0.15em] text-champagne">{sp.role}</p>
                              <p className="mt-1 line-clamp-2 text-xs text-ivory-2/80">{sp.bio}</p>
                              <p className="mt-1 text-[11px] text-mist">ظرفیت هر سانس: {sp.capacityPerSlot} نفر</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div>
                        <p className="mb-3 text-sm font-bold text-ivory">انتخاب تاریخ (شمسی)</p>
                        <JalaliCalendar
                          value={booking.date}
                          onChange={(iso) => setBooking({ date: iso, time: null })}
                        />
                      </div>
                      <div>
                        <p className="mb-3 text-sm font-bold text-ivory">ساعت‌های آزاد</p>
                        {!booking.date ? (
                          <p className="text-sm text-mist">ابتدا تاریخ را انتخاب کنید.</p>
                        ) : availableSlots.length === 0 ? (
                          <p className="text-sm text-amber-300">هیچ ساعتی در این تاریخ آزاد نیست. تاریخ دیگری انتخاب کنید.</p>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            {TIME_SLOTS.map((t) => {
                              const isAvailable = availableSlots.includes(t);
                              const isSelected = booking.time === t;
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  disabled={!isAvailable}
                                  onClick={() => setBooking({ time: t })}
                                  className={cn(
                                    "rounded-lg border py-2.5 text-sm transition-colors",
                                    !isAvailable && "cursor-not-allowed border-white/5 text-white/20",
                                    isAvailable && !isSelected && "border-white/10 text-ivory hover:border-champagne/40",
                                    isSelected && "border-champagne bg-champagne text-ink font-bold"
                                  )}
                                >
                                  {t}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {booking.date && booking.time && (
                          <div className="mt-4 rounded-xl border border-champagne/20 bg-champagne/10 p-3">
                            <p className="text-xs text-ivory">انتخاب شما: {booking.date} ساعت {booking.time}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="grid max-w-lg gap-4">
                      <Field label="نام و نام خانوادگی *" value={booking.name} onChange={(v) => setBooking({ name: v })} />
                      <Field label="شماره موبایل *" value={booking.phone} onChange={(v) => setBooking({ phone: v })} type="tel" />
                      <Field label="ایمیل" value={booking.email} onChange={(v) => setBooking({ email: v })} type="email" />
                      <Field label="توضیحات / درخواست خاص" value={booking.notes} onChange={(v) => setBooking({ notes: v })} multiline />
                      {user && <p className="text-xs text-emerald-300">✓ اطلاعات شما از پروفایل پر شد</p>}
                    </div>
                  )}

                  {step === 5 && (
                    <div className="max-w-lg">
                      <h3 className="font-serif text-xl text-ivory">تأیید نهایی</h3>
                      <dl className="mt-6 divide-y divide-white/10 rounded-xl border border-white/10 bg-ink-2 p-4">
                        {[
                          ["دسته‌بندی", categories.find((c) => c.id === selectedService?.categoryId)?.nameFa || "—"],
                          ["خدمت", selectedService?.nameFa || "—"],
                          ["متخصص", selectedSpecialist?.name || "—"],
                          ["تاریخ", booking.date ? `${booking.date} (${toJalaliString(new Date(`${booking.date}T12:00:00`))})` : "—"],
                          ["ساعت", booking.time || "—"],
                          ["مدت", selectedService ? formatDuration(selectedService.durationMinutes) : "—"],
                          ["هزینه کل", formatToman(totalPrice)],
                          ["بیعانه", depositAmount > 0 ? formatToman(depositAmount) : "بدون بیعانه"],
                          ["مبلغ باقی‌مانده", formatToman(totalPrice - depositAmount)],
                          ["مهمان", booking.name],
                          ["موبایل", booking.phone],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
                            <dt className="text-mist">{k}</dt>
                            <dd className="font-bold text-ivory">{v}</dd>
                          </div>
                        ))}
                      </dl>
                      {depositAmount > 0 && (
                        <p className="mt-4 rounded-lg bg-amber-300/10 p-3 text-xs leading-relaxed text-amber-200">
                          برای نهایی‌سازی رزرو، مبلغ بیعانه {formatToman(depositAmount)} باید پرداخت شود. در صورت لغو تا ۲۴ ساعت قبل، بیعانه قابل استرداد است.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {errors && <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{errors}</p>}

                <div className="mt-8 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setErrors(null);
                      if (step === 0) closeBooking();
                      else setStep((s) => s - 1);
                    }}
                    className="text-sm tracking-[0.15em] text-ivory/80 hover:text-ivory"
                  >
                    {step === 0 ? "انصراف" : "بازگشت"}
                  </button>
                  {step < 5 ? (
                    <GoldButton type="button" onClick={next}>ادامه</GoldButton>
                  ) : (
                    <GoldButton type="button" onClick={handleConfirm}>
                      {depositAmount > 0 ? `پرداخت بیعانه و تأیید (${formatToman(depositAmount)})` : "تأیید نهایی رزرو"}
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

function Field({ label, value, onChange, type = "text", multiline }: { label: string; value: string; onChange: (v: string) => void; type?: string; multiline?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs tracking-[0.15em] text-mist">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border border-white/10 bg-ink-3 p-3 text-sm text-ivory outline-none focus:border-champagne" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-ink-3 p-3 text-sm text-ivory outline-none focus:border-champagne" />
      )}
    </label>
  );
}
