import type { CSSProperties } from "react";
import { vehicles } from "@/data/vehicles";
import { useLanguage } from "@/i18n/LanguageContext";
import BookingForm from "./BookingForm";
import hero960 from "@/assets/hero-960.webp";
import hero1680 from "@/assets/hero-1680.webp";

// Entrance timing (CSS animations in index.css; disabled by prefers-reduced-motion).
const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section id="accueil" aria-labelledby="hero-title" className="relative bg-background">
      {/*
        Mobile: the photo is a band with the whole car visible, text sits below it.
        Desktop: full-bleed photo, text over the empty wall on the left (in both LTR and RTL,
        so the car is never covered), with a directional scrim behind it.
      */}
      <div className="relative lg:h-[100svh] lg:min-h-[720px] lg:max-h-[1080px] lg:overflow-hidden">
        <div className="relative h-[54svh] min-h-[300px] max-h-[520px] overflow-hidden lg:absolute lg:inset-0 lg:h-auto lg:max-h-none">
          <img
            src={hero1680}
            srcSet={`${hero960} 960w, ${hero1680} 1680w`}
            sizes="100vw"
            alt={t.hero.photoAlt}
            width={1680}
            height={934}
            {...{ fetchpriority: "high" }}
            decoding="async"
            className="anim-photo absolute inset-0 h-full w-full object-cover object-[58%_70%] lg:object-[70%_50%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(30_5%_7.5%/0.75)_0%,transparent_28%,transparent_62%,hsl(30_5%_7.5%)_100%)] lg:bg-[linear-gradient(to_bottom,hsl(30_5%_7.5%/0.7)_0%,transparent_22%,transparent_45%,hsl(30_5%_7.5%/0.85)_78%,hsl(30_5%_7.5%)_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden lg:block bg-[linear-gradient(to_right,hsl(30_5%_7.5%/0.8)_0%,hsl(30_5%_7.5%/0.4)_36%,transparent_58%)]"
          />
        </div>

        <div className="container relative z-10 -mt-10 lg:mt-0 lg:flex lg:h-full lg:flex-col lg:justify-end lg:pb-[13.5rem] lg:rtl:items-end">
          <div className="lg:max-w-[40rem]">
            <h1
              id="hero-title"
              style={delay(250)}
              className="anim-rise type-display max-w-[14ch] text-[2.5rem] sm:text-6xl lg:text-[4.25rem] font-semibold text-foreground"
            >
              {t.hero.title}
            </h1>
            <p
              style={delay(400)}
              className="anim-rise mt-5 max-w-[44ch] text-base sm:text-lg leading-relaxed text-foreground/80"
            >
              {t.hero.subtitle(vehicles.length)}
            </p>
          </div>
        </div>
      </div>

      {/* Booking panel: anchored to the bottom edge of the photo on desktop */}
      <div className="container relative z-20 mt-10 lg:-mt-[11rem]">
        <div
          style={delay(550)}
          className="anim-rise rounded-md border border-border bg-card p-5 sm:p-6 lg:p-7 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)]"
        >
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="type-wide text-lg font-semibold text-foreground">{t.booking.title}</h2>
            <p className="hidden md:block text-[13px] text-muted-foreground">{t.booking.note}</p>
          </div>
          <BookingForm layout="bar" />
          <p className="md:hidden mt-4 text-[13px] text-muted-foreground">{t.booking.note}</p>
        </div>
      </div>
    </section>
  );
}
