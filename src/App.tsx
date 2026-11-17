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
import NewLookbook from "@/components/lookbook/NewLookbook";
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

type View = "home" | "admin" | "dashboard";

function Root() {
  const { cinematic, bookingOpen } = useSalon();
  const [modalMounted, setModalMounted] = useState(false);
  const [view, setView] = useState<View>("home");
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (bookingOpen) setModalMounted(true);
  }, [bookingOpen]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("cinematic-active", cinematic && view === "home");
    return () => root.classList.remove("cinematic-active");
  }, [cinematic, view]);

  // handle hash-based navigation for admin/dashboard
  useEffect(() => {
    const check = () => {
      const h = window.location.hash;
      if (h === "#admin") setView("admin");
      else if (h === "#dashboard") setView("dashboard");
      else setView("home");
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  const navigateView = (v: View) => {
    setView(v);
    if (v === "home") window.location.hash = "";
    else window.location.hash = v === "admin" ? "#admin" : "#dashboard";
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-ink pb-[calc(4rem+env(safe-area-inset-bottom,0px))] text-ivory lg:pb-0"
    >
      <PerformanceGuard />
      <Preloader />
      <div className="film-grain" aria-hidden="true" />
      <CustomCursor />
      <Header onNavigateView={navigateView} onOpenAuth={() => setAuthOpen(true)} view={view} />
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
        <NewLookbook />
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
