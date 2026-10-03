import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronDown, MapPin } from "lucide-react";
import { vehicles, categories, VehicleCategory } from "@/data/vehicles";
import { useLanguage } from "@/i18n/LanguageContext";
import { useBooking } from "@/context/BookingContext";
import { locationText } from "@/lib/booking-message";
import { useDateLabel } from "@/lib/dates";
import { cn } from "@/lib/utils";
import VehicleCard from "./VehicleCard";

/*
  Long-list strategy: "Tous" opens on a first selection (6 cards on phones, 8 above) with a
  single button that reveals the whole fleet in place. Category filters always show every
  model of the category. Hidden cards stay in the DOM, so all vehicle links remain crawlable.
*/
// Layout effect in the browser (no flash of a misplaced underline), plain effect during prerender.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const INITIAL_MOBILE = 6;
const INITIAL = 8; // four full rows of two

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function SearchSummary() {
  const { t, language } = useLanguage();
  const booking = useBooking();
  const navigate = useNavigate();
  const startLabel = useDateLabel(booking.start);
  const endLabel = useDateLabel(booking.end);
  if (!booking.hasDates) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md border border-border bg-card/70 px-4 py-3 text-[14px]">
      <span className="text-muted-foreground">{t.fleet.yourSearch}</span>
      <span className="inline-flex items-center gap-2 text-foreground">
        <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
        {locationText(booking.location, language, t) || t.whatsapp.any}
      </span>
      <span className="tabular inline-flex items-center gap-2 text-foreground">
        <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
        {startLabel || t.fleet.datesPending}
        <span aria-hidden="true" className="text-muted-foreground rtl:rotate-180">
          →
        </span>
        {endLabel || t.fleet.datesPending}
        {booking.days && <span className="text-muted-foreground">· {t.fleet.days(booking.days)}</span>}
      </span>
      <button
        type="button"
        onClick={() => navigate("/#accueil")}
        className="ms-auto text-[14px] font-medium text-primary underline-offset-4 hover:underline"
      >
        {t.fleet.editSearch}
      </button>
    </div>
  );
}

export default function Fleet() {
  const [active, setActive] = useState<VehicleCategory>("Tous");
  const [expanded, setExpanded] = useState(false);
  // Cards only animate in after a visitor action (filter, show more), never on first paint.
  const [interacted, setInteracted] = useState(false);
  const { t } = useLanguage();
  const gridRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  // Underline follows the active tab (also on resize and language change); keep it in view.
  useIsoLayoutEffect(() => {
    const place = () => {
      const btn = railRef.current?.querySelector<HTMLButtonElement>(`[data-category="${active}"]`);
      if (btn) setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
    };
    place();
    window.addEventListener("resize", place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener("resize", place);
  }, [active, t]);

  // Arrow keys move between categories (one tab stop for the whole rail).
  const onRailKey = (e: React.KeyboardEvent) => {
    const keys = document.documentElement.dir === "rtl" ? ["ArrowLeft", "ArrowRight"] : ["ArrowRight", "ArrowLeft"];
    const i = visibleCategories.indexOf(active);
    let to = i;
    if (e.key === keys[0]) to = Math.min(i + 1, visibleCategories.length - 1);
    else if (e.key === keys[1]) to = Math.max(i - 1, 0);
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = visibleCategories.length - 1;
    else return;
    e.preventDefault();
    selectCategory(visibleCategories[to]);
    requestAnimationFrame(() =>
      railRef.current?.querySelector<HTMLButtonElement>(`[data-category="${visibleCategories[to]}"]`)?.focus(),
    );
  };

  const counts = useMemo(() => {
    const c = new Map<VehicleCategory, number>([["Tous", vehicles.length]]);
    vehicles.forEach((x) => c.set(x.category, (c.get(x.category) ?? 0) + 1));
    return c;
  }, []);

  const visibleCategories = categories.filter((c) => (counts.get(c) ?? 0) > 0);
  const filtered = active === "Tous" ? vehicles : vehicles.filter((v) => v.category === active);
  const collapsed = active === "Tous" && !expanded && filtered.length > INITIAL_MOBILE;

  const selectCategory = (category: VehicleCategory) => {
    setActive(category);
    railRef.current
      ?.querySelector(`[data-category="${category}"]`)
      ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "nearest", inline: "center" });
    setExpanded(false);
    setInteracted(true);
    // Deep in a long list, a shorter result set would leave the visitor in empty space.
    const grid = gridRef.current;
    if (grid && grid.getBoundingClientRect().top < 0) {
      grid.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    }
  };

  const expand = () => {
    const firstHidden = window.matchMedia("(min-width: 640px)").matches ? INITIAL : INITIAL_MOBILE;
    setExpanded(true);
    // Keyboard and screen-reader users continue from the first newly revealed vehicle.
    requestAnimationFrame(() => {
      gridRef.current?.querySelectorAll<HTMLAnchorElement>("article h3 a")[firstHidden]?.focus({ preventScroll: true });
    });
  };

  return (
    <section id="flotte" aria-labelledby="fleet-title" className="pb-24 pt-24 lg:pb-32 lg:pt-32">
      <div className="container">
        <div className="max-w-2xl">
          <h2 id="fleet-title" className="type-display text-4xl font-semibold text-foreground sm:text-5xl">
            {t.fleet.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{t.fleet.description}</p>
          <p className="sr-only" aria-live="polite">
            {t.fleet.count(filtered.length)}
          </p>
        </div>

        <SearchSummary />

        {/* Category filters: typographic tabs, a brass underline slides to the active one */}
        <div className="sticky top-16 z-30 -mx-5 mt-10 bg-background/95 px-5 backdrop-blur-sm sm:mx-0 sm:px-0 lg:top-[72px]">
          <div
            ref={railRef}
            role="group"
            aria-label={t.fleet.filterLabel}
            onKeyDown={onRailKey}
            className="no-scrollbar relative -mx-5 flex gap-7 overflow-x-auto border-b border-border px-5 sm:mx-0 sm:gap-9 sm:px-0 max-sm:[mask-image:linear-gradient(to_right,#000_85%,transparent)] max-sm:rtl:[mask-image:linear-gradient(to_left,#000_85%,transparent)]"
          >
            {visibleCategories.map((category) => {
              const selected = active === category;
              return (
                <button
                  key={category}
                  type="button"
                  data-category={category}
                  aria-pressed={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => selectCategory(category)}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-sm py-4 text-[15px] transition-colors duration-200 focus-visible:outline-offset-[-3px]",
                    selected ? "font-semibold text-foreground" : "font-medium text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.fleet.categories[category]}
                  <span
                    className={cn(
                      "tabular ms-1.5 align-top text-[11px] font-normal transition-colors",
                      selected ? "text-primary" : "text-muted-foreground/70",
                    )}
                  >
                    {counts.get(category)}
                  </span>
                </button>
              );
            })}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-primary transition-[left,width] duration-500 [transition-timing-function:var(--ease-out)]"
              style={{ left: indicator.left, width: indicator.width }}
            />
          </div>
        </div>

        <div
          id="fleet-grid"
          ref={gridRef}
          key={active}
          className={cn(
            "mt-10 scroll-mt-40 grid gap-y-14 md:grid-cols-2 md:gap-x-10 lg:gap-x-14 lg:gap-y-20",
            interacted && "fleet-enter",
          )}
        >
          {filtered.map((vehicle, i) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              priority={i < 2}
              className={cn(
                collapsed && (i >= INITIAL ? "hidden" : i >= INITIAL_MOBILE && "max-sm:hidden"),
                // only the cards revealed by "show more" animate in
                expanded && active === "Tous" && (i >= INITIAL ? "anim-card" : i >= INITIAL_MOBILE && "max-sm:anim-card"),
              )}
            />
          ))}
        </div>

        <p className="mt-12 text-[12px] text-muted-foreground">{t.fleet.priceNote}</p>

        {collapsed && (
          <div className="mt-14 flex justify-center">
            <button type="button" onClick={expand} aria-controls="fleet-grid" className="btn-ghost">
              <span className="sm:hidden">{t.fleet.showMore(filtered.length - INITIAL_MOBILE)}</span>
              <span className="hidden sm:inline">{t.fleet.showMore(filtered.length - INITIAL)}</span>
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
