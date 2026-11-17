import { useEffect, useState } from "react";
import { NAV } from "@/data/salon";
import { useSalon } from "@/context/SalonContext";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile, useScrolled } from "@/hooks/useMedia";
import { GoldButton, IconClose, Logo } from "@/components/primitives";
import { cn } from "@/utils/cn";

export default function Header({ onNavigateView, onOpenAuth, view }: { onNavigateView?: (v: "home" | "admin" | "dashboard" | "gallery") => void; onOpenAuth?: () => void; view?: string }) {
  const {
    cinematic,
    cinematicSupported,
    setCinematic,
    openBooking,
    navigateTo,
    bookingOpen,
  } = useSalon();
  const { user, isAdmin, logout } = useAuth();
  const scrolled = useScrolled(18);
  const mobile = useIsMobile(1024);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!mobile) setMenu(false);
  }, [mobile]);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  const go = (id: string) => {
    setMenu(false);
    if (id === "admin" || id === "dashboard") {
      onNavigateView?.(id as any);
      return;
    }
    // اگر در صفحه گالری هستیم و کاربر روی بخش‌های خانه کلیک کرد، به خانه برگرد و سپس اسکرول کن
    if (view === "gallery") {
      window.location.hash = "";
      window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0, behavior: "smooth" });
      }, 120);
      return;
    }
    navigateTo(id);
  };

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[100] focus:bg-champagne focus:px-4 focus:py-2 focus:text-ink"
      >
        پرش به محتوای اصلی
      </a>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-40 transition-[background,border-color,backdrop-filter] duration-500",
          scrolled || menu
            ? "border-b border-white/5 bg-ink/95 backdrop-blur-md lg:bg-ink/78 lg:pointer-fine:backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
          bookingOpen && "pointer-events-none opacity-0",
        )}
      >
        <div className="mx-auto flex h-[64px] max-w-[1440px] items-center justify-between px-4 sm:h-[72px] sm:px-5 md:h-[88px] md:px-8 lg:h-[112px] lg:px-12 xl:h-[136px]">
          <Logo
            onClick={() => go("home")}
            withText={false}
            markClassName="h-9 w-auto sm:h-10 md:h-14 lg:h-16 xl:h-[5.5rem]"
          />

          <nav className="hidden items-center gap-6 lg:flex" aria-label="ناوبری اصلی">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                data-cursor="کاوش"
                onClick={() => go(item.id)}
                 className="text-[13px] font-bold tracking-[0.28em] text-ivory/80 uppercase transition-colors duration-300 hover:text-champagne"
              >
                {item.label}
              </button>
            ))}
            {user ? (
              <>
                <button onClick={() => go("dashboard")} className="text-[13px] font-bold tracking-[0.28em] text-champagne uppercase hover:text-ivory">پنل کاربری</button>
                {isAdmin && <button onClick={() => go("admin")} className="text-[13px] font-bold tracking-[0.28em] text-emerald-300 uppercase hover:text-ivory">مدیریت</button>}
                <span className="hidden text-xs text-mist xl:inline">{user.fullName.split(" ")[0]}</span>
                <button onClick={logout} className="rounded-full border border-white/10 px-3 py-1 text-xs text-mist hover:text-ivory">خروج</button>
              </>
            ) : (
              <button onClick={() => onOpenAuth?.()} className="rounded-full border border-white/10 px-4 py-1.5 text-xs tracking-[0.15em] text-ivory hover:bg-white/5">ورود / ثبت‌نام</button>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
            {/* وضعیت حالت سینمایی روی موبایل هم نشان داده می‌شود ولی جمع‌وجور */}
            {cinematicSupported && (
              <div className="flex items-center gap-2">
                <span className="hidden text-[10px] font-bold tracking-[0.2em] text-ivory/60 uppercase sm:inline md:hidden lg:inline">
                  {cinematic ? "سینمایی" : "استاندارد"}
                </span>
                <CinematicToggle
                  on={cinematic}
                  onChange={setCinematic}
                  compact
                />
              </div>
            )}
            <GoldButton
              type="button"
              onClick={() => openBooking()}
              className="hidden px-5 py-2.5 text-xs sm:px-6 lg:inline-flex"
            >
              رزرو نوبت
            </GoldButton>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-ink/20 backdrop-blur-sm transition-colors hover:bg-white/5 lg:hidden"
              aria-label={menu ? "بستن منو" : "باز کردن منو"}
              aria-expanded={menu}
              onClick={() => setMenu((v) => !v)}
            >
              {menu ? (
                <IconClose className="h-5 w-5" />
              ) : (
                <span className="flex w-5 flex-col gap-1.5" aria-hidden>
                  <span className="h-0.5 w-full rounded bg-ivory" />
                  <span className="h-0.5 w-4 self-end rounded bg-ivory" />
                  <span className="h-0.5 w-full rounded bg-ivory" />
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu - حرفه‌ای با اسکرول و فوکوس عالی */}
      <div
        className={cn(
          "fixed inset-0 z-30 flex flex-col bg-ink transition-all duration-500 lg:hidden",
          menu ? "visible opacity-100" : "invisible pointer-events-none opacity-0",
        )}
        aria-hidden={!menu}
      >
        {/* هدر کوچک داخل منو */}
        <div className="flex h-[64px] items-center justify-between border-b border-white/5 px-4 sm:h-[72px] sm:px-5">
          <Logo onClick={() => go("home")} withText={false} markClassName="h-9 w-auto" />
          <button
            type="button"
            onClick={() => setMenu(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10"
            aria-label="بستن منو"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <nav className="flex flex-col px-4 py-6 sm:px-6" aria-label="ناوبری موبایل">
            {NAV.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className="group flex items-center justify-between border-b border-white/[0.06] py-5 text-right"
                style={{
                  transform: menu ? "translateY(0)" : "translateY(12px)",
                  opacity: menu ? 1 : 0,
                  transition: `all 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s`,
                }}
              >
                <span className="font-serif text-[1.75rem] leading-none text-ivory transition-colors group-hover:text-champagne sm:text-[2rem]">{item.label}</span>
                <span className="text-lg text-mist transition-colors group-hover:text-champagne">›</span>
              </button>
            ))}

            {user ? (
              <div className="mt-2 rounded-2xl border border-white/10 bg-ink-2 p-4">
                <p className="text-xs tracking-[0.15em] text-mist">حساب کاربری</p>
                <p className="mt-1 font-serif text-lg text-ivory">{user.fullName}</p>
                <p className="text-xs text-mist">{user.phone}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={() => go("dashboard")} className="rounded-full bg-champagne py-3 text-xs font-bold tracking-[0.15em] text-ink">پنل کاربری</button>
                  {isAdmin ? (
                    <button onClick={() => go("admin")} className="rounded-full border border-emerald-300/30 bg-emerald-300/10 py-3 text-xs font-bold tracking-[0.15em] text-emerald-300">مدیریت</button>
                  ) : (
                    <button onClick={() => { logout(); setMenu(false); }} className="rounded-full border border-white/10 py-3 text-xs text-ivory">خروج</button>
                  )}
                </div>
                {isAdmin && (
                  <button onClick={() => { logout(); setMenu(false); }} className="mt-2 w-full py-2 text-xs text-mist">خروج از حساب</button>
                )}
              </div>
            ) : (
              <button onClick={() => { setMenu(false); onOpenAuth?.(); }} className="mt-4 flex items-center justify-between rounded-2xl border border-champagne/20 bg-champagne/10 px-5 py-4 text-right transition-colors hover:bg-champagne/15">
                <div>
                  <p className="font-serif text-lg text-ivory">ورود / ثبت‌نام</p>
                  <p className="mt-1 text-xs text-ivory-2/80">برای رزرو و پیگیری نوبت‌ها وارد شوید</p>
                </div>
                <span className="text-xl text-champagne">›</span>
              </button>
            )}

            {cinematicSupported && (
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-ink-2 px-5 py-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-ivory uppercase">حالت نمایش</p>
                  <p className="mt-1 text-xs text-mist">{cinematic ? "سینمایی — تجربه بصری کامل" : "استاندارد — سریع و سبک"}</p>
                </div>
                <CinematicToggle on={cinematic} onChange={setCinematic} />
              </div>
            )}

            <div className="mt-6 grid gap-3">
              <GoldButton
                type="button"
                onClick={() => {
                  setMenu(false);
                  openBooking();
                }}
                className="w-full py-4 text-sm"
              >
                رزرو نوبت — همین حالا
              </GoldButton>
              <p className="text-center text-xs leading-relaxed text-mist">
                پاسخگویی هر روز ۹ تا ۱۹ · پنج‌شنبه تا ۱۴<br />
                <span className="text-ivory/80">۰۲۱-۴۴۹۲۹۹۱۳ · ۰۹۱۲۹۱۰۳۲۴۳</span>
              </p>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

function CinematicToggle({
  on,
  onChange,
  compact = false,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="حالت سینمایی"
      data-cursor="کاوش"
      onClick={() => onChange(!on)}
      className={cn(
        "flex items-center gap-2 sm:gap-3",
        compact && "-mr-1 p-1",
      )}
    >
      <span
        className={cn(
          "text-[11px] font-bold tracking-[0.2em] text-ivory/90 uppercase sm:text-[13px]",
          compact && "hidden lg:inline",
        )}
      >
        حالت سینمایی
      </span>
      <span
        className={cn(
          "relative h-5 w-9 rounded-full border transition-colors duration-500 sm:h-5 sm:w-9",
          on ? "border-champagne bg-champagne/20" : "border-white/20 bg-white/5",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all duration-500 sm:h-3.5 sm:w-3.5",
            on ? "left-[18px] bg-champagne shadow-[0_0_8px_rgba(198,165,106,0.5)]" : "left-0.5 bg-ivory/70",
          )}
        />
      </span>
    </button>
  );
}
