import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { whatsappUrl, hasConfirmedServices } from "@/config/business";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "./LanguageSwitcher";
import CurrencySwitcher from "./CurrencySwitcher";
import { WhatsAppIcon } from "./icons";
import logo from "@/assets/logo-160.webp";

/*
  Header with two states.
  - Over the hero (`overlay`, top of page): taller, blended into the photograph.
  - Scrolled (or any other page): compact, opaque, a soft shadow.
  Signature: one brass hairline along the bottom edge that follows reading progress.
  The header is fixed, so changing its height never shifts the page.
*/
export default function Header({ overlay = false }: { overlay?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const progressRef = useRef<HTMLSpanElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [marker, setMarker] = useState({ left: 0, width: 0 });
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        if (y < window.innerHeight * 0.5) setActiveSection("");
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressRef.current?.style.setProperty(
          "--progress",
          String(max > 0 ? Math.min(1, y / max) : 0),
        );
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLinks = [
    { name: t.nav.fleet, id: "flotte" },
    ...(hasConfirmedServices ? [{ name: t.nav.services, id: "services" }] : []),
    { name: t.nav.whyUs, id: "pourquoi" },
    { name: t.nav.testimonials, id: "temoignages" },
    { name: t.nav.contact, id: "contact" },
  ];

  // Home page: the link of the section in the middle of the screen is marked as current.
  const sectionIds = navLinks.map((l) => l.id).join(",");
  useEffect(() => {
    if (location.pathname !== "/" || !("IntersectionObserver" in window))
      return;
    const els = sectionIds
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [location.pathname, sectionIds]);

  // The brass marker travels to the current link (measured, so it follows any language).
  useEffect(() => {
    const place = () => {
      const link = navRef.current?.querySelector<HTMLElement>(
        `[data-id="${activeSection}"]`,
      );
      if (link)
        setMarker({ left: link.offsetLeft + 12, width: link.offsetWidth - 24 });
    };
    place();
    window.addEventListener("resize", place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener("resize", place);
  }, [activeSection, t]);

  const expanded = overlay && !scrolled && !menuOpen;

  return (
    <header
      data-state={expanded ? "top" : "compact"}
      className={cn(
        "site-header fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]",
        expanded ? "header-top" : "header-compact",
        overlay && "header-intro",
      )}
    >
      <div
        className={cn(
          "container flex items-center gap-8 transition-[height] duration-500 [transition-timing-function:var(--ease-out)]",
          expanded ? "h-16 lg:h-[88px]" : "h-16 lg:h-[68px]",
        )}
      >
        <Link
          to="/"
          className="-ms-1 flex shrink-0 items-center gap-3.5 rounded-sm py-1 ps-1 pe-2"
          aria-label="Drive Prime"
        >
          <img
            src={logo}
            alt=""
            width={44}
            height={44}
            className={cn(
              "rounded-full transition-[width,height] duration-500 [transition-timing-function:var(--ease-out)]",
              expanded ? "h-10 w-10 lg:h-11 lg:w-11" : "h-10 w-10",
            )}
          />
          <span className="type-wide text-[18px] font-semibold tracking-[-0.01em] text-foreground">
            Drive Prime
          </span>
        </Link>

        <nav
          ref={navRef}
          aria-label={t.nav.mainNav}
          className="relative ms-auto hidden items-center gap-1 lg:flex"
        >
          {navLinks.map((link) => {
            const current = activeSection === link.id;
            return (
              <Link
                key={link.id}
                to={`/#${link.id}`}
                aria-current={current ? "true" : undefined}
                data-current={current || undefined}
                data-id={link.id}
                className="nav-link relative rounded-sm px-3 py-2 text-[14px] font-medium"
              >
                {link.name}
              </Link>
            );
          })}
          <span
            aria-hidden="true"
            className="nav-marker"
            data-visible={activeSection ? "" : undefined}
            style={{ left: marker.left, width: marker.width }}
          />
        </nav>

        <div className="hidden items-center lg:flex">
          <LanguageSwitcher />
          <span
            className="mx-1 h-3.5 w-px bg-foreground/20"
            aria-hidden="true"
          />
          <CurrencySwitcher />
        </div>

        <a
          href={whatsappUrl(t.whatsapp.general)}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-book hidden h-11 items-center gap-2.5 rounded-sm bg-primary ps-4 pe-3.5 text-[14px] font-semibold text-primary-foreground lg:inline-flex"
        >
          <WhatsAppIcon className="h-4 w-4" />
          {t.nav.book}
          <ArrowRight
            className="cta-arrow h-4 w-4 rtl:rotate-180"
            aria-hidden="true"
          />
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
          className="-me-2 ms-auto grid h-11 w-11 place-items-center rounded-sm text-foreground lg:hidden"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Signature: reading-progress hairline (brass), shown once the page moves */}
      <span ref={progressRef} aria-hidden="true" className="header-progress" />

      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="h-[calc(100dvh-4rem)] overflow-y-auto bg-background lg:hidden"
      >
        <nav
          aria-label={t.nav.mainNav}
          className="container flex flex-col pb-10 pt-4"
        >
          {navLinks.map((link) => (
            <Link
              key={link.id}
              to={`/#${link.id}`}
              // Close in the same render as the navigation, so the scroll lock is released before scrolling.
              onClick={() => setMenuOpen(false)}
              className="type-wide border-b border-border py-4 text-2xl font-semibold text-foreground"
            >
              {link.name}
            </Link>
          ))}
          <div className="mt-8 flex items-center gap-2">
            <LanguageSwitcher className="h-11 border border-border px-3" />
            <CurrencySwitcher className="h-11 border border-border px-3" />
          </div>
          <a
            href={whatsappUrl(t.whatsapp.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-8"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {t.hero.ctaWhatsapp}
          </a>
        </nav>
      </div>
    </header>
  );
}
