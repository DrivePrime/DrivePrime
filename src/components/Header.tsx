import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { whatsappUrl, hasConfirmedServices } from "@/config/business";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "./LanguageSwitcher";
import CurrencySwitcher from "./CurrencySwitcher";
import { WhatsAppIcon } from "./icons";
import logo from "@/assets/logo-160.webp";

/** `overlay` = transparent over the home hero until the page scrolls. */
export default function Header({ overlay = false, mobileCta = true }: { overlay?: boolean; mobileCta?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLinks = [
    { name: t.nav.fleet, to: "/#flotte" },
    ...(hasConfirmedServices ? [{ name: t.nav.services, to: "/#services" }] : []),
    { name: t.nav.howItWorks, to: "/#reserver" },
    { name: t.nav.contact, to: "/#contact" },
  ];

  const solid = !overlay || scrolled || menuOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300",
        solid
          ? "bg-background/95 backdrop-blur-sm border-b border-border"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="container flex h-16 lg:h-[72px] items-center gap-6">
        <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="Drive Prime">
          <img src={logo} alt="" width={36} height={36} className="h-9 w-9 rounded-full" />
          <span className="type-wide text-[17px] font-semibold tracking-tight text-foreground">
            Drive Prime
          </span>
        </Link>

        <nav aria-label={t.nav.mainNav} className="hidden lg:flex items-center gap-8 ms-auto">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-[14px] font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-1 ps-6 border-s border-foreground/15">
          <LanguageSwitcher />
          <span className="mx-1 h-4 w-px bg-foreground/15" aria-hidden="true" />
          <CurrencySwitcher />
        </div>

        <a
          href={whatsappUrl(t.whatsapp.general)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("btn-primary h-10 px-4 text-[14px] ms-auto max-sm:w-10 max-sm:rounded-full max-sm:px-0 lg:ms-0", !mobileCta && "hidden lg:inline-flex")}
        >
          <WhatsAppIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{t.nav.book}</span>
          <span className="sr-only sm:hidden">{t.nav.whatsapp}</span>
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
          className={cn("lg:hidden -me-2 grid h-10 w-10 place-items-center text-foreground", !mobileCta && "ms-auto")}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="lg:hidden h-[calc(100dvh-4rem)] overflow-y-auto bg-background"
      >
        <nav aria-label={t.nav.mainNav} className="container flex flex-col pt-4 pb-10">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              // Close in the same render as the navigation, so the scroll lock is released before scrolling.
              onClick={() => setMenuOpen(false)}
              className="type-wide py-4 text-2xl font-semibold text-foreground border-b border-border"
            >
              {link.name}
            </Link>
          ))}
          <div className="mt-8 flex items-center justify-between">
            <LanguageSwitcher />
            <CurrencySwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
