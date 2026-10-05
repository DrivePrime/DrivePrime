import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { whatsappUrl } from "@/config/business";
import { useEffect, useRef, useState } from "react";
import { WhatsAppIcon } from "./icons";
import { BookDemo, ChooseDemo, DriveFilm } from "./ProcessDemos";

/*
  Booking as a journey: Choisir → Réserver → Rouler, told as one story: a miniature of the real
  fleet picker, the real booking + the exact WhatsApp message (no price), then the owner's film.
  A brass line fills as the section comes into view.
*/
export default function Process() {
  const { t } = useLanguage();
  const listRef = useRef<HTMLOListElement>(null);
  // Number of steps reached (0–3). Scroll-linked on desktop; all reached on phones / reduced motion.
  const [reached, setReached] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const animate =
      document.documentElement.classList.contains("js-motion") &&
      window.matchMedia("(min-width: 768px)").matches;
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
  // The story: the real fleet picker, the real booking + WhatsApp message, then the road
  const visuals = [
    <ChooseDemo key="choose" />,
    <BookDemo key="book" />,
    <DriveFilm key="drive" />,
  ];

  return (
    <section
      id="reserver"
      aria-labelledby="process-title"
      className="bg-card py-24 lg:py-32"
    >
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <h2
            id="process-title"
            className="type-display text-4xl font-semibold text-foreground sm:text-5xl"
          >
            {t.process.title}
          </h2>
          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappUrl(t.whatsapp.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
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
            <svg
              className="journey-car"
              viewBox="0 0 34 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
              <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-lg bg-background">
                {visuals[i]}
              </div>
              <h3 className="type-wide mt-6 text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
