import { useEffect, useState } from "react";
import { SalonProvider, useSalon } from "@/context/SalonContext";
import { DataProvider } from "@/context/DataContext";
import { AuthProvider } from "@/context/AuthContext";
import { startRuntimeMonitor } from "@/hooks/usePerformance";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import Preloader from "@/components/Preloader";
import CinematicExperience from "@/components/CinematicExperience";
import CinematicIntro from "@/components/CinematicIntro";
import {
  AboutSection,
  AppointmentCta,
  MobileBookBar,
  StorySections,
} from "@/components/StandardPage";
import ServiceAtelier from "@/components/atelier/ServiceAtelier";
import LookbookSection from "@/components/lookbook/LookbookSection";
import GalleryPage from "@/components/lookbook/GalleryPage";
import NewBookingModal from "@/components/booking/NewBookingModal";
import AdminPanel from "@/components/admin/AdminPanel";
import CustomerDashboard from "@/components/customer/CustomerDashboard";
import AuthModal from "@/components/auth/AuthModal";

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <SalonProvider>
          <Root />
        </SalonProvider>
      </AuthProvider>
    </DataProvider>
  );
}

function PerformanceGuard() {
  const { loaded } = useSalon();
  useEffect(() => {
    if (!loaded) return;
    let stop: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      stop = startRuntimeMonitor();
    }, 1800);
    return () => {
      window.clearTimeout(timer);
      stop?.();
    };
  }, [loaded]);
  return null;
}

type View = "home" | "admin" | "dashboard" | "gallery";

function Root() {
  const { cinematic, bookingOpen } = useSalon();
  const [modalMounted, setModalMounted] = useState(false);
  const [view, setView] = useState<View>("home");
  const [authOpen, setAuthOpen] = useState(false);
  const [galleryParams, setGalleryParams] = useState<{ cat: string | null; type: string }>(() => {
    const h = typeof window !== "undefined" ? window.location.hash : "";
    if (h.startsWith("#gallery")) {
      const q = h.includes("?") ? h.split("?")[1] : "";
      const p = new URLSearchParams(q);
      return { cat: p.get("cat"), type: p.get("type") || "" };
    }
    return { cat: null, type: "" };
  });
  const homeReturnRef = useState<{ y: number }>(() => ({ y: 0 }))[0];

  useEffect(() => {
    if (bookingOpen) setModalMounted(true);
  }, [bookingOpen]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("cinematic-active", cinematic && view === "home");
    return () => root.classList.remove("cinematic-active");
  }, [cinematic, view]);

  // handle hash-based navigation for admin/dashboard/gallery
  useEffect(() => {
    const check = () => {
      const h = window.location.hash;
      if (h.startsWith("#gallery")) {
        const q = h.includes("?") ? h.split("?")[1] : "";
        const p = new URLSearchParams(q);
        setGalleryParams({ cat: p.get("cat"), type: p.get("type") || "" });
        setView("gallery");
      } else if (h === "#admin") setView("admin");
      else if (h === "#dashboard") setView("dashboard");
      else setView("home");
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  const navigateView = (v: View) => {
    setView(v);
    if (v === "home") {
      window.location.hash = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (v === "gallery") {
      // handled via openGallery
    } else {
      window.location.hash = v === "admin" ? "#admin" : "#dashboard";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openGallery = (cat: string | null, type?: string) => {
    homeReturnRef.y = window.scrollY;
    const params = new URLSearchParams();
    if (cat) params.set("cat", cat);
    if (type) params.set("type", type);
    const qs = params.toString();
    window.location.hash = qs ? `#gallery?${qs}` : "#gallery";
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  const backFromGallery = () => {
    // اگر تاریخچه دارد، back کن تا به همان اسکرول قبلی نزدیک بمانیم
    if (window.history.length > 1) {
      window.history.back();
      // تضمین بازگشت بصری به بخش نمونه‌کارها
      window.setTimeout(() => {
        const el = document.getElementById("portfolio");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: homeReturnRef.y || 0, behavior: "smooth" });
      }, 250);
    } else {
      navigateView("home");
      window.setTimeout(() => {
        const el = document.getElementById("portfolio");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  if (view === "admin") {
    return (
      <div dir="rtl" className="min-h-screen bg-ink text-ivory">
        <AdminPanel onClose={() => navigateView("home")} />
      </div>
    );
  }
  if (view === "dashboard") {
    return (
      <div dir="rtl" className="min-h-screen bg-ink text-ivory">
        <CustomerDashboard onClose={() => navigateView("home")} />
      </div>
    );
  }

  if (view === "gallery") {
    return (
      <div dir="rtl" className="min-h-screen bg-ink text-ivory">
        <Header onNavigateView={navigateView as any} onOpenAuth={() => setAuthOpen(true)} view={view} />
        <GalleryPage initialCategory={galleryParams.cat} initialType={galleryParams.type as any} onBack={backFromGallery} />
        <Footer />
        {modalMounted && <NewBookingModal />}
        {authOpen && <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />}
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-ink pb-[calc(4rem+env(safe-area-inset-bottom,0px))] text-ivory lg:pb-0"
    >
      <PerformanceGuard />
      <Preloader />
      <div className="film-grain" aria-hidden="true" />
      <CustomCursor />
      <Header onNavigateView={navigateView as any} onOpenAuth={() => setAuthOpen(true)} view={view} />
      <main id="content">
        {cinematic ? (
          <>
            <CinematicIntro />
            <CinematicExperience />
          </>
        ) : (
          <StorySections />
        )}
        <ServiceAtelier />
        <LookbookSection onOpenGallery={openGallery} />
        <AppointmentCta />
        <AboutSection />
      </main>
      <Footer />
      <MobileBookBar />
      {modalMounted && <NewBookingModal />}
      {authOpen && <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />}
    </div>
  );
}
