import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { whatsappUrl } from "@/config/business";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";

/*
  Floating WhatsApp button (restored from the original site).
  It stays out of the way where the page already offers WhatsApp in place:
  hidden over the hero and its booking engine, and while the contact section is on screen.
  `hideOnMobile`: pages with their own sticky booking bar on phones (vehicle pages).
*/
export default function FloatingWhatsApp({ hideOnMobile = false }: { hideOnMobile?: boolean }) {
  const { t } = useLanguage();
  const [pastHero, setPastHero] = useState(false);
  const [atContact, setAtContact] = useState(false);

  useEffect(() => {
    // Visibility driven by observers, not a scroll listener.
    const hero = document.getElementById("accueil");
    const contact = document.getElementById("contact");
    if (!("IntersectionObserver" in window)) {
      setPastHero(true);
      return;
    }
    if (!hero) setPastHero(true);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === hero) setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0);
        if (e.target === contact) setAtContact(e.isIntersecting);
      });
    });
    if (hero) io.observe(hero);
    if (contact) io.observe(contact);
    return () => io.disconnect();
  }, []);

  const visible = pastHero && !atContact;

  return (
    <a
      href={whatsappUrl(t.whatsapp.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.floating}
      aria-hidden={!visible || undefined}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] end-4 z-40 grid h-[52px] w-[52px] place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgb(0_0_0/0.6)] transition-[opacity,transform] duration-300 [transition-timing-function:var(--ease-premium)] hover:scale-105 active:scale-95 lg:bottom-6 lg:end-6 lg:h-14 lg:w-14",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        hideOnMobile && "max-lg:hidden",
      )}
    >
      <WhatsAppIcon className="h-6 w-6 lg:h-7 lg:w-7" />
    </a>
  );
}
