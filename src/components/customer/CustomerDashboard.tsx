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
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  const myBookings = useMemo(() => bookings.filter((b) => b.customerId === user?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [bookings, user]);
  const upcoming = myBookings.filter((b) => ["pending", "awaiting_payment", "confirmed"].includes(b.status));
  const past = myBookings.filter((b) => ["completed", "cancelled", "rejected", "no_show"].includes(b.status));
  const myHistory = useMemo(() => history.filter((h) => h.customerId === user?.id), [history, user]);
  const myNotifications = useMemo(() => notifications.filter((n) => n.customerId === user?.id).slice(0, 10), [notifications, user]);

  if (!user) return <div className="p-8 text-center text-ivory">لطفاً وارد شوید.</div>;

  return (
    <div className="min-h-screen bg-ink">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-ink/95 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-champagne font-serif text-ink">{user.fullName.slice(0, 1)}</div>
          <div>
            <p className="text-sm font-bold text-ivory">{user.fullName}</p>
            <p className="text-xs text-mist">{user.phone} {user.email ? `· ${user.email}` : ""}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onClose && <button onClick={onClose} className="rounded-full border border-white/10 px-4 py-2 text-xs text-ivory">بازگشت به سایت</button>}
          <button onClick={logout} className="rounded-full bg-white/5 px-4 py-2 text-xs text-ivory hover:bg-white/10">خروج</button>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 lg:px-12">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "overview", label: "داشبورد" },
            { id: "bookings", label: `نوبت‌ها (${myBookings.length})` },
            { id: "history", label: `تاریخچه زیبایی (${myHistory.length})` },
            { id: "payments", label: "پرداخت‌ها" },
            { id: "profile", label: "پروفایل" },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={cn("rounded-full px-4 py-2 text-xs font-bold tracking-[0.12em]", tab === t.id ? "bg-champagne text-ink" : "border border-white/10 text-ivory hover:bg-white/5")}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-ink-2 p-6">
              <SectionLabel className="mb-3 text-xs">پروفایل</SectionLabel>
              <p className="font-serif text-xl text-ivory">{user.fullName}</p>
              <p className="mt-1 text-xs text-mist">عضویت: {new Date(user.createdAt).toLocaleDateString("fa-IR")}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-ink-3 p-3"><p className="text-lg font-bold text-champagne">{myBookings.length}</p><p className="text-xs text-mist">کل نوبت‌ها</p></div>
                <div className="rounded-xl bg-ink-3 p-3"><p className="text-lg font-bold text-emerald-300">{upcoming.length}</p><p className="text-xs text-mist">نوبت آینده</p></div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-ink-2 p-6">
              <h4 className="font-bold text-ivory">نوبت‌های آینده</h4>
              {upcoming.length === 0 ? <p className="mt-3 text-xs text-mist">نوبتی ثبت نشده</p> : (
                <ul className="mt-3 space-y-2">
                  {upcoming.slice(0, 3).map((b) => {
                    const svc = getServiceById(b.serviceId);
                    return <li key={b.id} className="rounded-lg border border-white/5 bg-ink-3 p-3 text-xs"><p className="font-bold text-ivory">{svc?.nameFa} · {b.timeSlot}</p><p className="text-mist">{isoToJalaliDisplay(b.date)}</p><span className={cn("mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px]", BOOKING_STATUSES[b.status].color)}>{BOOKING_STATUSES[b.status].label}</span></li>;
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-ink-2 p-6">
              <h4 className="font-bold text-ivory">اعلان‌ها</h4>
              {myNotifications.length === 0 ? <p className="mt-3 text-xs text-mist">پیامی ندارید</p> : (
                <ul className="mt-3 space-y-2">
                  {myNotifications.map((n) => (
                    <li key={n.id} className="rounded-lg bg-ink-3 p-3 text-xs"><p className="font-bold text-ivory">{n.title}</p><p className="text-ivory-2/80">{n.message}</p></li>
                  ))}
                </ul>
              )}
              {myHistory.length > 0 && <div className="mt-4 rounded-lg bg-champagne/10 p-3 text-xs text-champagne">آخرین خدمت: {myHistory[0]?.serviceName} در {isoToJalaliDisplay(myHistory[0]?.date)}</div>}
            </div>

            <div className="md:col-span-3 rounded-2xl border border-white/10 bg-ink-2 p-6">
              <h4 className="font-bold text-ivory">آخرین خدمات دریافت‌شده</h4>
              {myHistory.length === 0 ? <p className="mt-3 text-xs text-mist">تاریخچه‌ای ثبت نشده</p> : (
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {myHistory.slice(0, 3).map((h) => (
                    <div key={h.id} className="rounded-xl border border-white/5 bg-ink-3 p-3">
                      <p className="text-xs font-bold text-ivory">{h.serviceName}</p>
                      <p className="text-xs text-mist">{isoToJalaliDisplay(h.date)} · {h.specialistName}</p>
                      {h.beforeImage && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <img src={h.beforeImage} alt="قبل" className="h-20 w-full rounded-lg object-cover" />
                          <img src={h.afterImage} alt="بعد" className="h-20 w-full rounded-lg object-cover" />
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
          <div className="mt-8">
            <div className="grid gap-3">
              {myBookings.map((b) => {
                const svc = getServiceById(b.serviceId);
                const cat = getCategoryById(b.categoryId);
                const sp = specialists.find((s) => s.id === b.specialistId);
                return (
                  <div key={b.id} className="rounded-2xl border border-white/10 bg-ink-2 p-4 md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-serif text-lg text-ivory">{svc?.nameFa} <span className="text-xs text-mist">· {cat?.nameFa}</span></p>
                        <p className="mt-1 text-xs text-ivory-2/80">{isoToJalaliDisplay(b.date)} ساعت {b.timeSlot} · متخصص: {sp?.name}</p>
                        <p className="mt-1 text-xs text-mist">{formatToman(b.totalPrice)} · بیعانه {formatToman(b.depositAmount)} · باقی‌مانده {formatToman(b.remainingAmount)}</p>
                        {b.notes && <p className="mt-2 text-xs text-ivory-2/80">یادداشت: {b.notes}</p>}
                      </div>
                      <span className={cn("rounded-full border px-3 py-1 text-xs", BOOKING_STATUSES[b.status].color)}>{BOOKING_STATUSES[b.status].label}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span className="text-xs text-mist">شناسه: {b.id.slice(0, 8)}</span>
                      <span className="text-xs text-mist">· پرداخت: {b.paymentStatus}</span>
                    </div>
                  </div>
                );
              })}
              {myBookings.length === 0 && <p className="py-12 text-center text-sm text-mist">هنوز نوبتی ثبت نکرده‌اید.</p>}
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="mt-8">
            <div className="relative border-r border-white/10 pr-6">
              {myHistory.length === 0 ? <p className="text-sm text-mist">تاریخچه‌ای وجود ندارد. پس از انجام هر خدمت، پرونده شما اینجا ثبت می‌شود.</p> : (
                myHistory.map((h) => (
                  <div key={h.id} className="relative mb-6">
                    <span className="absolute -right-[29px] top-2 h-3 w-3 rounded-full bg-champagne" />
                    <div className="rounded-xl border border-white/10 bg-ink-2 p-4">
                      <p className="font-bold text-ivory">{h.serviceName} · {getCategoryById(h.categoryId)?.nameFa}</p>
                      <p className="text-xs text-mist">{isoToJalaliDisplay(h.date)} · {h.specialistName} · {formatToman(h.pricePaid)}</p>
                      {h.description && <p className="mt-2 text-xs leading-relaxed text-ivory-2/80">{h.description}</p>}
                      {(h.beforeImage || h.afterImage) && (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          {h.beforeImage && <div><p className="text-[11px] text-mist">قبل</p><img src={h.beforeImage} alt="قبل" className="mt-1 h-24 w-full rounded-lg object-cover" /></div>}
                          {h.afterImage && <div><p className="text-[11px] text-mist">بعد</p><img src={h.afterImage} alt="بعد" className="mt-1 h-24 w-full rounded-lg object-cover" /></div>}
                        </div>
                      )}
                      <span className="mt-2 inline-block rounded-full bg-white/5 px-2 py-1 text-[11px] text-mist">{h.status === "completed" ? "تکمیل شده" : "در جریان"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div className="mt-8 grid gap-3">
            {myBookings.map((b) => (
              <div key={b.id} className="flex justify-between rounded-xl border border-white/10 bg-ink-2 p-4 text-sm">
                <div>
                  <p className="font-bold text-ivory">{getServiceById(b.serviceId)?.nameFa}</p>
                  <p className="text-xs text-mist">{isoToJalaliDisplay(b.date)} · {b.timeSlot}</p>
                </div>
                <div className="text-right">
                  <p className="text-champagne">{formatToman(b.totalPrice)}</p>
                  <p className="text-xs text-mist">بیعانه {formatToman(b.depositAmount)} · {b.paymentStatus}</p>
                </div>
              </div>
            ))}
            {myBookings.length === 0 && <p className="text-center text-sm text-mist">تراکنشی یافت نشد.</p>}
          </div>
        )}

        {tab === "profile" && (
          <div className="mt-8 max-w-lg rounded-2xl border border-white/10 bg-ink-2 p-6">
            <h4 className="font-bold text-ivory">ویرایش پروفایل</h4>
            <div className="mt-4 grid gap-4">
              <label className="block"><span className="text-xs text-mist">نام کامل</span><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-3 p-3 text-sm text-ivory outline-none focus:border-champagne" /></label>
              <label className="block"><span className="text-xs text-mist">موبایل</span><input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-3 p-3 text-sm text-ivory outline-none focus:border-champagne" /></label>
              <label className="block"><span className="text-xs text-mist">ایمیل</span><input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-3 p-3 text-sm text-ivory outline-none focus:border-champagne" /></label>
              <label className="block"><span className="text-xs text-mist">آواتار URL</span><input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." dir="ltr" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-3 p-3 text-sm text-ivory outline-none focus:border-champagne" /></label>
              {avatar && <img src={avatar} alt="avatar" className="h-20 w-20 rounded-full object-cover" />}
              <button
                onClick={() => { updateCustomer(user.id, { fullName, phone, email, avatar, name: fullName.split(" ")[0] }); setEditMode(false); alert("پروفایل به‌روزرسانی شد"); }}
                className="rounded-full bg-champagne py-3 text-sm font-bold text-ink"
              >
                ذخیره تغییرات
              </button>
              <p className="text-xs text-mist">اطلاعات شما محرمانه است و فقط برای مدیریت رزروها استفاده می‌شود.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
