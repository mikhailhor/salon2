import { cn } from "@/utils/cn";
import { usePrefersReducedMotion } from "@/hooks/useMedia";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="20" cy="20" r="8.5" stroke="currentColor" strokeWidth="0.5" />
      <path
        d="M20 14.2 L25 20 L20 25.8 L15 20 Z"
        fill="currentColor"
        opacity="0.92"
      />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  onClick,
  withText = true,
}: {
  className?: string;
  markClassName?: string;
  onClick?: () => void;
  withText?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="خانه"
      className={cn("flex items-center gap-6 text-ivory", className)}
      aria-label="لیندا، خانه"
    >
      <span className="relative flex items-center justify-center">
        <span
          className="logo-neon absolute -inset-4 rounded-full"
          aria-hidden="true"
        />
        <span
          className="logo-neon-core absolute -inset-1 rounded-full"
          aria-hidden="true"
        />
        <img
          src="/logo.png"
          alt="لیندا"
          className={cn(
            "logo-neon-img relative h-16 w-auto object-contain",
            markClassName,
          )}
        />
      </span>
      {withText && (
        <span className="font-serif text-[1.35rem] font-normal tracking-[0.28em] uppercase">
          لیندا
        </span>
      )}
    </button>
  );
}

export function GoldButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      data-cursor="رزرو"
      className={cn(
        "gold-btn group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-9 py-4 font-sans text-[16px] font-bold uppercase tracking-[0.32em] text-ink transition-all duration-500 hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="gold-sheen pointer-events-none absolute inset-0"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-l from-transparent via-white/60 to-transparent"
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      data-cursor="کاوش"
      className={cn(
        "inline-flex items-center justify-center border border-champagne/40 px-8 py-3.5 font-sans text-[16px] font-bold uppercase tracking-[0.32em] text-ivory transition-colors duration-500 hover:border-champagne hover:bg-champagne/10",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[16px] font-bold uppercase tracking-[0.42em] text-champagne",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function RevealWords({
  text,
  active,
  delay = 0,
  className,
}: {
  text: string;
  active: boolean;
  delay?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={cn("inline", className)}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="mr-[0.28em] inline-block overflow-hidden align-bottom last:mr-0"
        >
          <span
            className="inline-block will-change-transform"
            style={{
              transform: active ? "translateY(0)" : "translateY(115%)",
              opacity: active ? 1 : 0,
              transition: `transform 0.95s cubic-bezier(0.16, 1, 0.3, 1) ${
                delay + i * 0.055
              }s, opacity 0.6s ${delay + i * 0.055}s`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}

export function IconClose({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function IconArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function IconInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="16.6" cy="7.4" r="0.7" fill="currentColor" />
    </svg>
  );
}

export function IconChat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16H9l-4 3.2V16H5.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="10.5" r="1" fill="currentColor" />
      <circle cx="13" cy="10.5" r="1" fill="currentColor" />
      <circle cx="17" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}
