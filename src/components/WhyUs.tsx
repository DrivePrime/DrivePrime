import type { CSSProperties } from "react";
import { vehicles } from "@/data/vehicles";
import { stageZoom } from "@/data/stage";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCurrency } from "@/i18n/CurrencyContext";
import { confirmed } from "@/config/business";

// A flagship of the real fleet, shown in its own studio photograph.
const FEATURED_ID = "range-rover-vogue";
const featured = vehicles.find((v) => v.id === FEATURED_ID) ?? vehicles[0];
const prices = vehicles.map((v) => v.pricePerDay);
const LOWEST = Math.min(...prices);
const HIGHEST = Math.max(...prices);

/*
  "Pourquoi nous choisir ?" — the page turns to daylight. Four short, legible arguments from
  the original site on a bone surface; the car sits in a dark "studio window" (its photo's own
  backdrop) with facts taken only from the data or confirmed by the owner.
*/
export default function WhyUs() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const w = t.whyUs;

  const facts = [
    w.factVehicles(vehicles.length),
    w.factRange(formatPrice(LOWEST), formatPrice(HIGHEST)),
    ...(confirmed.services.support24h ? [w.factSupport] : []),
  ];

  return (
    <section id="pourquoi" aria-labelledby="whyus-title" className="surface-light py-24 lg:py-32">
      <div className="container grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-6" data-reveal="rise">
          <h2 id="whyus-title" className="type-display text-4xl font-semibold text-foreground sm:text-5xl lg:text-[3.5rem]">
            {w.title}
          </h2>
          <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-muted-foreground sm:text-lg">{w.intro}</p>

          <ul
            data-reveal="stagger"
            style={{ "--reveal-delay": "220ms" } as CSSProperties}
            className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2"
          >
            {w.reasons.map((reason, i) => (
              <li key={reason.title} style={{ "--i": i } as CSSProperties}>
                <h3 className="type-wide text-[1.35rem] font-semibold leading-tight text-foreground">{reason.title}</h3>
                <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-muted-foreground">{reason.description}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Studio window: the photo's own night backdrop, framed as an object on the light page */}
        <figure data-reveal="clip" className="studio-window relative overflow-hidden rounded-xl lg:col-span-6">
          <div className="stage" style={{ "--stage-zoom": stageZoom(featured.id) } as CSSProperties}>
            <img
              src={featured.image}
              srcSet={`${featured.thumb} 768w, ${featured.image} 1536w`}
              sizes="(min-width: 1024px) 46vw, 100vw"
              alt={featured.name}
              width={1536}
              height={1024}
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption className="relative px-6 pb-6 sm:px-8 sm:pb-8">
            <ul aria-label={w.factsLabel} className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px]">
              {facts.map((fact, i) => (
                <li key={fact} className="flex items-center gap-5">
                  {i > 0 && <span aria-hidden="true" className="h-4 w-px bg-white/20" />}
                  <span className="tabular font-semibold text-[#ede9e3]">{fact}</span>
                </li>
              ))}
            </ul>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
