import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { business, whatsappUrl, hasConfirmedServices } from "@/config/business";
import { InstagramIcon, TikTokIcon } from "./icons";
import logo from "@/assets/logo-160.webp";

export default function Footer() {
  const { t } = useLanguage();

  const navLinks = [
    { to: "/#flotte", label: t.nav.fleet },
    ...(hasConfirmedServices ? [{ to: "/#services", label: t.nav.services }] : []),
    { to: "/#reserver", label: t.nav.howItWorks },
    { to: "/#contact", label: t.nav.contact },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="container grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link to="/" className="inline-flex items-center gap-3" aria-label="Drive Prime">
            <img src={logo} alt="" width={44} height={44} loading="lazy" className="h-11 w-11 rounded-full" />
            <span className="type-wide text-lg font-semibold text-foreground">Drive Prime</span>
          </Link>
          <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
            {t.footer.description}
          </p>
          <div className="mt-6 flex gap-1 -ms-2.5">
            <a
              href={business.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="grid h-10 w-10 place-items-center rounded-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href={business.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="grid h-10 w-10 place-items-center rounded-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <TikTokIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <nav aria-label={t.footer.explore} className="md:col-span-3">
          <h2 className="text-[14px] font-medium text-muted-foreground">{t.footer.explore}</h2>
          <ul className="mt-4 space-y-3">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-[15px] text-foreground/85 hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="text-[14px] font-medium text-muted-foreground">{t.footer.contact}</h2>
          <ul className="mt-4 space-y-3 text-[15px]">
            <li>
              <a
                href={whatsappUrl(t.whatsapp.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/85 hover:text-foreground transition-colors"
              >
                WhatsApp <span dir="ltr">{business.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${business.email}`} className="break-all text-foreground/85 hover:text-foreground transition-colors">
                {business.email}
              </a>
            </li>
            <li className="text-foreground/85">{t.contact.addressValue}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container py-6 text-[13px] text-muted-foreground">
          © {new Date().getFullYear()} Drive Prime. {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
