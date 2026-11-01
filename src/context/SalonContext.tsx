import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCinematicCapable, usePrefersReducedMotion } from "@/hooks/useMedia";

/**
 * Minimum viewport height for the pinned cinematic track. Phones and tablets
 * are supported; only viewports too short for a full-screen scene (landscape
 * phones, split-screen windows) fall back to the standard page.
 */
export const CINEMATIC_MIN_HEIGHT = 480;

export interface BookingDraft {
  serviceId: string | null;
  stylistId: string | null;
  date: string | null;
  time: string | null;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const EMPTY_BOOKING: BookingDraft = {
  serviceId: null,
  stylistId: null,
  date: null,
  time: null,
  name: "",
  phone: "",
  email: "",
  notes: "",
};

interface SalonContextValue {
  /** Effective value: never true on a small screen. */
  cinematic: boolean;
  /** Whether this device/viewport can use cinematic mode at all. */
  cinematicSupported: boolean;
  setCinematic: (value: boolean) => void;
  bookingOpen: boolean;
  openBooking: (serviceId?: string) => void;
  closeBooking: () => void;
  booking: BookingDraft;
  setBooking: (patch: Partial<BookingDraft>) => void;
  resetBooking: () => void;
  reducedMotion: boolean;
  loaded: boolean;
  setLoaded: (v: boolean) => void;
  navigateTo: (id: string) => void;
}

const SalonContext = createContext<SalonContextValue | null>(null);

export function SalonProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const capable = useCinematicCapable();
  const [cinematicPref, setCinematicPref] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [booking, setBookingState] = useState<BookingDraft>(EMPTY_BOOKING);
  const [loaded, setLoaded] = useState(false);

  /**
   * Cinematic mode runs on every device class — phone, tablet and desktop —
   * in a form tuned for the input it gets (scroll-scrubbed video on desktop,
   * native playback on touch). Only viewports too short to show a scene drop
   * back to the natively scrolling page.
   */
  const cinematicSupported = capable;
  const cinematic = cinematicPref && cinematicSupported;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("solene-cinematic");
      if (stored === "off") setCinematicPref(false);
      if (stored === "on") setCinematicPref(true);
    } catch {
      /* ignore */
    }
  }, []);

  const setCinematic = useCallback((value: boolean) => {
    setCinematicPref(value);
    try {
      localStorage.setItem("solene-cinematic", value ? "on" : "off");
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const openBooking = useCallback((serviceId?: string) => {
    setBookingState((prev) => ({
      ...EMPTY_BOOKING,
      ...prev,
      serviceId: serviceId ?? prev.serviceId,
    }));
    setBookingOpen(true);
  }, []);

  const closeBooking = useCallback(() => {
    setBookingOpen(false);
  }, []);

  const setBooking = useCallback((patch: Partial<BookingDraft>) => {
    setBookingState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetBooking = useCallback(() => {
    setBookingState(EMPTY_BOOKING);
  }, []);

  const navigateTo = useCallback(
    (id: string) => {
      if (id === "book") {
        setBookingOpen(true);
        return;
      }

      if (id === "home") {
        window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
        return;
      }

      if (cinematic && (id === "services" || id === "ritual")) {
        const track = document.getElementById("cinematic-track");
        if (track) {
          const total = track.offsetHeight - window.innerHeight;
          const p = id === "services" ? 0.26 : 0.64;
          const top = track.offsetTop + total * p;
          window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
          return;
        }
      }

      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
    },
    [cinematic, reducedMotion],
  );

  const value = useMemo(
    () => ({
      cinematic,
      cinematicSupported,
      setCinematic,
      bookingOpen,
      openBooking,
      closeBooking,
      booking,
      setBooking,
      resetBooking,
      reducedMotion,
      loaded,
      setLoaded,
      navigateTo,
    }),
    [
      cinematic,
      cinematicSupported,
      setCinematic,
      bookingOpen,
      openBooking,
      closeBooking,
      booking,
      setBooking,
      resetBooking,
      reducedMotion,
      loaded,
      navigateTo,
    ],
  );

  return <SalonContext.Provider value={value}>{children}</SalonContext.Provider>;
}

export function useSalon() {
  const ctx = useContext(SalonContext);
  if (!ctx) throw new Error("useSalon must be used within SalonProvider");
  return ctx;
}
