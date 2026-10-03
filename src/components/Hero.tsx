import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { vehicles } from "@/data/vehicles";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCurrency } from "@/i18n/CurrencyContext";
import BookingForm from "./BookingForm";
import hero960 from "@/assets/hero-960.webp";
import hero1680 from "@/assets/hero-1680.webp";

// Entrance timing (CSS animations in index.css; disabled by prefers-reduced-motion).
const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });
// Lowest daily rate in the fleet data — a fact from the price list, not a promotion.
const LOWEST_RATE = Math.min(...vehicles.map((v) => v.pricePerDay));

export default function Hero() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  return (
    <section id="accueil" aria-labelledby="hero-title" className="relative bg-background">
      {/*
        Editorial split: the photograph owns the right side (left in Arabic) and is never
        covered by text; the copy sits in its own dark column. Phones: photo band, then copy.
      */}
      <div className="relative lg:grid lg:min-h-[min(92svh,880px)] lg:grid-cols-12">
        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9] lg:order-2 lg:col-span-7 lg:aspect-auto">
          <img
            src={hero1680}
            srcSet={`${hero960} 960w, ${hero1680} 1680w`}
            sizes="(min-width: 1024px) 60vw, 100vw"
            alt={t.hero.photoAlt}
            width={1680}
            height={934}
            {...{ fetchpriority: "high" }}
            decoding="async"
            className="anim-photo hero-photo absolute inset-0 h-full w-full object-cover object-[55%_62%] lg:object-[58%_50%]"
          />
          {/* Top: header legibility. Bottom (phones) / inner edge (desktop): melt into the page. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(var(--background)/0.7)_0%,transparent_26%,transparent_70%,hsl(var(--background))_100%)] lg:bg-[linear-gradient(to_bottom,hsl(var(--background)/0.65)_0%,transparent_22%,transparent_82%,hsl(var(--background))_100%)]"
          />
        </div>

        <div className="container relative z-10 -mt-6 lg:order-1 lg:col-span-5 lg:mt-0 lg:flex lg:max-w-none lg:flex-col lg:justify-center lg:pe-0 lg:ps-[max(2.5rem,calc((100vw-1360px)/2))] lg:pt-28 lg:pb-20">
          <h1
            id="hero-title"
            style={delay(200)}
            className="anim-rise type-display max-w-[16ch] text-[2.1rem] font-semibold text-foreground sm:text-[3rem] xl:text-[3.25rem]"
          >
            {t.hero.title}
          </h1>
          <p
            style={delay(320)}
            className="anim-rise mt-5 max-w-[40ch] text-base leading-relaxed text-foreground/75 sm:text-lg"
          >
            {t.hero.subtitle(vehicles.length)}
          </p>

          <div style={delay(440)} className="anim-rise mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link to="/#flotte" className="btn-primary group/cta">
              {t.hero.ctaFleet}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 rtl:rotate-180 rtl:group-hover/cta:-translate-x-0.5" />
            </Link>
            <p className="text-[14px] text-muted-foreground">
              {t.fleet.from}{" "}
              <span className="tabular font-semibold text-foreground">{formatPrice(LOWEST_RATE)}</span>{" "}
              {t.fleet.perDay}
            </p>
          </div>
        </div>
      </div>

      {/* Booking strip: one line on desktop, directly under the photograph */}
      <div className="container relative z-20 mt-10 lg:-mt-10">
        <div
          style={delay(520)}
          className="anim-rise rounded-md border border-border bg-card p-5 shadow-[0_30px_70px_-30px_rgb(0_0_0/0.8)] sm:p-6 lg:px-7 lg:py-6"
        >
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="type-wide text-lg font-semibold text-foreground">{t.booking.title}</h2>
            <p className="hidden text-[13px] text-muted-foreground md:block">{t.booking.note}</p>
          </div>
          <BookingForm layout="bar" />
          <p className="mt-4 text-[13px] text-muted-foreground md:hidden">{t.booking.note}</p>
        </div>
      </div>
    </section>
  );
}
