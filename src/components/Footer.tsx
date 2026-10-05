import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, MoveHorizontal } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { business, whatsappUrl, hasConfirmedServices } from "@/config/business";
import { vehicles, type Vehicle } from "@/data/vehicles";
import {
  FacebookIcon,
  InstagramIcon,
  SnapchatIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "./icons";
import logo from "@/assets/logo-160.webp";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

import type { CarLayout } from "./footer-car-3d";

const FEATURED_ID = "mercedes-classe-g";

/*
  3D Classe G (G63 model) — LOCAL PROTOTYPE ONLY: the model's licence is non-commercial.
  Enabled in `vite` dev, or in a local build made with VITE_G63_LOCAL=true. A normal build never
  loads it, and vite.config removes public/models from the output.
*/
const G63_3D = import.meta.env.DEV || import.meta.env.VITE_G63_LOCAL === "true";
const G63_URL = "/models/g63/2020_mercedes-benz_g-class_amg_g_63.glb";
const hasWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};
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
  const title = useRef<HTMLHeadingElement>(null);
  const car = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const use3d = G63_3D && shown.id === FEATURED_ID;
  // "photo" until the model is loaded and its first frame drawn; then a crossfade to "3d"
  const [carMode, setCarMode] = useState<"photo" | "3d">("photo");
  const [hint, setHint] = useState(true);
  // 3D car staging reported by the stage (fractions of the canvas): where the brass line fades
  // out, where the car sits (studio light, hint). null = the photo.
  const [layout, setLayout] = useState<CarLayout | null>(null);
  const copy = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  const paragraph = useRef<HTMLParagraphElement>(null);
  const [hintTop, setHintTop] = useState<number | null>(null);

  // Load the 3D car only when the closing scene approaches (13 MB model), never with the page.
  // Any failure (no WebGL, network, parse) leaves the photo in place.
  useEffect(() => {
    if (!use3d || !car.current || !canvas.current || !hasWebGL()) return;
    let stage: { dispose(): void } | null = null;
    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1]; // latest state wins
        if (!e.isIntersecting) return;
        io.disconnect();
        import("./footer-car-3d")
          .then(({ mountCar }) =>
            mountCar(canvas.current!, {
              url: G63_URL,
              surface: car.current!,
              reducedMotion:
                !document.documentElement.classList.contains("js-motion"),
              onInteract: () => setHint(false),
              framing: () => {
                // The car may use the whole canvas but never the text's boxes (+ a gap).
                const cv = canvas.current!.getBoundingClientRect();
                const desktop = window.innerWidth >= 1024;
                const rtl = document.documentElement.dir === "rtl";
                // the ink, not the block: each line of text, each button
                const boxes: DOMRect[] = [];
                const ink = (node: Node | null) => {
                  if (!node) return;
                  const r = document.createRange();
                  r.selectNodeContents(node);
                  boxes.push(...Array.from(r.getClientRects()));
                };
                title.current
                  ?.querySelectorAll(".foot-line > span")
                  .forEach(ink);
                ink(paragraph.current);
                cta.current
                  ?.querySelectorAll(":scope > *")
                  .forEach((el) => boxes.push(el.getBoundingClientRect()));
                return {
                  // desktop: the wheels stand just above the end of the scene (the line before the details)
                  ground: desktop
                    ? Math.min(
                        0.95,
                        (box.current!.getBoundingClientRect().bottom -
                          52 -
                          cv.top) /
                          cv.height,
                      )
                    : 0.86,
                  margin: desktop ? 40 : 14,
                  gap: desktop ? 24 : 0,
                  keepOut: desktop
                    ? boxes
                        .filter((r) => r.width > 0)
                        .map((r) => ({
                          x: r.left - cv.left,
                          y: r.top - cv.top,
                          w: r.width,
                          h: r.height,
                        }))
                    : [],
                  far: rtl ? "left" : "right",
                };
              },
              onLayout: setLayout,
            }),
          )
          .then((s) => {
            if (cancelled) return s.dispose();
            stage = s;
            setCarMode("3d");
          })
          .catch((err) => {
            console.warn("3D car unavailable, keeping the photo:", err);
          });
      },
      { rootMargin: "700px 0px" },
    );
    io.observe(car.current);
    return () => {
      cancelled = true;
      io.disconnect();
      stage?.dispose();
    };
  }, [use3d]);
  const [trace, setTrace] = useState<{
    w: number;
    h: number;
    d: string;
    sx: number;
    sy: number;
    ex: number;
    ey: number;
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
    // Title fit: the widest line's width in em sets --title-em; CSS then sizes the title so that
    // line fills the column at most (container units) — it shrinks before it can be cut.
    const fit = () => {
      const h = title.current;
      if (!h) return;
      const size = parseFloat(getComputedStyle(h).fontSize);
      let widest = 0;
      h.querySelectorAll(".foot-line > span").forEach((line) => {
        const r = document.createRange();
        r.selectNodeContents(line);
        widest = Math.max(widest, r.getBoundingClientRect().width);
      });
      if (size && widest)
        h.style.setProperty("--title-em", (widest / size + 0.15).toFixed(3));
    };
    const measure = () => {
      fit();
      const b = box.current,
        link = fleetLink.current,
        c = car.current;
      if (!b || !link || !c || window.innerWidth < 1024) return setTrace(null);
      const l = within(link, b);
      const k = within(c, b);
      const sx = isRTL ? l.x - 20 : l.x + link.offsetWidth + 20;
      const sy = l.y + link.offsetHeight / 2;
      // the car box is centred with translate-y-[-50%] and crops the photo (object-position 50% 55%);
      // fleet photos face left, so the nearest wheel is the front one in LTR (car on the right)
      // and the rear one in RTL (car on the left)
      const top = k.y - c.offsetHeight * 0.5;
      // (photo enlarged ×1.14 around 50% 58% inside the frame)
      let ex = k.x + c.offsetWidth * (isRTL ? 0.81 : 0.2);
      let ey = top + c.offsetHeight * 0.92;
      const cv = canvas.current;
      if (carMode === "3d" && layout && cv) {
        ex = k.x + cv.parentElement!.offsetLeft + cv.offsetWidth * layout.lineX;
        ey = top + cv.parentElement!.offsetTop + cv.offsetHeight * layout.lineY;
      }
      const dx = ex - sx;
      const d = `M ${sx} ${sy} C ${sx + dx * 0.5} ${sy}, ${sx + dx * 0.55} ${ey}, ${ex} ${ey}`;
      setTrace({ w: b.offsetWidth, h: b.offsetHeight, d, sx, sy, ex, ey });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [isRTL, t, carMode, layout]);

  // The hint sits just under the car's shadow, wherever the framing put it
  useIsoLayoutEffect(() => {
    const cv = canvas.current;
    if (!cv || !layout) return setHintTop(null);
    setHintTop(
      cv.parentElement!.offsetTop +
        cv.offsetHeight * (layout.cy + layout.h / 2) +
        22,
    );
  }, [layout]);

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
    <footer ref={root} className="foot relative bg-background">
      {/* ── 1. The closing scene ── */}
      <section
        data-foot
        aria-labelledby="final-cta-title"
        className="foot-scene relative"
      >
        <div
          ref={box}
          className="container relative flex flex-col pb-14 pt-24 lg:min-h-[38rem] lg:justify-center lg:pb-16 lg:pt-24"
        >
          <div ref={copy} className="foot-copy relative z-10 lg:w-[54%]">
            <h2
              ref={title}
              id="final-cta-title"
              className="foot-title type-display font-semibold leading-[1.02] text-foreground"
            >
              {t.finalCta.lines.map((line, i) => (
                <span key={i} className="foot-line block pb-[0.08em]">
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
              ref={paragraph}
              className="foot-in mt-6 max-w-[40ch] text-base leading-relaxed text-muted-foreground sm:text-lg"
              style={{ "--d": "260ms" } as React.CSSProperties}
            >
              {t.finalCta.text}
            </p>
            <div
              ref={cta}
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

          {/* A real fleet photo, framed around the car; its studio backdrop dissolves into the night */}
          <div
            ref={car}
            data-car={carMode}
            {...(carMode === "3d"
              ? {
                  role: "img",
                  tabIndex: 0,
                  "aria-label": `${shown.name} — ${t.footer.dragHint}`,
                }
              : { "aria-hidden": true })}
            className="foot-car relative mx-auto mt-10 w-full max-w-[40rem] lg:absolute lg:end-0 lg:start-[55%] lg:top-1/2 lg:mx-0 lg:mt-0 lg:w-auto lg:max-w-none lg:-translate-y-1/2"
          >
            <div className="foot-car-in relative z-[1]">
              <img
                src={shown.image}
                srcSet={`${shown.thumb} 768w, ${shown.image} 1536w`}
                sizes="(min-width: 1024px) 50vw, 100vw"
                alt=""
                width={1536}
                height={1024}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="foot-car-img block aspect-[17/10] w-full object-cover object-[50%_55%]"
              />
            </div>
            {use3d && (
              <>
                {/* stage: larger than the photo frame (see .foot-stage) */}
                <div className="foot-stage">
                  <div
                    aria-hidden="true"
                    className="foot-car-light absolute inset-0"
                    style={
                      layout
                        ? ({
                            "--lx": `${layout.cx * 100}%`,
                            "--ly": `${(layout.cy + layout.h * 0.12) * 100}%`,
                            "--lw": `${layout.w * 62}%`,
                            "--lh": `${layout.h * 70}%`,
                          } as React.CSSProperties)
                        : undefined
                    }
                  />
                  <canvas
                    ref={canvas}
                    aria-hidden="true"
                    className="foot-car-3d absolute inset-0 h-full w-full"
                  />
                </div>
                <p
                  aria-hidden="true"
                  className="foot-hint absolute inset-x-0 flex items-center justify-center gap-2"
                  style={{ top: hintTop ?? "100%" }}
                  data-on={(carMode === "3d" && hint) || undefined}
                >
                  {t.footer.dragHint}
                  <MoveHorizontal className="h-3.5 w-3.5" />
                </p>
              </>
            )}
          </div>

          {/* Signature: one brass line drawn from the text towards the car */}
          {trace && (
            <svg
              aria-hidden="true"
              className="foot-trace pointer-events-none absolute inset-0 h-full w-full"
              viewBox={`0 0 ${trace.w} ${trace.h}`}
            >
              <defs>
                <linearGradient
                  id="foot-trace-fade"
                  gradientUnits="userSpaceOnUse"
                  x1={trace.sx}
                  y1={trace.sy}
                  x2={trace.ex}
                  y2={trace.ey}
                >
                  <stop
                    offset="0"
                    style={{
                      stopColor: "hsl(var(--primary))",
                      stopOpacity: 0.75,
                    }}
                  />
                  <stop
                    offset="0.55"
                    style={{
                      stopColor: "hsl(var(--primary))",
                      stopOpacity: 0.6,
                    }}
                  />
                  <stop
                    offset="1"
                    style={{ stopColor: "hsl(var(--primary))", stopOpacity: 0 }}
                  />
                </linearGradient>
              </defs>
              <path
                d={trace.d}
                pathLength={1}
                style={
                  carMode === "3d" && layout
                    ? { stroke: "url(#foot-trace-fade)", opacity: 1 }
                    : undefined
                }
              />
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
            <h2 id="foot-nav" className="foot-heading">
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
            <h2 className="foot-heading">{t.footer.contact}</h2>
            <ul className="mt-4">
              <li>
                <a
                  href={whatsappUrl(t.whatsapp.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="foot-contact group/fk"
                >
                  <span className="foot-label">{t.contact.whatsapp}</span>
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
                  <span className="foot-label">{t.contact.email}</span>
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
                <span className="foot-label">{t.contact.address}</span>
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
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
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
            <a
              href={business.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="foot-social"
            >
              <FacebookIcon className="h-4 w-4" />
              Facebook
            </a>
            <a
              href={business.snapchat}
              target="_blank"
              rel="noopener noreferrer"
              className="foot-social"
            >
              <SnapchatIcon className="h-4 w-4" />
              Snapchat
            </a>
          </div>
        </div>
      </div>

      {/* Signature: the name set across the full grid width, very faint, its foot cropped by its own frame */}
      <div aria-hidden="true" className="foot-mark-frame container">
        <p
          className="foot-mark type-display select-none whitespace-nowrap font-semibold"
          dir="ltr"
        >
          DRIVE PRIME
        </p>
      </div>
    </footer>
  );
}
