import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { vehicles } from "@/data/vehicles";
import { useLanguage } from "@/i18n/LanguageContext";
import { confirmed } from "@/config/business";
import BookingForm from "./BookingForm";
import PriceTag from "./PriceTag";
import hero960 from "@/assets/hero-960.webp";
import hero1680 from "@/assets/hero-1680.webp";

// Entrance timing (CSS animations in index.css; disabled by prefers-reduced-motion).
const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });
// Lowest daily rate in the fleet data — a fact from the price list, not a promotion.
const LOWEST_RATE = Math.min(...vehicles.map((v) => v.pricePerDay));
// Rental policies from the original hero: listed only once the owner confirms each one.
const POLICIES = (Object.keys(confirmed.policies) as (keyof typeof confirmed.policies)[]).filter(
  (k) => confirmed.policies[k],
);

/*
  Cinematic hero: the photograph fills the screen, the copy sits on its dark side, and the
  booking engine (location, dates → vehicles) is anchored to the bottom of the image —
  the first thing a visitor can act on.
*/
export default function Hero() {
  const { t } = useLanguage();

  return (
    <section id="accueil" aria-labelledby="hero-title" className="relative bg-background">
      <div className="relative lg:h-[100svh] lg:min-h-[720px] lg:max-h-[960px] lg:overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto">
        <img
          src={hero1680}
          srcSet={`${hero960} 960w, ${hero1680} 1680w`}
          sizes="100vw"
          alt={t.hero.photoAlt}
          width={1680}
          height={934}
          {...{ fetchpriority: "high" }}
          decoding="async"
          className="anim-photo hero-photo hero-depth absolute inset-0 h-full w-full object-cover"
        />
        {/* Legibility: header band on top, the floor where the engine sits, and the copy side */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(var(--background)/0.75)_0%,transparent_22%,transparent_40%,hsl(var(--background)/0.9)_80%,hsl(var(--background))_100%)]"
        />
        <div aria-hidden="true" className="hero-side-scrim absolute inset-0 hidden lg:block" />
        </div>

        <div className="container relative z-10 -mt-8 pb-24 lg:mt-0 lg:flex lg:h-full lg:flex-col lg:justify-center lg:pb-44">
          <div className="max-w-[34rem] lg:max-w-[29rem] lg:rtl:ms-auto">
            <h1
              id="hero-title"
              style={delay(220)}
              className="anim-rise type-display text-[2.35rem] font-semibold text-foreground sm:text-[3.4rem] lg:text-[4rem]"
            >
              {t.hero.title}
            </h1>
            <p
              style={delay(300)}
              className="anim-enter mt-5 max-w-[42ch] text-base leading-relaxed text-foreground/80 sm:text-lg"
            >
              {t.hero.subtitle(vehicles.length)}
            </p>
            <div style={delay(380)} className="anim-enter mt-6">
              <PriceTag pricePerDay={LOWEST_RATE} size="sm" layout="inline" />
            </div>
          </div>
        </div>
      </div>

      {/* Booking engine, anchored on the photograph */}
      <div className="container relative z-20 -mt-14 lg:-mt-32">
        <div
          style={delay(440)}
          className="anim-enter rounded-lg border border-foreground/10 bg-card p-5 shadow-[0_40px_90px_-35px_rgb(0_0_0/0.9)] sm:p-6 lg:p-8"
        >
          <BookingForm layout="engine" />
          {POLICIES.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-2 border-t border-border pt-4 text-[13px] text-muted-foreground">
              {POLICIES.map((key) => (
                <li key={key} className="inline-flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {t.booking.policies[key]}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
