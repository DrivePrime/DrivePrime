import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { business, whatsappUrl, hasConfirmedServices } from "@/config/business";
import { vehicles, type Vehicle } from "@/data/vehicles";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "./icons";
import logo from "@/assets/logo-160.webp";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const FEATURED_ID = "mercedes-classe-g";
const featured = vehicles.find((v) => v.id === FEATURED_ID) ?? vehicles[0];

/*
  The last scene of the site, then the useful details.
  1. Closing invitation: two-line title, the two ways to book, a fleet car arriving from the edge,
     one brass line drawn towards it.
  2. Details: brand, navigation, contact; a thin bottom bar; the name set very large and faint.
  Entrance plays once (~1 s, overlapping) when each part comes into view, then nothing moves
  until the visitor interacts. The footer runs its own observer: it also closes vehicle pages.
*/
/** `vehicle`: on a vehicle page the closing scene shows that car rather than the default one. */
export default function Footer({ vehicle }: { vehicle?: Vehicle } = {}) {
  const shown = vehicle ?? featured;
  const { t, isRTL } = useLanguage();
  const root = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const fleetLink = useRef<HTMLAnchorElement>(null);
  const car = useRef<HTMLDivElement>(null);
  const [trace, setTrace] = useState<{
    w: number;
    h: number;
    d: string;
  } | null>(null);

  // The brass line leaves the fleet link and runs to the ground under the car's nearest wheel.
  // Measured with layout offsets (transforms ignored, so the entrance animation can't skew it);
  // lands right in every language, width and direction. Desktop only.
  useIsoLayoutEffect(() => {
    const within = (el: HTMLElement, stop: HTMLElement) => {
      let x = 0,
        y = 0,
        n: HTMLElement | null = el;
      while (n && n !== stop) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return { x, y };
    };
    const measure = () => {
      const b = box.current,
        link = fleetLink.current,
        c = car.current;
      if (!b || !link || !c || window.innerWidth < 1024) return setTrace(null);
      const l = within(link, b);
      const k = within(c, b);
      const sx = isRTL ? l.x - 20 : l.x + link.offsetWidth + 20;
      const sy = l.y + link.offsetHeight / 2;
      // the car box is lifted by translate-y-[-46%]; fleet photos face left, so the nearest wheel
      // is the front one in LTR (car on the right) and the rear one in RTL (car on the left)
      const top = k.y - c.offsetHeight * 0.46;
      const ex = k.x + c.offsetWidth * (isRTL ? 0.74 : 0.27);
      const ey = top + c.offsetHeight * 0.81;
      const dx = ex - sx;
      const d = `M ${sx} ${sy} C ${sx + dx * 0.5} ${sy}, ${sx + dx * 0.55} ${ey}, ${ex} ${ey}`;
      setTrace({ w: b.offsetWidth, h: b.offsetHeight, d });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [isRTL, t]);

  useEffect(() => {
    const parts = Array.from(
      root.current?.querySelectorAll<HTMLElement>("[data-foot]") ?? [],
    );
    if (
      !("IntersectionObserver" in window) ||
      !document.documentElement.classList.contains("js-motion")
    ) {
      parts.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting || e.boundingClientRect.bottom < 0) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -15% 0px", threshold: 0.15 },
    );
    parts.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const navLinks = [
    { to: "/#flotte", label: t.nav.fleet },
    ...(hasConfirmedServices
      ? [{ to: "/#services", label: t.nav.services }]
      : []),
    { to: "/#pourquoi", label: t.nav.whyUs },
    { to: "/#reserver", label: t.nav.howItWorks },
    { to: "/#temoignages", label: t.nav.testimonials },
    { to: "/#contact", label: t.nav.contact },
  ];

  return (
    <footer ref={root} className="foot relative overflow-hidden bg-background">
      {/* ── 1. The closing scene ── */}
      <section
        data-foot
        aria-labelledby="final-cta-title"
        className="foot-scene relative"
      >
        <div
          ref={box}
          className="container relative grid pb-6 pt-24 lg:min-h-[40rem] lg:grid-cols-12 lg:items-center lg:pb-24 lg:pt-28"
        >
          <div className="relative z-10 lg:col-span-7">
            <h2
              id="final-cta-title"
              className="type-display text-[2.6rem] font-semibold leading-[1.02] text-foreground sm:text-6xl lg:text-[clamp(2.75rem,3.95vw,4.6rem)] lg:[&_span]:whitespace-nowrap"
            >
              {t.finalCta.lines.map((line, i) => (
                <span
                  key={i}
                  className="foot-line block overflow-hidden pb-[0.08em]"
                >
                  <span
                    className="block"
                    style={
                      { "--d": `${80 + i * 110}ms` } as React.CSSProperties
                    }
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h2>
            <p
              className="foot-in mt-6 max-w-[40ch] text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={{ "--d": "260ms" } as React.CSSProperties}
            >
              {t.finalCta.text}
            </p>
            <div
              className="foot-in mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-7"
              style={{ "--d": "330ms" } as React.CSSProperties}
            >
              <a
                href={whatsappUrl(t.whatsapp.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary h-12 px-6"
              >
                <WhatsAppIcon className="h-4 w-4" />
                {t.hero.ctaWhatsapp}
              </a>
              <Link
                to="/#flotte"
                ref={fleetLink}
                className="foot-cta group/fc inline-flex h-12 items-center justify-center gap-2 text-[15px] font-medium text-foreground sm:justify-start"
              >
                <span className="foot-underline">{t.hero.ctaFleet}</span>
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-200 group-hover/fc:translate-x-1 rtl:rotate-180 rtl:group-hover/fc:-translate-x-1"
                />
              </Link>
            </div>
          </div>

          {/* A real fleet photo, arriving from the edge; its studio backdrop dissolves into the night */}
          <div
            aria-hidden="true"
            ref={car}
            className="foot-car pointer-events-none relative mt-6 w-[128%] max-w-none sm:mt-8 sm:w-[112%] lg:absolute lg:end-[-13vw] lg:top-1/2 lg:mt-0 lg:w-[60vw] lg:max-w-[70rem] lg:-translate-y-[46%]"
          >
            <div className="foot-car-in relative z-[1]">
              <img
                src={shown.image}
                srcSet={`${shown.thumb} 768w, ${shown.image} 1536w`}
                sizes="(min-width: 1024px) 60vw, 105vw"
                alt=""
                width={1536}
                height={1024}
                loading="lazy"
                decoding="async"
                className="foot-car-img block w-full"
              />
            </div>
          </div>

          {/* Signature: one brass line drawn from the text towards the car */}
          {trace && (
            <svg
              aria-hidden="true"
              className="foot-trace pointer-events-none absolute inset-0 h-full w-full"
              viewBox={`0 0 ${trace.w} ${trace.h}`}
            >
              <path d={trace.d} pathLength={1} />
            </svg>
          )}
        </div>
      </section>

      {/* ── 2. Details ── */}
      <div data-foot className="foot-info container relative z-10">
        <div className="grid gap-12 border-t border-foreground/10 pb-14 pt-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:pb-20 lg:pt-16">
          <div
            className="foot-in sm:col-span-2 lg:col-span-5"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-sm"
              aria-label="Drive Prime"
            >
              <img
                src={logo}
                alt=""
                width={44}
                height={44}
                loading="lazy"
                className="h-11 w-11 rounded-full"
              />
              <span className="type-wide text-lg font-semibold text-foreground">
                Drive Prime
              </span>
            </Link>
            <p className="type-display mt-7 max-w-[17ch] text-[1.6rem] font-medium leading-[1.15] text-foreground/75 lg:text-[1.9rem]">
              {t.footer.description}
            </p>
          </div>

          <nav
            aria-labelledby="foot-nav"
            className="foot-in lg:col-span-3"
            style={{ "--d": "70ms" } as React.CSSProperties}
          >
            <h2 id="foot-nav" className="text-[13px] text-muted-foreground/80">
              {t.footer.explore}
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 sm:grid-cols-1">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="foot-link group/fl">
                    <span>{link.label}</span>
                    <ArrowRight
                      aria-hidden="true"
                      className="foot-link-arrow h-3.5 w-3.5 rtl:rotate-180"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div
            className="foot-in lg:col-span-4"
            style={{ "--d": "140ms" } as React.CSSProperties}
          >
            <h2 className="text-[13px] text-muted-foreground/80">
              {t.footer.contact}
            </h2>
            <ul className="mt-4">
              <li>
                <a
                  href={whatsappUrl(t.whatsapp.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="foot-contact group/fk"
                >
                  <span className="text-[13px] text-muted-foreground">
                    {t.contact.whatsapp}
                  </span>
                  <span className="flex items-center gap-2">
                    <span dir="ltr" className="foot-underline">
                      {business.phoneDisplay}
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="foot-contact-arrow h-4 w-4"
                    />
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="foot-contact group/fk"
                >
                  <span className="text-[13px] text-muted-foreground">
                    {t.contact.email}
                  </span>
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="foot-underline truncate">
                      {business.email}
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="foot-contact-arrow h-4 w-4 shrink-0"
                    />
                  </span>
                </a>
              </li>
              <li className="flex flex-col gap-0.5 py-2.5">
                <span className="text-[13px] text-muted-foreground">
                  {t.contact.address}
                </span>
                <span className="text-[17px] text-foreground">
                  {t.contact.addressValue}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="foot-in flex flex-col-reverse gap-4 border-t border-foreground/10 py-6 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
          style={{ "--d": "200ms" } as React.CSSProperties}
        >
          <p>
            © {new Date().getFullYear()} Drive Prime. {t.footer.rights}
          </p>
          <div className="-ms-2 flex gap-1">
            <a
              href={business.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="foot-social"
            >
              <InstagramIcon className="h-4 w-4" />
              Instagram
            </a>
            <a
              href={business.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="foot-social"
            >
              <TikTokIcon className="h-4 w-4" />
              TikTok
            </a>
          </div>
        </div>
      </div>

      {/* The name, very large and faint, cut by the bottom edge */}
      <p
        aria-hidden="true"
        className="foot-mark type-display pointer-events-none select-none whitespace-nowrap text-center font-semibold leading-none"
        dir="ltr"
      >
        Drive Prime
      </p>
    </footer>
  );
}
