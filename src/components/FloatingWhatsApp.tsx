import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { whatsappUrl } from "@/config/business";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";

/*
  Floating WhatsApp button (restored from the original site). It appears once the visitor
  has scrolled past the hero on desktop (the header already has a booking button there); on phones,
  where the header has no booking button, it is always shown.
  `hideOnMobile`: pages with their own sticky booking bar on phones (vehicle pages).
*/
export default function FloatingWhatsApp({ hideOnMobile = false }: { hideOnMobile?: boolean }) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const phone = window.matchMedia("(max-width: 1023px)");
    const onScroll = () => setVisible(phone.matches || window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={whatsappUrl(t.whatsapp.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.floating}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] end-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgb(0_0_0/0.6)] transition-[opacity,transform] duration-300 [transition-timing-function:var(--ease-out)] hover:scale-105 active:scale-95",
        visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3",
        hideOnMobile && "max-lg:hidden",
      )}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
