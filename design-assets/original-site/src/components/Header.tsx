import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Menu, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import CurrencySwitcher from "./CurrencySwitcher";
import logo from "@/assets/logo.png";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.home, href: "#accueil" },
    { name: t.nav.fleet, href: "#flotte" },
    { name: t.nav.services, href: "#services" },
    { name: t.nav.whyUs, href: "#pourquoi" },
    { name: t.nav.testimonials, href: "#temoignages" },
    { name: t.nav.contact, href: "#contact" },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between h-20 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Logo */}
          <a href="#accueil" className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <img 
              src={logo} 
              alt="Drive Prime Logo" 
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/50"
            />
            <span className="font-display text-xl font-semibold text-primary">
              Drive Prime
            </span>
          </a>

          {/* Center CTA Button */}
          <a
            href="https://wa.me/212612132748"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium text-sm hover:bg-primary/90 transition-all duration-300 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Phone className="w-4 h-4" />
            {t.nav.book}
          </a>

          {/* Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-foreground"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-background/95 backdrop-blur-lg border-b border-border"
          >
            <div className="container mx-auto px-4 py-6">
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-foreground hover:text-primary transition-colors duration-300 text-lg font-medium py-2"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-4 border-t border-border flex flex-col gap-4">
                  <CurrencySwitcher />
                  <LanguageSwitcher />
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
