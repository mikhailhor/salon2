import { useMemo, useState } from "react";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { formatToman, formatDuration, BOOKING_STATUSES } from "@/lib/format";
import { isoToJalaliDisplay } from "@/lib/jalali";
import { cn } from "@/utils/cn";
import { uid } from "@/lib/storage";

type Tab = "dashboard" | "categories" | "services" | "lookbook" | "bookings" | "customers" | "specialists" | "media" | "cms" | "finance" | "settings" | "audit";

export default function AdminPanel({ onClose }: { onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const { user, logout } = useAuth();
  const data = useData();
  const { bookings, customers, services, categories, specialists, lookbook, auditLogs } = data;

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayBookings = bookings.filter((b) => b.date === todayStr).length;
    const pending = bookings.filter((b) => b.status === "pending" || b.status === "awaiting_payment").length;
    const revenue = bookings.filter((b) => b.status === "completed" || b.status === "confirmed").reduce((sum, b) => sum + b.totalPrice, 0);
    const deposits = bookings.reduce((sum, b) => sum + b.depositAmount, 0);
    return { totalBookings: bookings.length, todayBookings, pending, revenue, deposits, customers: customers.length, services: services.length };
  }, [bookings, customers, services]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "داشبورد" },
    { id: "categories", label: "دسته‌بندی‌ها" },
    { id: "services", label: "خدمات" },
    { id: "lookbook", label: "لُک‌بوک" },
    { id: "bookings", label: "رزروها" },
    { id: "customers", label: "مشتریان" },
    { id: "specialists", label: "متخصصان" },
    { id: "media", label: "رسانه" },
    { id: "cms", label: "محتوای سایت" },
    { id: "finance", label: "مالی" },
    { id: "settings", label: "تنظیمات" },
    { id: "audit", label: "گزارش‌ها" },
  ];

  if (user?.role !== "admin") {
    return <div className="p-12 text-center text-ivory">دسترسی محدود به مدیران است. لطفاً با حساب ادمین وارد شوید (09120000000 / admin123).</div>;
  }

  return (
    <div className="min-h-screen bg-ink text-ivory">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-ink px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-champagne px-3 py-1 text-xs font-bold text-ink">پنل مدیریت لیندا</span>
          <span className="hidden text-xs text-mist md:inline">مدیر: {user.fullName}</span>
        </div>
        <div className="flex gap-2">
          {onClose && <button onClick={onClose} className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-ivory">بازگشت به سایت</button>}
          <button onClick={logout} className="rounded-full bg-white/5 px-4 py-1.5 text-xs text-ivory">خروج</button>
        </div>
      </div>

      <div className="flex">
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-56 shrink-0 overflow-y-auto border-l border-white/10 bg-ink-2 p-3 md:block">
          <nav className="grid gap-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={cn("rounded-lg px-3 py-2.5 text-right text-xs font-bold tracking-wide", tab === t.id ? "bg-champagne text-ink" : "text-ivory hover:bg-white/5")}>
                {t.label}
              </button>
            ))}
          </nav>
          <p className="mt-6 text-[11px] leading-relaxed text-mist">تمام تغییرات به صورت آنی در سایت اعمال می‌شوند و در حالت سینمایی و معمولی هماهنگ هستند.</p>
        </aside>

        <div className="flex-1">
          {/* mobile tabs */}
          <div className="flex gap-2 overflow-x-auto border-b border-white/10 bg-ink-2 p-3 md:hidden">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={cn("whitespace-nowrap rounded-full px-3 py-1.5 text-xs", tab === t.id ? "bg-champagne text-ink font-bold" : "border border-white/10 text-ivory")}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {tab === "dashboard" && <DashboardTab stats={stats} />}
            {tab === "categories" && <CategoriesTab />}
            {tab === "services" && <ServicesTab />}
            {tab === "lookbook" && <LookbookTab />}
            {tab === "bookings" && <BookingsTab />}
            {tab === "customers" && <CustomersTab />}
            {tab === "specialists" && <SpecialistsTab />}
            {tab === "media" && <MediaTab />}
            {tab === "cms" && <CmsTab />}
            {tab === "finance" && <FinanceTab />}
            {tab === "settings" && <SettingsTab />}
            {tab === "audit" && (
              <div className="space-y-2">
                <h3 className="font-serif text-xl text-ivory">گزارش عملیات (Audit Log)</h3>
                <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-white/10 bg-ink-2 p-3">
                  {auditLogs.length === 0 ? <p className="text-xs text-mist">هنوز عملیاتی ثبت نشده</p> : auditLogs.slice(0, 50).map((log) => (
                    <div key={log.id} className="flex justify-between border-b border-white/5 py-2 text-xs">
                      <span className="text-ivory">{log.action} · {log.entity} {log.entityId.slice(0, 6)}</span>
                      <span className="text-mist">{new Date(log.timestamp).toLocaleString("fa-IR")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardTab({ stats }: { stats: any }) {
  const { bookings } = useData();
  const recent = bookings.slice(0, 5);
  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl text-ivory">داشبورد مدیریتی</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "کل رزروها", value: stats.totalBookings },
          { label: "رزروهای امروز", value: stats.todayBookings },
          { label: "در انتظار تأیید", value: stats.pending },
          { label: "مشتریان", value: stats.customers },
          { label: "درآمد کل", value: formatToman(stats.revenue) },
          { label: "بیعانه‌ها", value: formatToman(stats.deposits) },
          { label: "خدمات فعال", value: stats.services },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-ink-2 p-4">
            <p className="text-xs text-mist">{s.label}</p>
            <p className="mt-2 text-lg font-bold text-ivory">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/10 bg-ink-2 p-4">
        <h4 className="font-bold text-ivory">رزروهای اخیر</h4>
        <div className="mt-3 grid gap-2">
          {recent.map((b) => (
            <div key={b.id} className="flex justify-between rounded-lg bg-ink-3 p-3 text-xs">
              <span className="text-ivory">{b.customerName} · {b.timeSlot}</span>
              <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", BOOKING_STATUSES[b.status].color)}>{BOOKING_STATUSES[b.status].label}</span>
            </div>
          ))}
          {recent.length === 0 && <p className="text-xs text-mist">رزروی وجود ندارد</p>}
        </div>
      </div>
    </div>
  );
}

function CategoriesTab() {
  const { categories, addCategory, updateCategory, deleteCategory, moveCategoryOrder, services, lookbook } = useData();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [newMode, setNewMode] = useState(false);
  const [newForm, setNewForm] = useState({ nameFa: "", nameEn: "", slug: "", descriptionFa: "", image: "", parentId: "" as string | null });

  const mainCats = categories.filter((c) => !c.parentId).sort((a, b) => a.order - b.order);
  const subCatsOf = (parentId: string) => categories.filter((c) => c.parentId === parentId).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-ivory">مدیریت دسته‌بندی‌ها (Centralized)</h2>
        <button onClick={() => setNewMode(true)} className="rounded-full bg-champagne px-4 py-2 text-xs font-bold text-ink">+ دسته جدید</button>
      </div>
      <p className="text-xs leading-relaxed text-mist">این دسته‌بندی‌ها در آتلیه، لُک‌بوک و رزرو به صورت یکپارچه استفاده می‌شوند. حذف دسته دارای وابستگی با اخطار انجام می‌شود.</p>

      {newMode && (
        <div className="rounded-xl border border-champagne/20 bg-champagne/5 p-4">
          <h4 className="font-bold text-ivory">افزودن دسته جدید</h4>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input placeholder="نام فارسی" value={newForm.nameFa} onChange={(e) => setNewForm({ ...newForm, nameFa: e.target.value })} className="rounded-lg border border-white/10 bg-ink-3 p-2 text-sm text-ivory" />
            <input placeholder="نام انگلیسی" value={newForm.nameEn} onChange={(e) => setNewForm({ ...newForm, nameEn: e.target.value })} className="rounded-lg border border-white/10 bg-ink-3 p-2 text-sm text-ivory" />
            <input placeholder="slug (مثال: hair-color)" value={newForm.slug} onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })} className="rounded-lg border border-white/10 bg-ink-3 p-2 text-sm text-ivory" />
            <input placeholder="تصویر URL" value={newForm.image} onChange={(e) => setNewForm({ ...newForm, image: e.target.value })} className="rounded-lg border border-white/10 bg-ink-3 p-2 text-sm text-ivory" />
            <input placeholder="توضیح فارسی" value={newForm.descriptionFa} onChange={(e) => setNewForm({ ...newForm, descriptionFa: e.target.value })} className="md:col-span-2 rounded-lg border border-white/10 bg-ink-3 p-2 text-sm text-ivory" />
            <select value={newForm.parentId || ""} onChange={(e) => setNewForm({ ...newForm, parentId: e.target.value || null })} className="rounded-lg border border-white/10 bg-ink-3 p-2 text-sm text-ivory">
              <option value="">بدون والد (دسته اصلی)</option>
              {mainCats.map((c) => <option key={c.id} value={c.id}>{c.nameFa}</option>)}
            </select>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { addCategory({ nameFa: newForm.nameFa || "دسته جدید", nameEn: newForm.nameEn || "New", slug: newForm.slug || `cat-${Date.now()}`, descriptionFa: newForm.descriptionFa, image: newForm.image || "/images/services/color.jpg", parentId: newForm.parentId }); setNewMode(false); setNewForm({ nameFa: "", nameEn: "", slug: "", descriptionFa: "", image: "", parentId: null }); }} className="rounded-full bg-champagne px-4 py-2 text-xs font-bold text-ink">ذخیره</button>
            <button onClick={() => setNewMode(false)} className="rounded-full border border-white/10 px-4 py-2 text-xs text-ivory">انصراف</button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {mainCats.map((cat) => {
          const svcCount = services.filter((s) => s.categoryId === cat.id).length;
          const lbCount = lookbook.filter((l) => l.categoryId === cat.id).length;
          const subs = subCatsOf(cat.id);
          const isEditing = editing === cat.id;
          return (
            <div key={cat.id} className="rounded-xl border border-white/10 bg-ink-2 p-4">
              {isEditing ? (
                <div className="grid gap-2 md:grid-cols-3">
                  <input value={form.nameFa} onChange={(e) => setForm({ ...form, nameFa: e.target.value })} className="rounded-lg border border-white/10 bg-ink-3 p-2 text-sm text-ivory" placeholder="نام فارسی" />
                  <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="rounded-lg border border-white/10 bg-ink-3 p-2 text-sm text-ivory" placeholder="نام انگلیسی" />
                  <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="rounded-lg border border-white/10 bg-ink-3 p-2 text-sm text-ivory" placeholder="تصویر" />
                  <input value={form.descriptionFa} onChange={(e) => setForm({ ...form, descriptionFa: e.target.value })} className="md:col-span-3 rounded-lg border border-white/10 bg-ink-3 p-2 text-sm text-ivory" placeholder="توضیح" />
                  <div className="flex gap-2">
                    <button onClick={() => { updateCategory(cat.id, form); setEditing(null); }} className="rounded-full bg-champagne px-4 py-1 text-xs font-bold text-ink">ذخیره</button>
                    <button onClick={() => setEditing(null)} className="rounded-full border border-white/10 px-4 py-1 text-xs text-ivory">انصراف</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <img src={cat.image} alt={cat.nameFa} className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-bold text-ivory">{cat.nameFa} <span className="text-xs text-mist">/ {cat.nameEn}</span></p>
                    <p className="text-xs text-mist">{cat.slug} · {svcCount} خدمت · {lbCount} نمونه‌کار · {subs.length} زیردسته</p>
                    <p className="mt-1 text-xs text-ivory-2/80">{cat.descriptionFa}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => { setForm(cat); setEditing(cat.id); }} className="rounded-full border border-white/10 px-3 py-1 text-xs text-ivory">ویرایش</button>
                    <button onClick={() => moveCategoryOrder(cat.id, "up")} className="rounded-full border border-white/10 px-3 py-1 text-xs text-ivory">↑</button>
                    <button onClick={() => moveCategoryOrder(cat.id, "down")} className="rounded-full border border-white/10 px-3 py-1 text-xs text-ivory">↓</button>
                    <button onClick={() => { const res = deleteCategory(cat.id); if (!res.ok) alert(res.message); }} className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-300">حذف</button>
                    <label className="flex items-center gap-1 text-xs text-mist"><input type="checkbox" checked={cat.isActive} onChange={(e) => updateCategory(cat.id, { isActive: e.target.checked })} /> فعال</label>
                  </div>
                </div>
              )}
              {subs.length > 0 && (
                <div className="mt-3 grid gap-2 border-t border-white/5 pt-3">
                  {subs.map((sub) => {
                    const isSubEditing = editing === sub.id;
                    return (
                      <div key={sub.id} className="flex items-center justify-between rounded-lg bg-ink-3 p-2">
                        {isSubEditing ? (
                          <div className="flex flex-1 gap-2">
                            <input value={form.nameFa} onChange={(e) => setForm({ ...form, nameFa: e.target.value })} className="flex-1 rounded border border-white/10 bg-ink p-1 text-xs text-ivory" />
                            <button onClick={() => { updateCategory(sub.id, form); setEditing(null); }} className="rounded bg-champagne px-2 py-1 text-xs text-ink">ذخیره</button>
                            <button onClick={() => setEditing(null)} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">✕</button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs text-ivory">↳ {sub.nameFa} <span className="text-mist">/ {sub.nameEn}</span></span>
                            <span className="flex gap-1">
                              <button onClick={() => { setForm(sub); setEditing(sub.id); }} className="text-xs text-champagne">ویرایش</button>
                              <button onClick={() => { const r = deleteCategory(sub.id); if (!r.ok) alert(r.message); }} className="text-xs text-red-300">حذف</button>
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ServicesTab() {
  const { services, categories, updateService, deleteService, addService, moveServiceOrder, specialists } = useData();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [showAdd, setShowAdd] = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  const filtered = filterCat === "all" ? services : services.filter((s) => s.categoryId === filterCat || s.subCategoryId === filterCat);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <h2 className="font-serif text-xl text-ivory">مدیریت خدمات</h2>
        <button onClick={() => setShowAdd(true)} className="rounded-full bg-champagne px-4 py-2 text-xs font-bold text-ink">+ خدمت جدید</button>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        <button onClick={() => setFilterCat("all")} className={cn("rounded-full px-3 py-1 text-xs", filterCat === "all" ? "bg-champagne text-ink" : "border border-white/10 text-ivory")}>همه</button>
        {categories.filter((c) => !c.parentId).map((c) => (
          <button key={c.id} onClick={() => setFilterCat(c.id)} className={cn("rounded-full px-3 py-1 text-xs", filterCat === c.id ? "bg-champagne text-ink" : "border border-white/10 text-ivory")}>{c.nameFa}</button>
        ))}
      </div>

      {showAdd && (
        <div className="rounded-xl border border-champagne/20 bg-champagne/5 p-4">
          <h4 className="font-bold text-ivory">خدمت جدید</h4>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <input placeholder="نام فارسی" value={form.nameFa || ""} onChange={(e) => setForm({ ...form, nameFa: e.target.value })} className="rounded border border-white/10 bg-ink-3 p-2 text-sm text-ivory" />
            <input placeholder="نام انگلیسی" value={form.nameEn || ""} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="rounded border border-white/10 bg-ink-3 p-2 text-sm text-ivory" />
            <select value={form.categoryId || ""} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="rounded border border-white/10 bg-ink-3 p-2 text-sm text-ivory">
              <option value="">انتخاب دسته</option>
              {categories.filter((c) => !c.parentId).map((c) => <option key={c.id} value={c.id}>{c.nameFa}</option>)}
            </select>
            <input placeholder="قیمت (تومان)" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="rounded border border-white/10 bg-ink-3 p-2 text-sm text-ivory" />
            <input placeholder="مدت (دقیقه)" value={form.durationMinutes || ""} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} className="rounded border border-white/10 bg-ink-3 p-2 text-sm text-ivory" />
            <input placeholder="تصویر URL" value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} className="rounded border border-white/10 bg-ink-3 p-2 text-sm text-ivory" />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { addService(form); setShowAdd(false); setForm({}); }} className="rounded-full bg-champagne px-4 py-1 text-xs font-bold text-ink">ذخیره</button>
            <button onClick={() => setShowAdd(false)} className="rounded-full border border-white/10 px-4 py-1 text-xs text-ivory">انصراف</button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {filtered.sort((a, b) => a.order - b.order).map((svc) => {
          const cat = categories.find((c) => c.id === svc.categoryId);
          const isEditing = editing === svc.id;
          return (
            <div key={svc.id} className="rounded-xl border border-white/10 bg-ink-2 p-3">
              {isEditing ? (
                <div className="grid gap-2 md:grid-cols-3">
                  <input value={form.nameFa} onChange={(e) => setForm({ ...form, nameFa: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory" />
                  <input value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="rounded bg-ink-3 p-2 text-sm text-ivory" />
                  <input value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} className="rounded bg-ink-3 p-2 text-sm text-ivory" />
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-3 rounded bg-ink-3 p-2 text-sm text-ivory" />
                  <label className="flex items-center gap-1 text-xs text-mist"><input type="checkbox" checked={form.bookingEnabled} onChange={(e) => setForm({ ...form, bookingEnabled: e.target.checked })} /> رزرو فعال</label>
                  <label className="flex items-center gap-1 text-xs text-mist"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> نمایش</label>
                  <label className="flex items-center gap-1 text-xs text-mist"><input type="checkbox" checked={form.depositEnabled} onChange={(e) => setForm({ ...form, depositEnabled: e.target.checked })} /> بیعانه</label>
                  {form.depositEnabled && (
                    <>
                      <select value={form.depositType} onChange={(e) => setForm({ ...form, depositType: e.target.value })} className="rounded bg-ink-3 p-2 text-xs text-ivory"><option value="percent">درصد</option><option value="fixed">ثابت</option></select>
                      <input value={form.depositValue} onChange={(e) => setForm({ ...form, depositValue: Number(e.target.value) })} className="rounded bg-ink-3 p-2 text-xs text-ivory" />
                    </>
                  )}
                  <div className="flex gap-2 md:col-span-3">
                    <button onClick={() => { updateService(svc.id, form); setEditing(null); }} className="rounded bg-champagne px-3 py-1 text-xs font-bold text-ink">ذخیره</button>
                    <button onClick={() => setEditing(null)} className="rounded border border-white/10 px-3 py-1 text-xs text-ivory">انصراف</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <img src={svc.image} alt={svc.nameFa} className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-ivory">{svc.nameFa} <span className="text-xs text-mist">· {cat?.nameFa}</span></p>
                    <p className="text-xs text-champagne">{formatToman(svc.price)} · {formatDuration(svc.durationMinutes)} {svc.depositEnabled ? `· بیعانه ${svc.depositType === "percent" ? `${svc.depositValue}%` : formatToman(svc.depositValue)}` : ""}</p>
                    <p className="text-xs text-ivory-2/80">{svc.description}</p>
                    <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[10px]", svc.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-mist")}>{svc.isActive ? "فعال" : "غیرفعال"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => { setForm(svc); setEditing(svc.id); }} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">ویرایش</button>
                    <button onClick={() => moveServiceOrder(svc.id, "up")} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">↑</button>
                    <button onClick={() => moveServiceOrder(svc.id, "down")} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">↓</button>
                    <button onClick={() => deleteService(svc.id)} className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-300">حذف</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LookbookTab() {
  const { lookbook, categories, services, addLookbook, updateLookbook, deleteLookbook } = useData();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="font-serif text-xl text-ivory">لُک‌بوک</h2>
        <button onClick={() => setShowAdd(true)} className="rounded-full bg-champagne px-4 py-2 text-xs font-bold text-ink">+ نمونه‌کار</button>
      </div>
      {showAdd && (
        <div className="rounded-xl border border-champagne/20 bg-champagne/5 p-4">
          <h4 className="font-bold text-ivory">افزودن نمونه‌کار</h4>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <input placeholder="عنوان فارسی" value={form.titleFa || ""} onChange={(e) => setForm({ ...form, titleFa: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory" />
            <select value={form.categoryId || ""} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory">
              <option value="">دسته</option>
              {categories.filter((c) => !c.parentId).map((c) => <option key={c.id} value={c.id}>{c.nameFa}</option>)}
            </select>
            <input placeholder="تصویر قبل URL" value={form.beforeImage || ""} onChange={(e) => setForm({ ...form, beforeImage: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory" />
            <input placeholder="تصویر بعد URL" value={form.afterImage || ""} onChange={(e) => setForm({ ...form, afterImage: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory" />
            <select value={form.serviceId || ""} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory">
              <option value="">خدمت (اختیاری)</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.nameFa}</option>)}
            </select>
            <label className="flex items-center gap-1 text-xs text-mist"><input type="checkbox" checked={form.featured || false} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> ویژه</label>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { addLookbook(form); setShowAdd(false); setForm({}); }} className="rounded bg-champagne px-4 py-1 text-xs font-bold text-ink">ذخیره</button>
            <button onClick={() => setShowAdd(false)} className="rounded border border-white/10 px-4 py-1 text-xs text-ivory">انصراف</button>
          </div>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {lookbook.map((item) => {
          const cat = categories.find((c) => c.id === item.categoryId);
          const isEditing = editing === item.id;
          return (
            <div key={item.id} className="rounded-xl border border-white/10 bg-ink-2 p-3">
              {isEditing ? (
                <div className="grid gap-2">
                  <input value={form.titleFa} onChange={(e) => setForm({ ...form, titleFa: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory" />
                  <input value={form.beforeImage} onChange={(e) => setForm({ ...form, beforeImage: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory" placeholder="قبل" />
                  <input value={form.afterImage} onChange={(e) => setForm({ ...form, afterImage: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory" placeholder="بعد" />
                  <div className="flex gap-2">
                    <button onClick={() => { updateLookbook(item.id, form); setEditing(null); }} className="rounded bg-champagne px-3 py-1 text-xs font-bold text-ink">ذخیره</button>
                    <button onClick={() => setEditing(null)} className="rounded border border-white/10 px-3 py-1 text-xs text-ivory">انصراف</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <img src={item.beforeImage} alt="before" className="h-20 w-1/2 rounded object-cover" />
                    <img src={item.afterImage} alt="after" className="h-20 w-1/2 rounded object-cover" />
                  </div>
                  <p className="mt-2 text-sm font-bold text-ivory">{item.titleFa} <span className="text-xs text-mist">· {cat?.nameFa}</span></p>
                  <p className="text-xs text-ivory-2/80">{item.description}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => { setForm(item); setEditing(item.id); }} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">ویرایش</button>
                    <button onClick={() => deleteLookbook(item.id)} className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-300">حذف</button>
                    <button onClick={() => updateLookbook(item.id, { featured: !item.featured })} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">{item.featured ? "حذف ویژه" : "ویژه کن"}</button>
                    <button onClick={() => updateLookbook(item.id, { isActive: !item.isActive })} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">{item.isActive ? "غیرفعال" : "فعال"}</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BookingsTab() {
  const { bookings, updateBookingStatus, updateBooking, deleteBooking, getServiceById, getCategoryById, customers, specialists, addHistory } = useData();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = bookings.filter((b) => {
    if (filterStatus !== "all" && b.status !== filterStatus) return false;
    if (filterDate && b.date !== filterDate) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl text-ivory">مدیریت رزروها</h2>
      <div className="flex flex-wrap gap-2">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-full border border-white/10 bg-ink-3 px-3 py-1.5 text-xs text-ivory">
          <option value="all">همه وضعیت‌ها</option>
          {Object.entries(BOOKING_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="rounded-full border border-white/10 bg-ink-3 px-3 py-1.5 text-xs text-ivory" />
        <span className="px-2 py-1 text-xs text-mist">{filtered.length} رزرو</span>
      </div>

      <div className="grid gap-3">
        {filtered.map((b) => {
          const svc = getServiceById(b.serviceId);
          const isSel = selected === b.id;
          return (
            <div key={b.id} className="rounded-xl border border-white/10 bg-ink-2 p-3">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-ivory">{b.customerName} · {svc?.nameFa} <span className="text-xs text-mist">· {getCategoryById(b.categoryId)?.nameFa}</span></p>
                  <p className="text-xs text-ivory-2/80">{isoToJalaliDisplay(b.date)} ساعت {b.timeSlot} · متخصص: {specialists.find((s) => s.id === b.specialistId)?.name}</p>
                  <p className="text-xs text-champagne">{formatToman(b.totalPrice)} · بیعانه {formatToman(b.depositAmount)} · {b.paymentStatus}</p>
                </div>
                <span className={cn("h-fit rounded-full border px-2 py-1 text-xs", BOOKING_STATUSES[b.status].color)}>{BOOKING_STATUSES[b.status].label}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {Object.entries(BOOKING_STATUSES).map(([k, v]) => (
                  <button key={k} onClick={() => updateBookingStatus(b.id, k as any)} className={cn("rounded-full px-2 py-1 text-[11px]", b.status === k ? "bg-champagne text-ink font-bold" : "border border-white/10 text-ivory")}>{v.label}</button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => setSelected(isSel ? null : b.id)} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">جزئیات</button>
                <button onClick={() => {
                  // mark completed and add to history
                  if (confirm("آیا این رزرو به تاریخچه زیبایی مشتری اضافه شود؟")) {
                    updateBookingStatus(b.id, "completed");
                    addHistory({
                      customerId: b.customerId,
                      bookingId: b.id,
                      serviceId: b.serviceId,
                      categoryId: b.categoryId,
                      date: b.date,
                      jalaliDate: b.jalaliDate,
                      specialistId: b.specialistId,
                      specialistName: specialists.find((s) => s.id === b.specialistId)?.name || "",
                      serviceName: svc?.nameFa || "",
                      description: `انجام خدمت ${svc?.nameFa}`,
                      pricePaid: b.totalPrice,
                      status: "completed",
                    });
                  }
                }} className="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">ثبت انجام‌شده</button>
                <button onClick={() => deleteBooking(b.id)} className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-300">حذف</button>
              </div>
              {isSel && (
                <div className="mt-3 rounded-lg bg-ink-3 p-3 text-xs">
                  <p className="text-ivory">تلفن: {b.customerPhone} · ایمیل: {b.customerEmail || "—"}</p>
                  <p className="text-mist">یادداشت: {b.notes || "—"}</p>
                  <p className="text-mist">شناسه: {b.id}</p>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-mist">رزروی یافت نشد</p>}
      </div>
    </div>
  );
}

function CustomersTab() {
  const { customers, bookings, history, addCustomerNote, updateCustomer } = useData();
  const [selected, setSelected] = useState<string | null>(null);
  const sel = customers.find((c) => c.id === selected);
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl text-ivory">مدیریت مشتریان</h2>
      <div className="grid gap-2 md:grid-cols-2">
        {customers.map((c) => {
          const bks = bookings.filter((b) => b.customerId === c.id);
          return (
            <div key={c.id} className="rounded-xl border border-white/10 bg-ink-2 p-3">
              <p className="font-bold text-ivory">{c.fullName} <span className="text-xs text-mist">({c.role})</span></p>
              <p className="text-xs text-ivory-2/80">{c.phone} {c.email ? `· ${c.email}` : ""}</p>
              <p className="text-xs text-mist">{bks.length} رزرو · {history.filter((h) => h.customerId === c.id).length} تاریخچه</p>
              <div className="mt-2 flex gap-1">
                <button onClick={() => setSelected(c.id)} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">پرونده</button>
                <button onClick={() => { const note = prompt("یادداشت:", c.notes || ""); if (note !== null) addCustomerNote(c.id, note); }} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">یادداشت</button>
              </div>
            </div>
          );
        })}
      </div>
      {sel && (
        <div className="rounded-xl border border-champagne/20 bg-ink-2 p-4">
          <div className="flex justify-between">
            <h4 className="font-bold text-ivory">پرونده {sel.fullName}</h4>
            <button onClick={() => setSelected(null)} className="text-xs text-mist">بستن</button>
          </div>
          <p className="mt-2 text-xs text-mist">عضویت: {new Date(sel.createdAt).toLocaleString("fa-IR")}</p>
          <div className="mt-3 grid gap-2">
            <p className="text-xs text-ivory">رزروها:</p>
            {bookings.filter((b) => b.customerId === sel.id).map((b) => (
              <div key={b.id} className="rounded bg-ink-3 p-2 text-xs text-ivory">{b.date} {b.timeSlot} · {b.status}</div>
            ))}
            <p className="text-xs text-ivory">تاریخچه:</p>
            {history.filter((h) => h.customerId === sel.id).map((h) => (
              <div key={h.id} className="rounded bg-ink-3 p-2 text-xs text-ivory">{h.serviceName} · {h.jalaliDate}</div>
            ))}
            {sel.notes && <p className="rounded bg-amber-300/10 p-2 text-xs text-amber-200">یادداشت مدیر: {sel.notes}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function SpecialistsTab() {
  const { specialists, addSpecialist, updateSpecialist, deleteSpecialist, categories } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<any>({});
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="font-serif text-xl text-ivory">متخصصان</h2>
        <button onClick={() => setShowAdd(true)} className="rounded-full bg-champagne px-4 py-2 text-xs font-bold text-ink">+ متخصص</button>
      </div>
      {showAdd && (
        <div className="rounded-xl border border-champagne/20 bg-champagne/5 p-4">
          <div className="grid gap-2 md:grid-cols-2">
            <input placeholder="نام" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory" />
            <input placeholder="نقش" value={form.role || ""} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory" />
            <input placeholder="تصویر URL" value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory" />
            <input placeholder="بیو" value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="rounded bg-ink-3 p-2 md:col-span-2 text-sm text-ivory" />
          </div>
          <div className="mt-2">
            <p className="text-xs text-mist">دسته‌های قابل ارائه:</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {categories.filter((c) => !c.parentId).map((c) => (
                <label key={c.id} className="flex items-center gap-1 rounded bg-ink-3 px-2 py-1 text-xs text-ivory"><input type="checkbox" checked={form.categoryIds?.includes(c.id) || false} onChange={(e) => {
                  const arr = form.categoryIds || [];
                  if (e.target.checked) setForm({ ...form, categoryIds: [...arr, c.id] });
                  else setForm({ ...form, categoryIds: arr.filter((x: string) => x !== c.id) });
                }} />{c.nameFa}</label>
              ))}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { addSpecialist(form); setShowAdd(false); setForm({}); }} className="rounded bg-champagne px-4 py-1 text-xs font-bold text-ink">ذخیره</button>
            <button onClick={() => setShowAdd(false)} className="rounded border border-white/10 px-4 py-1 text-xs text-ivory">انصراف</button>
          </div>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        {specialists.map((sp) => {
          const isEditing = editing === sp.id;
          return (
            <div key={sp.id} className="rounded-xl border border-white/10 bg-ink-2 p-3">
              {isEditing ? (
                <div className="grid gap-2">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory" />
                  <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory" />
                  <input value={form.capacityPerSlot} onChange={(e) => setForm({ ...form, capacityPerSlot: Number(e.target.value) })} className="rounded bg-ink-3 p-2 text-sm text-ivory" placeholder="ظرفیت" />
                  <div className="flex gap-2">
                    <button onClick={() => { updateSpecialist(sp.id, form); setEditing(null); }} className="rounded bg-champagne px-3 py-1 text-xs font-bold text-ink">ذخیره</button>
                    <button onClick={() => setEditing(null)} className="rounded border border-white/10 px-3 py-1 text-xs text-ivory">انصراف</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-3">
                    <img src={sp.image} alt={sp.name} className="h-14 w-14 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-bold text-ivory">{sp.name}</p>
                      <p className="text-xs text-champagne">{sp.role}</p>
                      <p className="text-xs text-ivory-2/80">{sp.bio}</p>
                      <p className="text-xs text-mist">ظرفیت: {sp.capacityPerSlot} · {sp.isActive ? "فعال" : "غیرفعال"}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1">
                    <button onClick={() => { setForm(sp); setEditing(sp.id); }} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">ویرایش</button>
                    <button onClick={() => deleteSpecialist(sp.id)} className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-300">حذف</button>
                    <button onClick={() => updateSpecialist(sp.id, { isActive: !sp.isActive })} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">{sp.isActive ? "غیرفعال" : "فعال"}</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MediaTab() {
  const { media, addMedia, deleteMedia, updateMedia } = useData();
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpload = () => {
    if (!url) return;
    addMedia({ url, filename: url.split("/").pop() || "image.jpg", altText: alt || "تصویر", mimeType: "image/jpeg", usedIn: [] });
    setUrl(""); setAlt("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setUrl(result);
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl text-ivory">کتابخانه رسانه</h2>
      <div className="rounded-xl border border-white/10 bg-ink-2 p-4">
        <h4 className="text-sm font-bold text-ivory">آپلود تصویر</h4>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL تصویر یا انتخاب فایل" className="rounded bg-ink-3 p-2 text-sm text-ivory" />
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleFile} className="rounded bg-ink-3 p-2 text-xs text-ivory" />
          <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="متن جایگزین (Alt)" className="rounded bg-ink-3 p-2 text-sm text-ivory" />
        </div>
        <p className="mt-2 text-xs text-mist">فرمت‌های مجاز: JPG, PNG, WebP, AVIF — کیفیت اصلی حفظ می‌شود.</p>
        {preview && <img src={preview} alt="preview" className="mt-3 h-24 w-24 rounded object-cover" />}
        <button onClick={handleUpload} className="mt-3 rounded-full bg-champagne px-4 py-2 text-xs font-bold text-ink">افزودن به کتابخانه</button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {media.map((m) => (
          <div key={m.id} className="rounded-xl border border-white/10 bg-ink-2 p-2">
            <img src={m.url} alt={m.altText} className="aspect-square w-full rounded-lg object-cover" loading="lazy" />
            <p className="mt-2 truncate text-xs text-ivory">{m.filename}</p>
            <p className="text-[11px] text-mist">{m.altText}</p>
            <div className="mt-2 flex gap-1">
              <button onClick={() => {
                const newAlt = prompt("Alt جدید:", m.altText);
                if (newAlt !== null) updateMedia(m.id, { altText: newAlt });
              }} className="rounded border border-white/10 px-2 py-1 text-[11px] text-ivory">ویرایش Alt</button>
              <button onClick={() => deleteMedia(m.id)} className="rounded bg-red-500/10 px-2 py-1 text-[11px] text-red-300">حذف</button>
            </div>
            <p className="mt-1 text-[11px] text-mist">استفاده: {m.usedIn.join(", ") || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CmsTab() {
  const { sections, updateSection, addSection, deleteSection, reorderSections, settings, updateSettings, media } = useData();
  const [showPreview, setShowPreview] = useState(false);
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="font-serif text-xl text-ivory">مدیریت محتوای صفحات (CMS)</h2>
        <button onClick={() => setShowPreview(!showPreview)} className="rounded-full border border-white/10 px-4 py-2 text-xs text-ivory">{showPreview ? "بستن پیش‌نمایش" : "پیش‌نمایش"}</button>
      </div>

      {showPreview && (
        <div className="rounded-xl border border-champagne/20 bg-ink-2 p-4">
          <p className="text-xs text-champagne">پیش‌نمایش:</p>
          <div className="mt-2 space-y-2">
            {sorted.filter((s) => s.isActive).map((s) => (
              <div key={s.id} className="rounded bg-ink-3 p-3">
                <p className="text-sm font-bold text-ivory">{s.titleFa}</p>
                <p className="text-xs text-mist">{s.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-ink-2 p-4">
        <h4 className="font-bold text-ivory">ترتیب نمایش سکشن‌ها (Drag با دکمه‌های ↑↓)</h4>
        <div className="mt-3 grid gap-2">
          {sorted.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg bg-ink-3 p-2">
              <div>
                <p className="text-sm font-bold text-ivory">{s.order}. {s.titleFa} <span className="text-xs text-mist">({s.key})</span></p>
                <p className="text-xs text-mist">{s.mode === "both" ? "هر دو حالت" : s.mode === "cinematic" ? "سینمایی" : "معمولی"} · {s.isActive ? "فعال" : "غیرفعال"}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => {
                  const idx = sorted.findIndex((x) => x.id === s.id);
                  if (idx > 0) {
                    const newOrder = [...sorted];
                    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
                    reorderSections(newOrder.map((x) => x.id));
                  }
                }} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">↑</button>
                <button onClick={() => {
                  const idx = sorted.findIndex((x) => x.id === s.id);
                  if (idx < sorted.length - 1) {
                    const newOrder = [...sorted];
                    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
                    reorderSections(newOrder.map((x) => x.id));
                  }
                }} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">↓</button>
                <button onClick={() => updateSection(s.id, { isActive: !s.isActive })} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">{s.isActive ? "غیرفعال" : "فعال"}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {sorted.map((s) => (
          <SectionEditor key={s.id} section={s} media={media} onUpdate={updateSection} onDelete={deleteSection} />
        ))}
        <button onClick={() => addSection({ key: `sec_${Date.now()}`, titleFa: "سکشن جدید", order: sections.length + 1 })} className="rounded-xl border border-dashed border-white/10 p-4 text-xs text-ivory hover:bg-white/5">+ افزودن سکشن</button>
      </div>

      <div className="rounded-xl border border-white/10 bg-ink-2 p-4">
        <h4 className="font-bold text-ivory">فوتر و اطلاعات تماس</h4>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input value={settings.brandName} onChange={(e) => updateSettings({ brandName: e.target.value })} placeholder="نام برند" className="rounded bg-ink-3 p-2 text-sm text-ivory" />
          <input value={settings.location} onChange={(e) => updateSettings({ location: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory" placeholder="آدرس" />
          <input value={settings.whatsapp} onChange={(e) => updateSettings({ whatsapp: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory" placeholder="واتساپ" />
          <input value={settings.mapsQuery} onChange={(e) => updateSettings({ mapsQuery: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory" placeholder="نقشه" />
        </div>
        <h4 className="mt-4 font-bold text-ivory">شبکه‌های اجتماعی</h4>
        {settings.socialLinks.map((link, idx) => (
          <div key={idx} className="mt-2 flex gap-2">
            <input value={link.platform} onChange={(e) => {
              const arr = [...settings.socialLinks];
              arr[idx] = { ...arr[idx], platform: e.target.value };
              updateSettings({ socialLinks: arr });
            }} className="flex-1 rounded bg-ink-3 p-2 text-sm text-ivory" placeholder="پلتفرم" />
            <input value={link.url} onChange={(e) => {
              const arr = [...settings.socialLinks];
              arr[idx] = { ...arr[idx], url: e.target.value };
              updateSettings({ socialLinks: arr });
            }} className="flex-[2] rounded bg-ink-3 p-2 text-sm text-ivory" placeholder="لینک" />
            <button onClick={() => updateSettings({ socialLinks: settings.socialLinks.filter((_, i) => i !== idx) })} className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-300">حذف</button>
          </div>
        ))}
        <button onClick={() => updateSettings({ socialLinks: [...settings.socialLinks, { platform: "instagram", url: "", icon: "instagram" }] })} className="mt-2 rounded border border-white/10 px-3 py-1 text-xs text-ivory">+ شبکه</button>
      </div>
    </div>
  );
}

function SectionEditor({ section, media, onUpdate, onDelete }: { section: any; media: any[]; onUpdate: any; onDelete: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-ink-2 p-3">
      <div className="flex justify-between">
        <p className="text-sm font-bold text-ivory">{section.titleFa}</p>
        <div className="flex gap-1">
          <button onClick={() => setOpen(!open)} className="rounded border border-white/10 px-2 py-1 text-xs text-ivory">{open ? "بستن" : "ویرایش"}</button>
          <button onClick={() => onDelete(section.id)} className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-300">حذف</button>
        </div>
      </div>
      {open && (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input value={section.titleFa} onChange={(e) => onUpdate(section.id, { titleFa: e.target.value })} placeholder="عنوان فارسی" className="rounded bg-ink-3 p-2 text-sm text-ivory" />
          <input value={section.titleEn || ""} onChange={(e) => onUpdate(section.id, { titleEn: e.target.value })} placeholder="Title EN" className="rounded bg-ink-3 p-2 text-sm text-ivory" />
          <input value={section.subtitle || ""} onChange={(e) => onUpdate(section.id, { subtitle: e.target.value })} placeholder="زیرعنوان" className="rounded bg-ink-3 p-2 text-sm text-ivory" />
          <input value={section.description || ""} onChange={(e) => onUpdate(section.id, { description: e.target.value })} placeholder="توضیح" className="rounded bg-ink-3 p-2 text-sm text-ivory" />
          <input value={section.image || ""} onChange={(e) => onUpdate(section.id, { image: e.target.value })} placeholder="تصویر URL" className="rounded bg-ink-3 p-2 text-sm text-ivory" />
          <select value={section.mode} onChange={(e) => onUpdate(section.id, { mode: e.target.value })} className="rounded bg-ink-3 p-2 text-sm text-ivory">
            <option value="both">هر دو حالت</option>
            <option value="cinematic">فقط سینمایی</option>
            <option value="standard">فقط معمولی</option>
          </select>
          <input value={section.buttonText || ""} onChange={(e) => onUpdate(section.id, { buttonText: e.target.value })} placeholder="متن دکمه" className="rounded bg-ink-3 p-2 text-sm text-ivory" />
          <input value={section.buttonLink || ""} onChange={(e) => onUpdate(section.id, { buttonLink: e.target.value })} placeholder="لینک دکمه" className="rounded bg-ink-3 p-2 text-sm text-ivory" />
          <div className="md:col-span-2">
            <p className="text-xs text-mist">انتخاب از کتابخانه رسانه:</p>
            <div className="mt-1 flex gap-1 overflow-x-auto">
              {media.slice(0, 8).map((m) => (
                <img key={m.id} src={m.url} alt={m.altText} onClick={() => onUpdate(section.id, { image: m.url })} className="h-12 w-12 cursor-pointer rounded object-cover hover:ring-2 hover:ring-champagne" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FinanceTab() {
  const { bookings, services } = useData();
  const revenueByService = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.filter((b) => b.status === "completed").forEach((b) => {
      map[b.serviceId] = (map[b.serviceId] || 0) + b.totalPrice;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [bookings]);

  const totalRevenue = bookings.filter((b) => ["completed", "confirmed"].includes(b.status)).reduce((s, b) => s + b.totalPrice, 0);
  const totalDeposits = bookings.reduce((s, b) => s + b.depositAmount, 0);
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl text-ivory">گزارش مالی</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-ink-2 p-4"><p className="text-xs text-mist">درآمد تأییدشده</p><p className="mt-2 text-lg font-bold text-champagne">{formatToman(totalRevenue)}</p></div>
        <div className="rounded-xl bg-ink-2 p-4"><p className="text-xs text-mist">مجموع بیعانه</p><p className="mt-2 text-lg font-bold text-ivory">{formatToman(totalDeposits)}</p></div>
        <div className="rounded-xl bg-ink-2 p-4"><p className="text-xs text-mist">رزروهای لغوشده</p><p className="mt-2 text-lg font-bold text-red-300">{cancelled}</p></div>
      </div>
      <div className="rounded-xl bg-ink-2 p-4">
        <h4 className="font-bold text-ivory">پرفروش‌ترین خدمات</h4>
        {revenueByService.length === 0 ? <p className="mt-2 text-xs text-mist">داده‌ای موجود نیست</p> : (
          <ul className="mt-3 space-y-2">
            {revenueByService.map(([svcId, rev]) => {
              const svc = services.find((s) => s.id === svcId);
              return <li key={svcId} className="flex justify-between rounded bg-ink-3 p-2 text-xs"><span className="text-ivory">{svc?.nameFa}</span><span className="text-champagne">{formatToman(rev)}</span></li>;
            })}
          </ul>
        )}
      </div>
      <div className="rounded-xl bg-ink-2 p-4">
        <h4 className="font-bold text-ivory">سوابق پرداخت</h4>
        <div className="mt-3 max-h-64 overflow-y-auto">
          {bookings.slice(0, 20).map((b) => (
            <div key={b.id} className="flex justify-between border-b border-white/5 py-2 text-xs">
              <span className="text-ivory">{b.customerName} · {b.date}</span>
              <span className="text-champagne">{formatToman(b.totalPrice)} ({b.paymentStatus})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const { settings, updateSettings } = useData();
  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl text-ivory">تنظیمات کلی و مالی</h2>
      <div className="rounded-xl bg-ink-2 p-4">
        <h4 className="font-bold text-ivory">واحد پول</h4>
        <p className="mt-2 text-sm text-ivory-2/90">واحد پول فعلی: <span className="font-bold text-champagne">تومان</span> — تمام قیمت‌ها به تومان نمایش داده می‌شوند و هیچ اثری از دلار در رابط کاربری نیست.</p>
      </div>
      <div className="rounded-xl bg-ink-2 p-4">
        <h4 className="font-bold text-ivory">مدیریت بیعانه</h4>
        <label className="mt-3 flex items-center gap-2 text-sm text-ivory"><input type="checkbox" checked={settings.depositGlobalEnabled} onChange={(e) => updateSettings({ depositGlobalEnabled: e.target.checked })} /> فعال‌سازی کلی بیعانه</label>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <select value={settings.depositGlobalType} onChange={(e) => updateSettings({ depositGlobalType: e.target.value as any })} className="rounded bg-ink-3 p-2 text-sm text-ivory"><option value="percent">درصد</option><option value="fixed">مبلغ ثابت</option></select>
          <input type="number" value={settings.depositGlobalValue} onChange={(e) => updateSettings({ depositGlobalValue: Number(e.target.value) })} className="rounded bg-ink-3 p-2 text-sm text-ivory" />
          <span className="text-xs text-mist self-center">{settings.depositGlobalType === "percent" ? `${settings.depositGlobalValue}% از مبلغ کل` : formatToman(settings.depositGlobalValue)}</span>
        </div>
        <p className="mt-2 text-xs text-mist">در صورت فعال بودن بیعانه کلی، تمام خدماتی که بیعانه اختصاصی ندارند از این مقدار استفاده می‌کنند. در صورت غیرفعال بودن، فقط خدمات دارای بیعانه اختصاصی بیعانه می‌گیرند.</p>
      </div>
      <div className="rounded-xl bg-ink-2 p-4">
        <h4 className="font-bold text-ivory">ساعات کاری و تعطیلات</h4>
        <input value={settings.workingHoursNote} onChange={(e) => updateSettings({ workingHoursNote: e.target.value })} className="mt-2 w-full rounded bg-ink-3 p-2 text-sm text-ivory" placeholder="ساعات کاری" />
        <p className="mt-2 text-xs text-mist">تعطیلات (ISO):</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {settings.holidays.map((h, i) => (
            <span key={i} className="rounded-full bg-ink-3 px-2 py-1 text-xs text-ivory">{h} <button onClick={() => updateSettings({ holidays: settings.holidays.filter((_, idx) => idx !== i) })} className="text-red-300">✕</button></span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input id="hol" type="date" className="rounded bg-ink-3 p-2 text-xs text-ivory" />
          <button onClick={() => {
            const el = document.getElementById("hol") as HTMLInputElement;
            if (el?.value) updateSettings({ holidays: [...settings.holidays, el.value] });
          }} className="rounded bg-white/5 px-3 py-1 text-xs text-ivory">افزودن تعطیلی</button>
        </div>
      </div>
    </div>
  );
}
