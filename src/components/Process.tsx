import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { whatsappUrl } from "@/config/business";
import { WhatsAppIcon } from "./icons";
import riad800 from "@/assets/riad-800.webp";
import riad1400 from "@/assets/riad-1400.webp";

/*
  Booking steps beside the second Marrakech photograph. Mirrors the hero composition
  (photo on the opposite side, inner edge melting into the page) to give the page a rhythm.
*/
export default function Process() {
  const { t } = useLanguage();

  return (
    <section id="reserver" aria-labelledby="process-title" className="relative py-24 lg:py-0">
      <div className="lg:grid lg:min-h-[640px] lg:grid-cols-12">
        <div className="relative mb-12 aspect-[16/10] overflow-hidden lg:col-span-5 lg:mb-0 lg:aspect-auto">
          <img
            src={riad800}
            srcSet={`${riad800} 800w, ${riad1400} 1400w`}
            sizes="(min-width: 1024px) 42vw, 100vw"
            alt=""
            width={1400}
            height={793}
            loading="lazy"
            decoding="async"
            className="process-photo absolute inset-0 h-full w-full object-cover object-[52%_62%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(var(--background))_0%,transparent_18%,transparent_80%,hsl(var(--background))_100%)]"
          />
        </div>

        <div className="container lg:col-span-7 lg:flex lg:max-w-none lg:flex-col lg:justify-center lg:pe-[max(2.5rem,calc((100vw-1360px)/2))] lg:ps-14 lg:py-28">
          <h2 id="process-title" className="type-display text-4xl font-semibold text-foreground sm:text-5xl">
            {t.process.title}
          </h2>

          <ol className="mt-12 space-y-9">
            {t.process.steps.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-x-4">
                <span className="tabular type-wide pt-0.5 text-[15px] font-semibold text-primary">{i + 1}</span>
                <div>
                  <h3 className="type-wide text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-wrap gap-3">
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
      </div>
    </section>
  );
}
