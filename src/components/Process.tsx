import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useBooking } from "@/context/BookingContext";
import { whatsappUrl } from "@/config/business";
import { bookingRequest } from "@/lib/booking-message";
import { vehicles } from "@/data/vehicles";
import { useEffect, useRef, useState } from "react";
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
  const listRef = useRef<HTMLOListElement>(null);
  // Number of steps reached (0–3). Scroll-linked on desktop; all reached on phones / reduced motion.
  const [reached, setReached] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const animate =
      document.documentElement.classList.contains("js-motion") && window.matchMedia("(min-width: 768px)").matches;
    if (!animate) {
      list.style.setProperty("--journey", "1");
      setReached(3);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = list.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the steps enter the lower part of the screen, 1 once they sit in its upper half
      const p = Math.min(1, Math.max(0, (vh * 0.9 - rect.top) / (vh * 0.55)));
      const dots = list.querySelectorAll<HTMLElement>(".journey-dot");
      const lastDot = dots[dots.length - 1];
      const trackW = list.clientWidth;
      // the line ends under the centre of the last step's number, measured from the inline start
      const lr = list.getBoundingClientRect();
      const dr = lastDot?.getBoundingClientRect();
      const end = dr
        ? document.documentElement.dir === "rtl"
          ? lr.right - (dr.left + dr.width / 2)
          : dr.left + dr.width / 2 - lr.left
        : trackW;
      list.style.setProperty("--track-w", `${trackW}px`);
      list.style.setProperty("--journey", String((p * end) / trackW));
      setReached(p < 0.08 ? 0 : p < 0.5 ? 1 : p < 0.94 ? 2 : 3);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // Listen to scroll only while the journey is on screen.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener("scroll", onScroll, { passive: true });
        update();
      } else window.removeEventListener("scroll", onScroll);
    });
    io.observe(list);
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
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
          ref={listRef}
          data-step={reached || undefined}
          className="journey no-scrollbar relative -mx-5 mt-14 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0"
        >
          {/* progress line (desktop): follows the scroll; a minimal car outline rides its head */}
          <span aria-hidden="true" className="journey-track hidden md:block">
            <span className="journey-fill" />
            <svg className="journey-car" viewBox="0 0 34 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 10.5h3m5.5 0h13m5.5 0h3.5v-2.2c0-1.1-.8-1.9-1.9-2.1l-4.6-.9-4.2-3.2c-.7-.5-1.5-.8-2.4-.8h-7.2c-1 0-1.9.4-2.6 1.1L5.5 6.1l-2.6.6c-.8.2-1.4.9-1.4 1.8v2" />
              <circle cx="7.3" cy="10.6" r="2.3" />
              <circle cx="25.8" cy="10.6" r="2.3" />
            </svg>
          </span>
          {t.process.steps.map((step, i) => (
            <li
              key={step.title}
              data-active={i < reached || undefined}
              data-pending={i >= reached || undefined}
              className="journey-step relative w-[84%] shrink-0 snap-start md:w-auto"
            >
              <div className="flex items-center gap-3">
                <span className="journey-dot tabular type-wide relative z-10 grid h-9 w-9 place-items-center rounded-full border border-primary/70 bg-card text-[14px] font-semibold text-primary">
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
