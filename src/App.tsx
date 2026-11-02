import { useEffect } from "react";
import { SalonProvider, useSalon } from "@/context/SalonContext";
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
import PortfolioSection from "@/components/PortfolioSection";
import BookingModal from "@/components/BookingModal";

export default function App() {
  return (
    <SalonProvider>
      <Root />
    </SalonProvider>
  );
}

function Root() {
  const { cinematic } = useSalon();

  /**
   * While the pinned cinematic track is on screen the page owns the scroll
   * gesture: this class keeps pull-to-refresh and rubber-banding from
   * interrupting a touch drag in the middle of a scene.
   */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("cinematic-active", cinematic);
    return () => root.classList.remove("cinematic-active");
  }, [cinematic]);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-ink pb-[calc(4rem+env(safe-area-inset-bottom,0px))] text-ivory lg:pb-0"
    >
      <Preloader />
      <div className="film-grain" aria-hidden="true" />
      <CustomCursor />
      <Header />
      <main id="content">
        {cinematic ? (
          <>
            <CinematicIntro />
            <CinematicExperience />
          </>
        ) : (
          <StorySections />
        )}
        <PortfolioSection />
        <AppointmentCta />
        <AboutSection />
      </main>
      <Footer />
      <MobileBookBar />
      <BookingModal />
    </div>
  );
}
