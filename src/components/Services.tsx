import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { confirmed, whatsappUrl, type ServiceKey } from "@/config/business";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";
import riad800 from "@/assets/riad-800.webp";
import riad1400 from "@/assets/riad-1400.webp";

/*
  "Nos services" — an interactive showcase. The golden-hour riad photograph carries the
  section; picking a service (hover, click, arrow keys) writes it onto the photo and eases the
  framing to a new point of view. No per-service photos exist, so none are faked.
*/
// Framing per service (object-position + zoom) — the photograph "moves" as services change.
const FRAMES: { pos: string; zoom: number }[] = [
  { pos: "50% 62%", zoom: 1.04 },
  { pos: "38% 70%", zoom: 1.16 },
  { pos: "62% 58%", zoom: 1.1 },
  { pos: "45% 75%", zoom: 1.22 },
  { pos: "55% 40%", zoom: 1.12 },
  { pos: "50% 66%", zoom: 1.0 },
];

export default function Services() {
  const { t } = useLanguage();
  const items = t.services.items.filter((item) => confirmed.services[item.key as ServiceKey]);
  const [active, setActive] = useState(0);
  // Separate refs: the phone row and the desktop list are two renderings of the same tabs.
  const rowTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const listTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  if (items.length === 0) return null;

  const current = items[active];
  const frame = FRAMES[active % FRAMES.length];

  const onKey = (e: KeyboardEvent, i: number, horizontal: boolean) => {
    const next = horizontal ? ["ArrowRight", "ArrowLeft"] : ["ArrowDown", "ArrowUp"];
    let to = i;
    if (e.key === next[0]) to = (i + 1) % items.length;
    else if (e.key === next[1]) to = (i - 1 + items.length) % items.length;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = items.length - 1;
    else return;
    e.preventDefault();
    setActive(to);
    (horizontal ? rowTabs : listTabs).current[to]?.focus();
  };

  return (
    <section id="services" aria-labelledby="services-title" className="relative py-24 lg:py-32">
      <div className="container grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
        {/* Photograph + the active service written on it */}
        <div className="relative order-2 min-w-0 overflow-hidden rounded-lg bg-background lg:col-span-7">
          <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[6/5]">
            <img
              src={riad1400}
              srcSet={`${riad800} 800w, ${riad1400} 1400w`}
              sizes="(min-width: 1024px) 56vw, 100vw"
              alt=""
              width={1400}
              height={793}
              loading="lazy"
              decoding="async"
              className="services-photo absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: frame.pos, "--zoom": frame.zoom } as CSSProperties}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 hidden bg-[linear-gradient(to_top,hsl(var(--background)/0.92)_0%,hsl(var(--background)/0.35)_42%,transparent_65%)] sm:block"
            />
          </div>
          <div
            id={`${baseId}-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${active}`}
            aria-live="polite"
            className="relative px-1 pt-6 sm:absolute sm:inset-x-0 sm:bottom-0 sm:p-9"
          >
            <div key={current.key} className="service-swap max-w-[34rem]">
              <p dir="ltr" className="tabular text-[13px] font-semibold text-primary rtl:text-right">
                {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </p>
              <h3 className="type-display mt-3 text-[1.85rem] font-semibold text-foreground sm:text-[2.4rem]">
                {current.title}
              </h3>
              <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-foreground/80 sm:text-base">
                {current.description}
              </p>
              {current.key === "quickBooking" && (
                <a
                  href={whatsappUrl(t.whatsapp.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5 h-11"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {t.hero.ctaWhatsapp}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Heading + service selector */}
        <div className="order-1 min-w-0 lg:col-span-5">
          <h2 id="services-title" className="type-display text-4xl font-semibold text-foreground sm:text-5xl">
            {t.services.title}
          </h2>
          <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-muted-foreground sm:text-lg">{t.services.intro}</p>

          {/* Phones: swipeable row. Desktop: vertical list. Same tabs. */}
          <div
            role="tablist"
            aria-label={t.services.listLabel}
            className="no-scrollbar -mx-5 mt-8 flex snap-x gap-2 overflow-x-auto px-5 lg:hidden"
          >
            {items.map((s, i) => (
              <button
                key={s.key}
                ref={(el) => (rowTabs.current[i] = el)}
                id={`${baseId}-tab-${i}`}
                role="tab"
                type="button"
                aria-selected={i === active}
                aria-controls={`${baseId}-panel`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i, true)}
                className={cn(
                  "shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors",
                  i === active
                    ? "border-primary/70 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {s.title}
              </button>
            ))}
          </div>

          <div role="tablist" aria-label={t.services.listLabel} aria-orientation="vertical" className="mt-10 hidden lg:block">
            {items.map((s, i) => (
              <button
                key={s.key}
                ref={(el) => (listTabs.current[i] = el)}
                id={`${baseId}-vtab-${i}`}
                role="tab"
                type="button"
                aria-selected={i === active}
                aria-controls={`${baseId}-panel`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i, false)}
                className={cn(
                  "group/svc flex w-full items-center gap-5 border-t border-foreground/10 py-4 text-start transition-colors last:border-b",
                  i === active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px shrink-0 bg-primary transition-[width] duration-500 [transition-timing-function:var(--ease-out)]",
                    i === active ? "w-8" : "w-3 bg-foreground/25",
                  )}
                />
                <span className="type-wide flex-1 text-lg font-semibold">{s.title}</span>
                <ArrowRight
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4 transition-[opacity,transform] duration-300 rtl:rotate-180",
                    i === active ? "translate-x-0 opacity-100 text-primary" : "-translate-x-1 opacity-0",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
