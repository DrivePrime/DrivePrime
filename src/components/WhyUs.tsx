import type { CSSProperties } from "react";
import { vehicles } from "@/data/vehicles";
import { stageZoom } from "@/data/stage";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCurrency } from "@/i18n/CurrencyContext";
import { confirmed } from "@/config/business";

// A flagship of the real fleet anchors the section (its studio photo, nothing staged).
const FEATURED_ID = "range-rover-vogue";
const featured = vehicles.find((v) => v.id === FEATURED_ID) ?? vehicles[0];
const prices = vehicles.map((v) => v.pricePerDay);
const LOWEST = Math.min(...prices);
const HIGHEST = Math.max(...prices);

/*
  "Pourquoi nous choisir ?" — the original site's four arguments, a studio photo of the
  fleet, and only facts derived from the data (vehicle count, price range) or confirmed
  by the owner (24/7 assistance). Unverified figures (years, customers, rating) are not shown.
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
    <section id="pourquoi" aria-labelledby="whyus-title" className="relative overflow-hidden bg-card/60 py-20 lg:py-28">
      <div className="container grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-6 lg:order-2">
          <h2 id="whyus-title" className="type-display text-4xl font-semibold text-foreground sm:text-5xl">
            {w.title}
          </h2>
          <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-muted-foreground sm:text-lg">{w.intro}</p>

          <ul className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {w.reasons.map((reason) => (
              <li key={reason.title} className="border-t border-foreground/15 pt-5">
                <h3 className="type-wide text-lg font-semibold text-foreground">{reason.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{reason.description}</p>
              </li>
            ))}
          </ul>

          <ul className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px]" aria-label={w.factsLabel}>
            {facts.map((fact, i) => (
              <li key={fact} className="flex items-center gap-6">
                {i > 0 && <span aria-hidden="true" className="h-4 w-px bg-foreground/20" />}
                <span className="tabular font-semibold text-foreground">{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6 lg:order-1">
          <div className="stage" style={{ "--stage-zoom": stageZoom(featured.id) } as CSSProperties}>
            <img
              src={featured.image}
              srcSet={`${featured.thumb} 768w, ${featured.image} 1536w`}
              sizes="(min-width: 1024px) 50vw, 100vw"
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
