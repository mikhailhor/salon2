import { useEffect, useState } from "react";
import { NAV } from "@/data/salon";
import { useSalon } from "@/context/SalonContext";
import { useIsMobile, useScrolled } from "@/hooks/useMedia";
import { GoldButton, IconClose, Logo } from "@/components/primitives";
import { cn } from "@/utils/cn";

export default function Header() {
  const { cinematic, setCinematic, openBooking, navigateTo, bookingOpen } = useSalon();
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
            ? "border-b border-white/5 bg-ink/78 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
          bookingOpen && "pointer-events-none opacity-0",
        )}
      >
        <div className="mx-auto flex h-[110px] max-w-[1440px] items-center justify-between px-5 md:px-8 lg:px-12">
          <Logo
            onClick={() => go("home")}
            withText={false}
            markClassName="h-14 w-auto md:h-16"
          />

          <nav className="hidden items-center gap-9 lg:flex" aria-label="ناوبری اصلی">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                data-cursor="کاوش"
                onClick={() => go(item.id)}
                 className="text-[15px] font-bold tracking-[0.32em] text-ivory/80 uppercase transition-colors duration-300 hover:text-champagne"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <CinematicToggle
              on={cinematic}
              onChange={setCinematic}
              compact={mobile}
            />
            <GoldButton
              type="button"
              onClick={() => openBooking()}
              className="hidden px-6 py-2.5 lg:inline-flex"
            >
              رزرو نوبت
            </GoldButton>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center lg:hidden"
              aria-label={menu ? "بستن منو" : "باز کردن منو"}
              aria-expanded={menu}
              onClick={() => setMenu((v) => !v)}
            >
              {menu ? (
                <IconClose className="h-5 w-5" />
              ) : (
                <span className="flex w-6 flex-col gap-1.5" aria-hidden>
                  <span className="h-px w-full bg-ivory" />
                  <span className="h-px w-4 self-end bg-ivory" />
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-30 flex flex-col justify-end bg-ink/96 backdrop-blur-md transition-opacity duration-500 lg:hidden",
          menu ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!menu}
      >
        <nav className="flex flex-col gap-2 px-8 pb-12" aria-label="ناوبری موبایل">
          {NAV.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              className="border-b border-white/8 py-4 text-right font-serif text-4xl text-ivory"
              style={{
                transform: menu ? "translateY(0)" : "translateY(12px)",
                opacity: menu ? 1 : 0,
                transition: `all 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s`,
              }}
            >
              {item.label}
            </button>
          ))}
          <GoldButton
            type="button"
            onClick={() => {
              setMenu(false);
              openBooking();
            }}
            className="mt-8 w-full"
          >
            رزرو نوبت
          </GoldButton>
        </nav>
      </div>
    </>
  );
}

function CinematicToggle({
  on,
  onChange,
  compact,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  compact: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="حالت سینمایی"
      data-cursor="کاوش"
      onClick={() => onChange(!on)}
      className="flex items-center gap-3"
    >
      {!compact && (
        <span className="text-[16px] font-bold tracking-[0.28em] text-ivory/90 uppercase">
          حالت سینمایی
        </span>
      )}
      {compact && (
        <span className="hidden text-[16px] tracking-[0.22em] text-ivory/90 uppercase sm:inline">
          سینمایی
        </span>
      )}
      <span
        className={cn(
          "relative h-5 w-9 rounded-full border transition-colors duration-500",
          on ? "border-champagne bg-champagne/20" : "border-white/20 bg-white/5",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all duration-500",
            on ? "left-[18px] bg-champagne" : "left-0.5 bg-ivory/70",
          )}
        />
      </span>
    </button>
  );
}
