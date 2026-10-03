import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { confirmed, whatsappUrl, type ServiceKey } from "@/config/business";
import { WhatsAppIcon } from "./icons";
import riad800 from "@/assets/riad-800.webp";
import riad1400 from "@/assets/riad-1400.webp";

/*
  "Nos services" — photo-led. The riad photograph is the delivery service made visible;
  the six services of the original site follow as a calm typographic grid (no icon cards).
*/
export default function Services() {
  const { t } = useLanguage();
  const items = t.services.items.filter((item) => confirmed.services[item.key as ServiceKey]);
  if (items.length === 0) return null;

  return (
    <section id="services" aria-labelledby="services-title" className="pb-24 pt-10 lg:pb-32 lg:pt-12">
      <div className="container">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="services-title" className="type-display text-4xl font-semibold text-foreground sm:text-5xl lg:col-span-6">
            {t.services.title}
          </h2>
          <p className="max-w-[46ch] text-base leading-relaxed text-muted-foreground sm:text-lg lg:col-span-5 lg:col-start-8">
            {t.services.intro}
          </p>
        </div>

        <figure className="relative mt-12 overflow-hidden rounded-md lg:mt-16">
          <div className="relative aspect-[4/3] sm:aspect-[16/8] lg:aspect-[21/9]">
            <img
              src={riad1400}
              srcSet={`${riad800} 800w, ${riad1400} 1400w`}
              sizes="(min-width: 1440px) 1360px, 100vw"
              alt=""
              width={1400}
              height={793}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[50%_62%]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--background)/0.85)_0%,transparent_45%)]"
            />
          </div>
          <figcaption className="absolute bottom-5 end-5 max-w-[30ch] text-end text-[15px] font-medium leading-snug text-foreground sm:bottom-7 sm:end-8 sm:text-lg">
            {t.services.photoCaption}
          </figcaption>
        </figure>

        <ul className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-y-14">
          {items.map((service) => (
            <li key={service.key} className="border-t border-foreground/15 pt-6">
              <h3 className="type-wide text-lg font-semibold text-foreground sm:text-xl">{service.title}</h3>
              <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-muted-foreground">{service.description}</p>
              {service.key === "quickBooking" && (
                <a
                  href={whatsappUrl(t.whatsapp.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/wa mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-primary transition-colors hover:text-gold-light"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {t.hero.ctaWhatsapp}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/wa:translate-x-0.5 rtl:rotate-180 rtl:group-hover/wa:-translate-x-0.5" />
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
