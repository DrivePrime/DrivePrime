import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Check } from "lucide-react";
import { vehicles } from "@/data/vehicles";
import { useLanguage } from "@/i18n/LanguageContext";
import { confirmed } from "@/config/business";
import BookingForm from "./BookingForm";
import PriceTag from "./PriceTag";
import hero960 from "@/assets/hero-960.webp";
import hero1680 from "@/assets/hero-1680.webp";

// Entrance timing (CSS animations in index.css; disabled by prefers-reduced-motion).
const delay = (ms: number): CSSProperties =>
  ({ "--d": `${ms}ms` }) as CSSProperties;
// Lowest daily rate in the fleet data — a fact from the price list, not a promotion.
const LOWEST_RATE = Math.min(...vehicles.map((v) => v.pricePerDay));
// Rental policies from the original hero: listed only once the owner confirms each one.
const POLICIES = (
  Object.keys(confirmed.policies) as (keyof typeof confirmed.policies)[]
).filter((k) => confirmed.policies[k]);
// Cinematic loop made from the hero photograph (H.264 for every browser; the HEVC original is kept in design-assets/originals/video).
const HERO_VIDEO = "/videos/hero-drive-prime-h264.mp4";

/*
  Cinematic hero. The photograph is painted first (it is the poster, the LCP image and the
  fallback); the short film starts once the page has loaded, fades in over it, plays once and
  rests on its last frame — its end does not match its start, so it is not looped.
  Not played with reduced motion, Save-Data or a slow connection. The film is drawn 1 px inside the photograph's
  frame (same picture underneath): it never replaces the photograph as the page's largest paint. All copy and the booking engine are real HTML.
  Entrance: kicker → headline line by line → description → price → booking engine (~1.7 s).
*/
export default function Hero() {
  const { t } = useLanguage();
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // slow or metered connections keep the photograph: the film is an enhancement, never a wait
    const net = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const slow =
      !!net &&
      (net.saveData ||
        (net.effectiveType !== undefined && net.effectiveType !== "4g"));
    if (reduce || slow) return;
    let idle = 0;
    const start = () => {
      v.src = HERO_VIDEO;
      v.play().catch(() => undefined); // autoplay refused: the photograph stays
    };
    // after the load event, so the film never competes with the photograph and the fonts
    const later = () => {
      const ric = (
        window as Window & {
          requestIdleCallback?: (cb: () => void, o?: object) => number;
        }
      ).requestIdleCallback;
      idle = ric
        ? ric(start, { timeout: 1200 })
        : window.setTimeout(start, 300);
    };
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
    const onPlaying = () => setPlaying(true);
    const onError = () => setPlaying(false);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("error", onError);
    return () => {
      window.removeEventListener("load", later);
      const cic = (
        window as Window & { cancelIdleCallback?: (id: number) => void }
      ).cancelIdleCallback;
      if (cic) cic(idle);
      window.clearTimeout(idle);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("error", onError);
      v.pause();
      v.removeAttribute("src");
      v.load();
    };
  }, []);

  return (
    <section
      id="accueil"
      aria-labelledby="hero-title"
      className="relative bg-background"
    >
      <div className="relative lg:h-[100svh] lg:min-h-[720px] lg:max-h-[960px] lg:overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto">
          <div className="anim-photo hero-depth absolute inset-0">
            <img
              src={hero1680}
              srcSet={`${hero960} 960w, ${hero1680} 1680w`}
              sizes="100vw"
              alt={t.hero.photoAlt}
              width={1680}
              height={934}
              {...{ fetchpriority: "high" }}
              decoding="async"
              className="hero-photo absolute inset-0 h-full w-full object-cover"
            />
            <video
              ref={video}
              muted
              playsInline
              preload="none"
              disablePictureInPicture
              disableRemotePlayback
              aria-hidden="true"
              tabIndex={-1}
              className="hero-photo hero-video absolute inset-px h-[calc(100%-2px)] w-[calc(100%-2px)] object-cover"
              data-on={playing || undefined}
            />
          </div>
          {/* Legibility, kept light around the car: navbar band, copy side, the floor of the engine */}
          <div aria-hidden="true" className="hero-scrim absolute inset-0" />
          <div
            aria-hidden="true"
            className="hero-side-scrim absolute inset-0 hidden lg:block"
          />
        </div>

        <div className="container relative z-10 -mt-8 pb-24 lg:mt-0 lg:flex lg:h-full lg:flex-col lg:justify-center lg:pb-44">
          <div className="max-w-[34rem] lg:max-w-[30rem] xl:max-w-[42rem] lg:rtl:ms-auto">
            <p style={delay(250)} className="hero-in kicker">
              <span aria-hidden="true" className="kicker-rule" />
              {t.hero.kicker}
            </p>
            <h1 id="hero-title" className="mt-5">
              <span className="type-display block text-[2.6rem] font-semibold leading-[1.02] text-foreground sm:text-[3.6rem] lg:text-[clamp(3.4rem,4.3vw,4.4rem)] xl:[&>span]:whitespace-nowrap">
                {t.hero.headline.map((line, i) => (
                  <span
                    key={i}
                    style={delay(350 + i * 110)}
                    className="hero-line block"
                  >
                    {line}{" "}
                  </span>
                ))}
              </span>{" "}
              <span style={delay(620)} className="hero-in hero-sub mt-5 block">
                {t.hero.title}
              </span>
            </h1>
            <p
              style={delay(720)}
              className="hero-in mt-4 max-w-[42ch] text-base leading-relaxed text-foreground/75 sm:text-lg"
            >
              {t.hero.subtitle(vehicles.length)}
            </p>
            <div style={delay(820)} className="hero-in mt-6">
              <PriceTag
                pricePerDay={LOWEST_RATE}
                size="md"
                layout="inline"
                accent
              />
            </div>
          </div>
        </div>
      </div>

      {/* Booking engine, anchored on the photograph */}
      <div className="container relative z-20 -mt-14 lg:-mt-32">
        <div
          style={delay(940)}
          className="hero-engine rounded-lg border border-foreground/10 bg-card p-5 shadow-[0_40px_90px_-35px_rgb(0_0_0/0.9)] sm:p-6 lg:p-8"
        >
          <BookingForm layout="engine" />
          {POLICIES.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-2 border-t border-border pt-4 text-[13px] text-muted-foreground">
              {POLICIES.map((key) => (
                <li key={key} className="inline-flex items-center gap-2">
                  <Check
                    className="h-3.5 w-3.5 text-primary"
                    aria-hidden="true"
                  />
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
