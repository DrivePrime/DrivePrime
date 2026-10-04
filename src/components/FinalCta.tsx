import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { whatsappUrl } from "@/config/business";
import { vehicles } from "@/data/vehicles";
import { WhatsAppIcon } from "./icons";

const FEATURED_ID = "mercedes-classe-g";
const featured = vehicles.find((v) => v.id === FEATURED_ID) ?? vehicles[0];

/*
  Closing call to action: one of the fleet's icons, large, on its studio stage,
  with the two ways to book. Sits before the contact details.
*/
export default function FinalCta() {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="final-cta-title" className="relative overflow-hidden bg-card">
      <div className="container grid items-center gap-6 py-16 lg:grid-cols-12 lg:gap-10 lg:py-6">
        <div data-reveal="rise" className="relative z-10 lg:col-span-5 lg:py-20">
          <h2 id="final-cta-title" className="type-display text-4xl font-semibold text-foreground sm:text-5xl">
            {t.finalCta.title}
          </h2>
          <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-muted-foreground sm:text-lg">{t.finalCta.text}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href={whatsappUrl(t.whatsapp.general)} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <WhatsAppIcon className="h-4 w-4" />
              {t.hero.ctaWhatsapp}
            </a>
            <Link to="/#flotte" className="btn-ghost group/cta">
              {t.hero.ctaFleet}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 rtl:rotate-180 rtl:group-hover/cta:-translate-x-0.5" />
            </Link>
          </div>
        </div>
        <div data-reveal="clip" className="-mx-5 sm:mx-0 lg:col-span-7">
          <div className="stage" style={{ "--stage-zoom": 1.06 } as CSSProperties}>
            <img
              src={featured.image}
              srcSet={`${featured.thumb} 768w, ${featured.image} 1536w`}
              sizes="(min-width: 1024px) 56vw, 100vw"
              alt={featured.name}
              width={1536}
              height={1024}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
