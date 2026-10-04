import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Fleet from "@/components/Fleet";
import Services from "@/components/Services";
import Process from "@/components/Process";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import FinalCta from "@/components/FinalCta";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo } from "@/hooks/use-seo";
import { useReveal } from "@/hooks/use-reveal";

const Index = () => {
  const { hash, key } = useLocation();
  const { t } = useLanguage();

  useSeo({ title: t.meta.homeTitle, description: t.meta.homeDescription, path: "/" });
  useReveal();

  // Supports /#flotte links coming from other routes as well as in-page navigation.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [hash, key]);

  return (
    <div className="min-h-screen bg-background">
      <Header overlay />
      <main>
        <Hero />
        <Fleet />
        <Services />
        <WhyUs />
        <Process />
        <Testimonials />
        <FinalCta />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default Index;
