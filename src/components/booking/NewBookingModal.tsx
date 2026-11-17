import { useEffect, useMemo, useState, useRef } from "react";
import { useData } from "@/context/DataContext";
import { useSalon } from "@/context/SalonContext";
import { useAuth } from "@/context/AuthContext";
import { GoldButton, GhostButton, IconClose, SectionLabel } from "@/components/primitives";
import { cn } from "@/utils/cn";
import { JalaliCalendar } from "@/components/ui/JalaliCalendar";
import { formatToman, calcDeposit, formatDuration, TIME_SLOTS, toFaDigits } from "@/lib/format";
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (bookingOpen) {
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

  const servicesForCategory = useMemo(() => {
    if (!selectedCategoryId) return [];
    const subs = categories.filter((c) => c.parentId === selectedCategoryId).map((c) => c.id);
    return services.filter((s) => (s.categoryId === selectedCategoryId || subs.includes(s.subCategoryId || "")) && s.isActive && s.bookingEnabled).sort((a, b) => a.order - b.order);
  }, [selectedCategoryId, services, categories]);

  const selectedService = useMemo(() => services.find((s) => s.id === booking.serviceId), [services, booking.serviceId]);
  const selectedSpecialist = useMemo(() => specialists.find((s) => s.id === booking.stylistId), [specialists, booking.stylistId]);

  const specialistsForService = useMemo(() => {
    if (!selectedService) return specialists.filter((s) => s.isActive);
    const filtered = specialists.filter((s) => s.isActive && (s.categoryIds.includes(selectedService.categoryId) || s.categoryIds.includes(selectedService.subCategoryId || "")));
    // اگر هیچ متخصصی با این دسته لینک نشده، همه متخصصان فعال را نشان بده تا کاربر گیر نکند
    return filtered.length > 0 ? filtered : specialists.filter((s) => s.isActive);
  }, [selectedService, specialists]);

  const availableSlots = useMemo(() => {
    if (!booking.date || !booking.stylistId) return [];
    return getAvailableSlots(booking.date, booking.stylistId);
  }, [booking.date, booking.stylistId, getAvailableSlots]);

  useEffect(() => {
    if (bookingOpen && booking.serviceId && !selectedCategoryId) {
      const svc = services.find((s) => s.id === booking.serviceId);
      if (svc) {
        setSelectedCategoryId(svc.categoryId);
        setStep(2);
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
      paymentStatus: "unpaid",
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

  useEffect(() => {
    if (user && bookingOpen && !booking.name) {
      setBooking({ name: user.fullName, phone: user.phone, email: user.email || "" });
    }
  }, [user, bookingOpen]);

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
      {/* موبایل: فول‌اسکرین با اسکرول نرم، دسکتاپ: مودال مرکزی */}
      <div className="absolute inset-0 flex flex-col overscroll-contain overflow-hidden bg-ink lg:inset-3 lg:rounded-[1.5rem] lg:border lg:border-white/10 lg:shadow-[0_24px_64px_rgba(0,0,0,0.5)] xl:inset-6">
        {/* هدر چسبان */}
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-ink px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <button ref={closeRef} type="button" aria-label="بستن" onClick={closeBooking} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-ivory transition-colors hover:bg-white/10">
              <IconClose className="h-4 w-4" />
            </button>
            <div>
              <p className="text-xs tracking-[0.15em] text-mist">رزرو آنلاین</p>
              <p className="font-serif text-sm font-bold text-ivory sm:text-base">رزرو نوبت — مرحله {step + 1} از ۶</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-xs text-mist">{STEPS[step]}</span>
            <span className="h-4 w-px bg-white/10" />
            <span className="text-xs font-bold text-champagne">{step + 1}/۶</span>
          </div>
        </div>

        {success ? (
          <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-lg rounded-2xl border border-champagne/20 bg-champagne/10 p-6 text-center sm:p-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-champagne text-ink">✓</div>
              <p className="mt-4 font-serif text-2xl text-ivory sm:text-3xl">رزرو شما ثبت شد!</p>
              <p className="mt-3 text-sm leading-7 text-ivory-2/90">
                {selectedService?.nameFa} در تاریخ {booking.date ? toJalaliString(new Date(`${booking.date}T12:00:00`)) : booking.date} ساعت {toFaDigits(booking.time || "")}
                {depositAmount > 0 ? ` — بیعانه ${formatToman(depositAmount)} برای تأیید نهایی` : " — همکاران ما به زودی تماس می‌گیرند."}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <GoldButton onClick={() => { setSuccess(false); resetBooking(); closeBooking(); }} className="w-full sm:w-auto">بستن</GoldButton>
                <GhostButton onClick={() => { setSuccess(false); setStep(0); }}>رزرو دیگر</GhostButton>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* نوار مراحل — اسکرول افقی روی موبایل */}
            <div className="shrink-0 border-b border-white/5 bg-ink-2">
              <div className="flex gap-1.5 overflow-x-auto px-4 py-3 sm:gap-2 sm:px-6 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                {STEPS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => i <= step && setStep(i)}
                    className={cn(
                      "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold transition-all sm:px-3.5 sm:py-2",
                      i === step ? "bg-champagne text-ink shadow-[0_2px_8px_rgba(198,165,106,0.3)]" : i < step ? "bg-white/10 text-ivory" : "bg-white/5 text-mist"
                    )}
                  >
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px]", i === step ? "bg-ink text-champagne" : i < step ? "bg-champagne text-ink" : "bg-white/10 text-mist")}>
                      {i < step ? "✓" : i + 1}
                    </span>
                    <span className="hidden inline sm:inline">{label}</span>
                  </button>
                ))}
              </div>
              <div className="h-0.5 w-full bg-white/5">
                <div className="h-full bg-champagne transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
              </div>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
              {/* سایدبار دسکتاپ — تصویر و خلاصه */}
              <div className="relative hidden w-[340px] shrink-0 overflow-hidden border-l border-white/10 bg-ink-2 lg:block xl:w-[380px]">
                <img src={selectedService?.image || "/images/hero/hero-01.jpg"} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
                <div className="relative flex h-full flex-col p-6">
                  <SectionLabel className="text-xs">لیندا</SectionLabel>
                  <p className="mt-3 font-serif text-2xl text-ivory">رزرو حرفه‌ای</p>
                  <p className="mt-2 text-xs leading-6 text-ivory-2/80">هر سیتینگ خصوصی است؛ بیعانه به تومان، تقویم جلالی و تأیید آنی.</p>
                  {selectedService ? (
                    <div className="mt-6 rounded-2xl border border-white/10 bg-ink/70 p-4 backdrop-blur-sm">
                      <p className="font-serif text-base text-ivory">{selectedService.nameFa}</p>
                      <p className="mt-1 text-xs text-champagne">{formatDuration(selectedService.durationMinutes)} · {formatToman(selectedService.price)}</p>
                      <p className="mt-2 line-clamp-3 text-xs leading-6 text-ivory-2/80">{selectedService.description}</p>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-4 text-center">
                      <p className="text-xs text-mist">خدمتی انتخاب نشده</p>
                    </div>
                  )}
                  {selectedService && depositAmount > 0 && (
                    <div className="mt-4 rounded-xl bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
                      بیعانه: {formatToman(depositAmount)} · باقی‌مانده: {formatToman(totalPrice - depositAmount)}
                    </div>
                  )}
                </div>
              </div>

              {/* محتوای اصلی — اسکرول مستقل */}
              <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain">
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                  {step === 0 && (
                    <div>
                      <h3 className="font-serif text-lg text-ivory sm:text-xl">دسته‌بندی را انتخاب کنید</h3>
                      <p className="mt-1 text-xs text-mist sm:text-sm">۱۰ آتلیه تخصصی — یکی را لمس کنید</p>
                      <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2">
                        {mainCategories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => { setSelectedCategoryId(cat.id); setBooking({ serviceId: null }); }}
                            className={cn("flex gap-3 rounded-2xl border p-3 text-right transition-all active:scale-[0.98] sm:p-4", selectedCategoryId === cat.id ? "border-champagne bg-champagne/10 shadow-[0_4px_16px_rgba(198,165,106,0.15)]" : "border-white/10 bg-ink-2 hover:border-white/20")}
                          >
                            <img src={cat.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16" />
                            <div className="min-w-0 flex-1">
                              <p className="font-serif text-sm font-bold text-ivory sm:text-base">{cat.nameFa}</p>
                              <p className="text-[11px] tracking-[0.12em] text-champagne">{cat.nameEn}</p>
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-ivory-2/80">{cat.descriptionFa}</p>
                            </div>
                            <span className={cn("hidden h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs sm:flex", selectedCategoryId === cat.id ? "border-champagne bg-champagne text-ink" : "border-white/15 text-mist")}>{selectedCategoryId === cat.id ? "✓" : "›"}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div>
                      <h3 className="font-serif text-lg text-ivory sm:text-xl">خدمت را انتخاب کنید</h3>
                      <p className="mt-1 text-xs text-mist">{servicesForCategory.length} خدمت در این دسته</p>
                      {servicesForCategory.length === 0 ? (
                        <p className="py-12 text-center text-sm text-mist">خدمتی یافت نشد.</p>
                      ) : (
                        <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2">
                          {servicesForCategory.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setBooking({ serviceId: s.id, stylistId: null })}
                              className={cn("rounded-2xl border p-4 text-right transition-all active:scale-[0.98]", booking.serviceId === s.id ? "border-champagne bg-champagne/10" : "border-white/10 bg-ink-2 hover:border-white/15")}
                            >
                              <p className="font-serif text-sm font-bold text-ivory sm:text-base">{s.nameFa}</p>
                              <p className="mt-1 text-xs tracking-[0.12em] text-mist">{s.nameEn} · {formatDuration(s.durationMinutes)}</p>
                              <p className="mt-2 text-sm font-bold text-champagne">{formatToman(s.price)}{s.priceMax ? ` – ${formatToman(s.priceMax)}` : ""}</p>
                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-ivory-2/80">{s.description}</p>
                              {s.depositEnabled && <p className="mt-2 inline-flex rounded-full bg-white/5 px-2 py-1 text-[11px] text-mist">بیعانه: {s.depositType === "percent" ? `${s.depositValue}%` : formatToman(s.depositValue)}</p>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <h3 className="font-serif text-lg text-ivory sm:text-xl">متخصص را انتخاب کنید</h3>
                      <p className="mt-1 text-xs text-mist">{specialistsForService.length} متخصص در دسترس</p>
                      <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2">
                        {specialistsForService.map((sp) => (
                          <button
                            key={sp.id}
                            type="button"
                            onClick={() => setBooking({ stylistId: sp.id })}
                            className={cn("flex gap-3 rounded-2xl border p-3 text-right transition-all active:scale-[0.98] sm:p-4", booking.stylistId === sp.id ? "border-champagne bg-champagne/10" : "border-white/10 bg-ink-2 hover:border-white/15")}
                          >
                            <img src={sp.image} alt={sp.name} className="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16" />
                            <div className="min-w-0 flex-1">
                              <p className="font-serif text-sm font-bold text-ivory sm:text-base">{sp.name}</p>
                              <p className="text-xs tracking-[0.12em] text-champagne">{sp.role}</p>
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-ivory-2/80">{sp.bio}</p>
                              <p className="mt-1.5 inline-flex rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-mist">ظرفیت {sp.capacityPerSlot} نفر</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <h3 className="font-serif text-lg text-ivory sm:text-xl">تاریخ و ساعت</h3>
                      <p className="mt-1 text-xs text-mist">تقویم شمسی — ساعت‌های آزاد به‌صورت زنده</p>
                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <JalaliCalendar
                          value={booking.date}
                          onChange={(iso) => setBooking({ date: iso, time: null })}
                          holidays={settings.holidays ? new Set(settings.holidays) : undefined}
                        />
                        <div>
                          <p className="mb-3 text-sm font-bold text-ivory">ساعت‌های آزاد</p>
                          {!booking.date ? (
                            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
                              <p className="text-sm text-mist">ابتدا تاریخ را انتخاب کنید</p>
                              <p className="mt-1 text-xs text-mist">سپس ساعت دلخواه را لمس کنید</p>
                            </div>
                          ) : availableSlots.length === 0 ? (
                            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-center">
                              <p className="text-sm font-bold text-amber-200">تاریخ پر است</p>
                              <p className="mt-1 text-xs text-amber-200/80">تاریخ دیگری انتخاب کنید</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                                      "flex min-h-[44px] items-center justify-center rounded-xl border py-2.5 text-sm font-medium transition-all active:scale-95",
                                      !isAvailable && "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/15",
                                      isAvailable && !isSelected && "border-white/10 bg-ink-2 text-ivory hover:border-champagne/40 hover:bg-white/5",
                                      isSelected && "border-champagne bg-champagne font-bold text-ink shadow-[0_2px_8px_rgba(198,165,106,0.3)]"
                                    )}
                                  >
                                    {toFaDigits(t)}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          {booking.date && booking.time && (
                            <div className="mt-4 rounded-2xl border border-champagne/20 bg-champagne/10 p-4">
                              <p className="text-xs font-bold text-champagne">✓ انتخاب شما</p>
                              <p className="mt-1 text-sm text-ivory">{toJalaliString(new Date(`${booking.date}T12:00:00`))} — ساعت {toFaDigits(booking.time)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div>
                      <h3 className="font-serif text-lg text-ivory sm:text-xl">اطلاعات تماس</h3>
                      <p className="mt-1 text-xs text-mist">برای تأیید نوبت با شما تماس می‌گیریم</p>
                      <div className="mt-4 grid gap-4 sm:mt-6 sm:max-w-lg">
                        <Field label="نام و نام خانوادگی *" value={booking.name} onChange={(v) => setBooking({ name: v })} />
                        <Field label="شماره موبایل *" value={booking.phone} onChange={(v) => setBooking({ phone: v })} type="tel" />
                        <Field label="ایمیل (اختیاری)" value={booking.email} onChange={(v) => setBooking({ email: v })} type="email" />
                        <Field label="توضیحات / درخواست خاص" value={booking.notes} onChange={(v) => setBooking({ notes: v })} multiline />
                        {user && <p className="rounded-xl bg-emerald-500/10 p-3 text-xs leading-5 text-emerald-300">✓ اطلاعات شما از پروفایل پر شد — قابل ویرایش است</p>}
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div>
                      <h3 className="font-serif text-lg text-ivory sm:text-xl">تأیید نهایی</h3>
                      <p className="mt-1 text-xs text-mist">لطفاً جزئیات را مرور کنید</p>
                      <dl className="mt-4 divide-y divide-white/5 rounded-2xl border border-white/10 bg-ink-2 sm:mt-6">
                        {[
                          ["دسته‌بندی", categories.find((c) => c.id === selectedService?.categoryId)?.nameFa || "—"],
                          ["خدمت", selectedService?.nameFa || "—"],
                          ["متخصص", selectedSpecialist?.name || "—"],
                          ["تاریخ", booking.date ? `${toJalaliString(new Date(`${booking.date}T12:00:00`))}` : "—"],
                          ["ساعت", booking.time ? toFaDigits(booking.time) : "—"],
                          ["مدت", selectedService ? formatDuration(selectedService.durationMinutes) : "—"],
                          ["هزینه کل", formatToman(totalPrice)],
                          ["بیعانه", depositAmount > 0 ? formatToman(depositAmount) : "بدون بیعانه"],
                          ["مبلغ باقی‌مانده", formatToman(totalPrice - depositAmount)],
                          ["مهمان", booking.name],
                          ["موبایل", booking.phone],
                        ].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-3.5">
                            <dt className="text-xs text-mist sm:text-sm">{k}</dt>
                            <dd className="text-right text-sm font-bold text-ivory">{v}</dd>
                          </div>
                        ))}
                      </dl>
                      {depositAmount > 0 && (
                        <div className="mt-4 rounded-2xl bg-amber-300/10 p-4">
                          <p className="text-xs font-bold text-amber-200">💳 پرداخت بیعانه</p>
                          <p className="mt-1 text-xs leading-6 text-amber-200/90">
                            برای نهایی‌سازی، مبلغ بیعانه {formatToman(depositAmount)} باید پرداخت شود. در صورت لغو تا ۲۴ ساعت قبل، بیعانه قابل استرداد است.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {errors && <div className="mx-4 mb-2 rounded-xl bg-red-500/10 p-3 text-sm leading-6 text-red-300 sm:mx-6 sm:mb-4">{errors}</div>}

                {/* فوتر چسبان با دکمه‌های بزرگ برای موبایل */}
                <div className="sticky bottom-0 flex shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-ink px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setErrors(null);
                      if (step === 0) closeBooking();
                      else setStep((s) => s - 1);
                    }}
                    className="flex min-h-[44px] items-center justify-center rounded-full border border-white/10 px-5 text-sm font-medium text-ivory transition-colors hover:bg-white/5 active:scale-95 sm:px-6"
                  >
                    {step === 0 ? "انصراف" : "بازگشت"}
                  </button>
                  {step < 5 ? (
                    <GoldButton type="button" onClick={next} className="min-h-[44px] flex-1 justify-center py-3 text-sm font-bold sm:flex-none sm:px-8">ادامه</GoldButton>
                  ) : (
                    <GoldButton type="button" onClick={handleConfirm} className="min-h-[44px] flex-1 justify-center py-3 text-xs font-bold leading-none sm:flex-none sm:px-6 sm:text-sm">
                      <span className="hidden sm:inline">{depositAmount > 0 ? `پرداخت بیعانه و تأیید (${formatToman(depositAmount)})` : "تأیید نهایی رزرو"}</span>
                      <span className="sm:hidden">{depositAmount > 0 ? `پرداخت ${formatToman(depositAmount)}` : "تأیید نهایی"}</span>
                    </GoldButton>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", multiline }: { label: string; value: string; onChange: (v: string) => void; type?: string; multiline?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-medium tracking-[0.12em] text-mist">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder="در صورت نیاز توضیح دهید..." className="mt-2 w-full rounded-xl border border-white/10 bg-ink-2 p-3.5 text-sm text-ivory placeholder:text-mist/50 outline-none transition-colors focus:border-champagne focus:bg-ink-3" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={type === "tel" ? "0912..." : type === "email" ? "email@example.com" : ""} className="mt-2 w-full rounded-xl border border-white/10 bg-ink-2 p-3.5 text-sm text-ivory placeholder:text-mist/50 outline-none transition-colors focus:border-champagne focus:bg-ink-3" />
      )}
    </label>
  );
}
