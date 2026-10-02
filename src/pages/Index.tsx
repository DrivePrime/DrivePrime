import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Fleet from "@/components/Fleet";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo } from "@/hooks/use-seo";

const Index = () => {
  const { hash, key } = useLocation();
  const { t } = useLanguage();

  useSeo({ title: t.meta.homeTitle, description: t.meta.homeDescription, path: "/" });

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
        <Process />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
