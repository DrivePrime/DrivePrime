import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronDown, MapPin } from "lucide-react";
import { vehicles, categories, VehicleCategory, type Vehicle } from "@/data/vehicles";
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
const INITIAL_MOBILE = 6;
const INITIAL = 8; // four full rows of two
// Real fleet photos used as the visual of each filter: first car of the category in the list,
// and a flagship for "all".
const ALL_VISUAL_ID = "range-rover-sport";

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
  const gridRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const { counts, visuals } = useMemo(() => {
    const c = new Map<VehicleCategory, number>([["Tous", vehicles.length]]);
    const v = new Map<VehicleCategory, Vehicle>([["Tous", vehicles.find((x) => x.id === ALL_VISUAL_ID) ?? vehicles[0]]]);
    vehicles.forEach((x) => {
      c.set(x.category, (c.get(x.category) ?? 0) + 1);
      if (!v.has(x.category)) v.set(x.category, x);
    });
    return { counts: c, visuals: v };
  }, []);

  const visibleCategories = categories.filter((c) => (counts.get(c) ?? 0) > 0);
  const filtered = active === "Tous" ? vehicles : vehicles.filter((v) => v.category === active);
  const collapsed = active === "Tous" && !expanded && filtered.length > INITIAL_MOBILE;

  const selectCategory = (category: VehicleCategory) => {
    setActive(category);
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

        {/* Visual category rail: a real photo of the class on each filter */}
        <div className="sticky top-16 z-30 -mx-5 mt-10 bg-background/95 px-5 py-3 backdrop-blur-sm sm:mx-0 sm:px-0 lg:top-[72px]">
          <div
            role="group"
            aria-label={t.fleet.filterLabel}
            className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:gap-3 sm:px-0 max-sm:[mask-image:linear-gradient(to_right,#000_82%,transparent)] max-sm:rtl:[mask-image:linear-gradient(to_left,#000_82%,transparent)]"
          >
            {visibleCategories.map((category) => {
              const selected = active === category;
              const visual = visuals.get(category)!;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectCategory(category)}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-full border py-1.5 pe-4 ps-1.5 text-[14px] font-medium transition-[background-color,border-color,color] duration-200",
                    selected
                      ? "border-primary/70 bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  <span className="chip-photo block h-8 w-12 shrink-0 overflow-hidden rounded-full bg-card">
                    <img
                      src={visual.thumb}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width={96}
                      height={64}
                      className="h-full w-full scale-[1.45] object-cover object-[50%_62%]"
                    />
                  </span>
                  <span className="whitespace-nowrap">
                    {t.fleet.categories[category]}
                    <span className="tabular ms-1.5 text-[12px] text-muted-foreground">{counts.get(category)}</span>
                  </span>
                </button>
              );
            })}
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
