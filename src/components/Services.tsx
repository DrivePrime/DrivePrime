import { useLanguage } from "@/i18n/LanguageContext";
import { confirmed, type ServiceKey } from "@/config/business";
import riad800 from "@/assets/riad-800.webp";
import riad1400 from "@/assets/riad-1400.webp";

export default function Services() {
  const { t } = useLanguage();
  const items = t.services.items.filter((item) => confirmed.services[item.key as ServiceKey]);
  if (items.length === 0) return null;

  return (
    <section id="services" aria-labelledby="services-title" className="border-t border-border py-24 lg:py-32">
      <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <h2 id="services-title" className="type-display text-4xl sm:text-5xl font-semibold text-foreground">
              {t.services.title}
            </h2>
            <div className="mt-10 aspect-[4/3] overflow-hidden rounded-md bg-card">
              <img
                src={riad800}
                srcSet={`${riad800} 800w, ${riad1400} 1400w`}
                sizes="(min-width: 1024px) 38vw, 92vw"
                alt=""
                width={800}
                height={453}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-[55%_60%]"
              />
            </div>
          </div>
        </div>

        <ul className="lg:col-span-7 lg:pt-2">
          {items.map((service) => (
            <li
              key={service.title}
              className="grid gap-2 border-b border-border py-7 first:pt-0 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-10"
            >
              <h3 className="type-wide text-lg font-semibold text-foreground">{service.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted-foreground">{service.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
