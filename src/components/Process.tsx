import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useBooking } from "@/context/BookingContext";
import { whatsappUrl } from "@/config/business";
import { bookingRequest } from "@/lib/booking-message";
import { vehicles } from "@/data/vehicles";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";
import hero960 from "@/assets/hero-960.webp";

// "Choose" miniature: three real categories of the fleet, the middle one selected.
const CHIPS = ["Économique", "Luxe", "SUV"] as const;
// Real fleet photos for "choose": a city car, an SUV and a flagship.
const TRIO = ["clio-5", "range-rover-sport", "mercedes-classe-g"]
  .map((id) => vehicles.find((v) => v.id === id))
  .filter((v): v is (typeof vehicles)[number] => !!v);

/*
  Booking as a journey: Choisir → Réserver → Rouler. Each step shows something real:
  fleet photos, the exact WhatsApp message the site sends (same builder as the real button),
  and the road. A brass line fills as the section comes into view.
*/
export default function Process() {
  const { t, language } = useLanguage();
  const booking = useBooking();
  const { ref, inView } = useInView<HTMLOListElement>(0.2);
  const preview = bookingRequest(t, language, { location: booking.location, start: booking.start, end: booking.end });

  const visuals = [
    // 1 — choose: a miniature of the real fleet picker (category chips + the chosen car)
    <div key="choose" className="flex h-full flex-col justify-between p-4">
      <div className="flex gap-1.5" aria-hidden="true">
        {CHIPS.map((cat, i) => (
          <span
            key={cat}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-medium",
              i === 1 ? "border-primary/70 bg-primary/10 text-foreground" : "border-border text-muted-foreground",
            )}
          >
            {t.fleet.categories[cat]}
          </span>
        ))}
      </div>
      <div className="stage -mx-4 -mb-4" style={{ "--stage-zoom": 1.12 } as CSSProperties}>
        <img src={TRIO[1].thumb} alt="" loading="lazy" decoding="async" width={768} height={512} />
      </div>
    </div>,
    // 2 — book: the real message preview
    <div key="book" className="flex h-full items-center justify-center p-5">
      <figure className="w-full max-w-[19rem]">
        <div className="rounded-lg rounded-ss-sm bg-[#1f2c34] px-4 py-3 text-start shadow-[0_20px_40px_-20px_rgb(0_0_0/0.8)]">
          <p dir="auto" className="whitespace-pre-line text-[13px] leading-relaxed text-[#e9edef]">
            {preview}
          </p>
          <p className="mt-1 text-end text-[11px] text-[#8696a0]">WhatsApp</p>
        </div>
        <figcaption className="mt-3 text-center text-[12px] text-muted-foreground">{t.process.previewCaption}</figcaption>
      </figure>
    </div>,
    // 3 — drive
    <img
      key="drive"
      src={hero960}
      alt=""
      loading="lazy"
      decoding="async"
      width={960}
      height={534}
      className="h-full w-full object-cover object-[78%_55%]"
    />,
  ];

  return (
    <section id="reserver" aria-labelledby="process-title" className="bg-card py-24 lg:py-32">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <h2 id="process-title" className="type-display text-4xl font-semibold text-foreground sm:text-5xl">
            {t.process.title}
          </h2>
          <div className="flex flex-wrap gap-3">
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

        <ol
          ref={ref}
          className={cn(
            "reveal journey no-scrollbar relative -mx-5 mt-14 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0",
            inView && "in-view",
          )}
        >
          {/* progress line (desktop): fills when the journey comes into view */}
          <span aria-hidden="true" className="journey-track absolute inset-x-0 top-[1.1rem] hidden h-px bg-foreground/12 md:block">
            <span className="journey-fill block h-full bg-primary" />
          </span>
          {t.process.steps.map((step, i) => (
            <li key={step.title} className="journey-step relative w-[84%] shrink-0 snap-start md:w-auto" style={{ "--i": i } as CSSProperties}>
              <div className="flex items-center gap-3">
                <span className="tabular type-wide relative z-10 grid h-9 w-9 place-items-center rounded-full border border-primary/70 bg-card text-[14px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="type-wide relative z-10 bg-card pe-3 ps-1 text-[15px] font-semibold text-foreground/80">
                  {t.process.stepLabels[i]}
                </span>
              </div>
              <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-lg bg-background">{visuals[i]}</div>
              <h3 className="type-wide mt-6 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
