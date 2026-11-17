import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { SectionLabel } from "@/components/primitives";
import { formatToman, BOOKING_STATUSES } from "@/lib/format";
import { isoToJalaliDisplay } from "@/lib/jalali";
import { cn } from "@/utils/cn";

export default function CustomerDashboard({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const { bookings, history, getServiceById, getCategoryById, specialists, notifications, updateCustomer } = useData();
  const [tab, setTab] = useState<"overview" | "bookings" | "history" | "profile" | "payments">("overview");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  const myBookings = useMemo(() => bookings.filter((b) => b.customerId === user?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [bookings, user]);
  const upcoming = myBookings.filter((b) => ["pending", "awaiting_payment", "confirmed"].includes(b.status));
  const myHistory = useMemo(() => history.filter((h) => h.customerId === user?.id), [history, user]);
  const myNotifications = useMemo(() => notifications.filter((n) => n.customerId === user?.id).slice(0, 10), [notifications, user]);

  if (!user) return <div className="p-8 text-center text-ivory">لطفاً وارد شوید.</div>;

  const tabs = [
    { id: "overview", label: "داشبورد" },
    { id: "bookings", label: `نوبت‌ها (${myBookings.length})` },
    { id: "history", label: `تاریخچه (${myHistory.length})` },
    { id: "payments", label: "پرداخت‌ها" },
    { id: "profile", label: "پروفایل" },
  ] as const;

  return (
    <div className="min-h-screen bg-ink pb-[env(safe-area-inset-bottom)]">
      {/* هدر چسبان — کوتاه و تمیز روی موبایل */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-ink/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 md:px-8 lg:px-12">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-champagne font-serif text-sm font-bold text-ink sm:h-11 sm:w-11">{user.fullName.slice(0, 1)}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ivory sm:text-base">{user.fullName}</p>
              <p className="truncate text-xs text-mist">{user.phone}</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {onClose && <button onClick={onClose} className="hidden rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-ivory hover:bg-white/5 sm:inline-flex">بازگشت</button>}
            {onClose && <button onClick={onClose} className="rounded-full border border-white/10 px-3 py-2 text-xs text-ivory sm:hidden">خانه</button>}
            <button onClick={logout} className="rounded-full bg-white/5 px-4 py-2 text-xs font-medium text-ivory hover:bg-white/10">خروج</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-5 sm:py-6 md:px-8 lg:px-12">
        {/* تب‌ها — اسکرول افقی روی موبایل */}
        <div className="relative -mx-4 sm:mx-0">
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id as any)} className={cn("whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-bold tracking-[0.12em] transition-all sm:px-4 sm:py-2.5", tab === t.id ? "bg-champagne text-ink shadow-[0_2px_8px_rgba(198,165,106,0.2)]" : "border border-white/10 bg-white/5 text-ivory hover:bg-white/10 active:scale-95")}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "overview" && (
          <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-ink-2 p-5 sm:p-6">
              <SectionLabel className="mb-3 text-xs">پروفایل</SectionLabel>
              <p className="font-serif text-xl text-ivory">{user.fullName}</p>
              <p className="mt-1 text-xs text-mist">عضویت: {new Date(user.createdAt).toLocaleDateString("fa-IR")}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-ink-3 p-4"><p className="text-xl font-bold text-champagne sm:text-2xl">{myBookings.length}</p><p className="mt-1 text-xs text-mist">کل نوبت‌ها</p></div>
                <div className="rounded-2xl bg-ink-3 p-4"><p className="text-xl font-bold text-emerald-300 sm:text-2xl">{upcoming.length}</p><p className="mt-1 text-xs text-mist">نوبت آینده</p></div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-ink-2 p-5 sm:p-6">
              <h4 className="font-bold text-ivory">نوبت‌های آینده</h4>
              {upcoming.length === 0 ? <p className="mt-3 rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-mist">نوبتی ثبت نشده — از آتلیه رزرو کنید</p> : (
                <ul className="mt-4 space-y-2">
                  {upcoming.slice(0, 3).map((b) => {
                    const svc = getServiceById(b.serviceId);
                    return <li key={b.id} className="rounded-xl border border-white/5 bg-ink-3 p-3"><p className="text-sm font-bold text-ivory">{svc?.nameFa} · {b.timeSlot}</p><p className="mt-1 text-xs text-mist">{isoToJalaliDisplay(b.date)}</p><span className={cn("mt-2 inline-block rounded-full border px-2.5 py-1 text-[11px] font-medium", BOOKING_STATUSES[b.status].color)}>{BOOKING_STATUSES[b.status].label}</span></li>;
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-ink-2 p-5 sm:p-6">
              <h4 className="font-bold text-ivory">اعلان‌ها</h4>
              {myNotifications.length === 0 ? <p className="mt-3 text-xs text-mist">پیامی ندارید</p> : (
                <ul className="mt-4 space-y-2">
                  {myNotifications.map((n) => (
                    <li key={n.id} className="rounded-xl bg-ink-3 p-3"><p className="text-sm font-bold text-ivory">{n.title}</p><p className="mt-1 text-xs leading-6 text-ivory-2/80">{n.message}</p></li>
                  ))}
                </ul>
              )}
              {myHistory.length > 0 && <div className="mt-4 rounded-xl bg-champagne/10 p-3 text-xs leading-6 text-champagne">آخرین خدمت: {myHistory[0]?.serviceName} در {isoToJalaliDisplay(myHistory[0]?.date)}</div>}
            </div>

            <div className="md:col-span-3 rounded-2xl border border-white/10 bg-ink-2 p-5 sm:p-6">
              <h4 className="font-bold text-ivory">آخرین خدمات دریافت‌شده</h4>
              {myHistory.length === 0 ? <p className="mt-3 text-xs text-mist">تاریخچه‌ای ثبت نشده</p> : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {myHistory.slice(0, 3).map((h) => (
                    <div key={h.id} className="overflow-hidden rounded-2xl border border-white/5 bg-ink-3">
                      <div className="p-4">
                        <p className="text-sm font-bold text-ivory">{h.serviceName}</p>
                        <p className="mt-1 text-xs text-mist">{isoToJalaliDisplay(h.date)} · {h.specialistName}</p>
                      </div>
                      {h.beforeImage && (
                        <div className="grid grid-cols-2 gap-1 bg-ink-2 p-1">
                          <img src={h.beforeImage} alt="قبل" className="aspect-[4/3] w-full rounded-lg object-cover" />
                          <img src={h.afterImage} alt="بعد" className="aspect-[4/3] w-full rounded-lg object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "bookings" && (
          <div className="mt-6 space-y-3 sm:mt-8">
            {myBookings.map((b) => {
              const svc = getServiceById(b.serviceId);
              const cat = getCategoryById(b.categoryId);
              const sp = specialists.find((s) => s.id === b.specialistId);
              return (
                <div key={b.id} className="overflow-hidden rounded-2xl border border-white/10 bg-ink-2">
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-base font-bold text-ivory sm:text-lg">{svc?.nameFa} <span className="text-xs font-normal text-mist">· {cat?.nameFa}</span></p>
                        <p className="mt-1.5 text-xs leading-6 text-ivory-2/80">{isoToJalaliDisplay(b.date)} · ساعت {b.timeSlot} · {sp?.name}</p>
                        <p className="mt-1 text-xs text-mist">{formatToman(b.totalPrice)} · بیعانه {formatToman(b.depositAmount)}</p>
                        {b.notes && <p className="mt-2 rounded-xl bg-ink-3 p-2.5 text-xs leading-6 text-ivory-2/80">یادداشت: {b.notes}</p>}
                      </div>
                      <span className={cn("inline-flex w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold", BOOKING_STATUSES[b.status].color)}>{BOOKING_STATUSES[b.status].label}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 bg-ink-3 px-4 py-2.5 text-xs text-mist">
                    <span>شناسه: {b.id.slice(0, 8)}</span>
                    <span>{b.paymentStatus === "paid" ? "پرداخت شده" : b.paymentStatus === "deposit_paid" ? "بیعانه پرداخت شد" : "پرداخت نشده"}</span>
                  </div>
                </div>
              );
            })}
            {myBookings.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center"><p className="text-sm text-mist">هنوز نوبتی ثبت نکرده‌اید.</p><p className="mt-2 text-xs text-mist">از آتلیه خدمات، رزرو خود را شروع کنید</p></div>}
          </div>
        )}

        {tab === "history" && (
          <div className="mt-6 sm:mt-8">
            <div className="relative border-r-2 border-white/10 pr-4 sm:pr-6">
              {myHistory.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center"><p className="text-sm text-mist">تاریخچه‌ای وجود ندارد.</p><p className="mt-1 text-xs text-mist">پس از انجام هر خدمت، پرونده شما اینجا ثبت می‌شود.</p></div> : (
                myHistory.map((h) => (
                  <div key={h.id} className="relative mb-6">
                    <span className="absolute -right-[13px] top-6 h-3 w-3 rounded-full border-2 border-ink bg-champagne sm:-right-[15px]" />
                    <div className="rounded-2xl border border-white/10 bg-ink-2 p-4 sm:p-5">
                      <p className="font-bold text-ivory">{h.serviceName} <span className="text-xs font-normal text-mist">· {getCategoryById(h.categoryId)?.nameFa}</span></p>
                      <p className="mt-1 text-xs text-mist">{isoToJalaliDisplay(h.date)} · {h.specialistName} · {formatToman(h.pricePaid)}</p>
                      {h.description && <p className="mt-3 text-xs leading-7 text-ivory-2/80">{h.description}</p>}
                      {(h.beforeImage || h.afterImage) && (
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                          {h.beforeImage && <div><p className="mb-1 text-xs font-bold text-mist">قبل</p><img src={h.beforeImage} alt="قبل" className="aspect-[4/3] w-full rounded-xl object-cover" /></div>}
                          {h.afterImage && <div><p className="mb-1 text-xs font-bold text-mist">بعد</p><img src={h.afterImage} alt="بعد" className="aspect-[4/3] w-full rounded-xl object-cover" /></div>}
                        </div>
                      )}
                      <span className="mt-3 inline-flex rounded-full bg-white/5 px-3 py-1 text-xs text-mist">{h.status === "completed" ? "✓ تکمیل شده" : "در جریان"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div className="mt-6 grid gap-3 sm:mt-8">
            {myBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-ink-2 p-4">
                <div>
                  <p className="text-sm font-bold text-ivory">{getServiceById(b.serviceId)?.nameFa}</p>
                  <p className="mt-1 text-xs text-mist">{isoToJalaliDisplay(b.date)} · {b.timeSlot}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-champagne">{formatToman(b.totalPrice)}</p>
                  <p className="mt-1 text-xs text-mist">بیعانه {formatToman(b.depositAmount)}</p>
                </div>
              </div>
            ))}
            {myBookings.length === 0 && <p className="py-12 text-center text-sm text-mist">تراکنشی یافت نشد.</p>}
          </div>
        )}

        {tab === "profile" && (
          <div className="mt-6 max-w-lg rounded-2xl border border-white/10 bg-ink-2 p-5 sm:mt-8 sm:p-6">
            <h4 className="font-serif text-lg font-bold text-ivory">ویرایش پروفایل</h4>
            <p className="mt-1 text-xs text-mist">اطلاعات شما محرمانه است</p>
            <div className="mt-6 grid gap-4">
              <label className="block"><span className="text-xs font-medium text-mist">نام کامل</span><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-ink-3 p-3.5 text-sm text-ivory outline-none transition-colors focus:border-champagne focus:bg-ink" /></label>
              <label className="block"><span className="text-xs font-medium text-mist">موبایل</span><input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" className="mt-2 w-full rounded-xl border border-white/10 bg-ink-3 p-3.5 text-sm text-ivory outline-none transition-colors focus:border-champagne" /></label>
              <label className="block"><span className="text-xs font-medium text-mist">ایمیل</span><input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className="mt-2 w-full rounded-xl border border-white/10 bg-ink-3 p-3.5 text-sm text-ivory outline-none transition-colors focus:border-champagne" /></label>
              <label className="block"><span className="text-xs font-medium text-mist">آواتار URL</span><input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." dir="ltr" className="mt-2 w-full rounded-xl border border-white/10 bg-ink-3 p-3.5 text-sm text-ivory outline-none transition-colors placeholder:text-mist/50 focus:border-champagne" /></label>
              {avatar && <img src={avatar} alt="avatar" className="mx-auto h-24 w-24 rounded-full object-cover ring-2 ring-champagne/20" />}
              <button
                onClick={() => { updateCustomer(user.id, { fullName, phone, email, avatar, name: fullName.split(" ")[0] }); alert("پروفایل به‌روزرسانی شد"); }}
                className="mt-2 rounded-full bg-champagne py-3.5 text-sm font-bold text-ink shadow-[0_4px_16px_rgba(198,165,106,0.25)] transition-all hover:bg-champagne-2 active:scale-[0.98]"
              >
                ذخیره تغییرات
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
