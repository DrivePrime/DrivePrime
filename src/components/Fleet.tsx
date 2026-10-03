import { useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { vehicles, categories, VehicleCategory } from "@/data/vehicles";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import VehicleCard from "./VehicleCard";

/*
  Long-list strategy: "Tous" opens on a first selection (6 cards on phones, 9 above) with a
  single button that reveals the whole fleet in place. Category filters always show every
  model of the category. Hidden cards stay in the DOM, so all vehicle links remain crawlable.
*/
const INITIAL_MOBILE = 6;
const INITIAL = 8; // four full rows of two

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Fleet() {
  const [active, setActive] = useState<VehicleCategory>("Tous");
  const [expanded, setExpanded] = useState(false);
  // Cards only animate in after a visitor action (filter, show more), never on first paint.
  const [interacted, setInteracted] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const counts = useMemo(() => {
    const c = new Map<VehicleCategory, number>([["Tous", vehicles.length]]);
    vehicles.forEach((v) => c.set(v.category, (c.get(v.category) ?? 0) + 1));
    return c;
  }, []);

  const visibleCategories = categories.filter((c) => (counts.get(c) ?? 0) > 0);
  const filtered = active === "Tous" ? vehicles : vehicles.filter((v) => v.category === active);
  const collapsed = active === "Tous" && !expanded && filtered.length > INITIAL_MOBILE;

  const selectCategory = (category: VehicleCategory) => {
    setActive(category);
    setInteracted(true);
    setExpanded(false);
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
    <section id="flotte" aria-labelledby="fleet-title" className="pt-20 pb-24 lg:pt-28 lg:pb-32">
      <div className="container">
        <div className="max-w-2xl">
          <h2 id="fleet-title" className="type-display text-4xl sm:text-5xl font-semibold text-foreground">
            {t.fleet.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground">{t.fleet.description}</p>
          <p className="sr-only" aria-live="polite">
            {t.fleet.count(filtered.length)}
          </p>
        </div>

        <div className="sticky top-16 lg:top-[72px] z-30 -mx-5 mt-10 border-b border-border bg-background/95 px-5 pt-3 backdrop-blur-sm sm:mx-0 sm:px-0">
          <div
            role="group"
            aria-label={t.fleet.filterLabel}
            className={cn(
              "no-scrollbar -mx-5 flex gap-7 overflow-x-auto px-5 sm:mx-0 sm:px-0",
              // Phones: fade the trailing edge so it is clear more categories scroll into view.
              "max-sm:[mask-image:linear-gradient(to_right,#000_80%,transparent)] max-sm:rtl:[mask-image:linear-gradient(to_left,#000_80%,transparent)]",
            )}
          >
            {visibleCategories.map((category) => {
              const selected = active === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectCategory(category)}
                  className={cn(
                    "relative shrink-0 whitespace-nowrap pb-3.5 pt-1 text-[15px] font-medium transition-colors",
                    "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-center after:transition-transform after:duration-300",
                    selected
                      ? "text-foreground after:scale-x-100 after:bg-primary"
                      : "text-muted-foreground hover:text-foreground after:scale-x-0 after:bg-foreground/40",
                  )}
                >
                  {t.fleet.categories[category]}
                  <sup className="tabular ms-1 text-[11px] font-normal text-muted-foreground">{counts.get(category)}</sup>
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
            "mt-12 scroll-mt-40 grid gap-y-14 md:grid-cols-2 md:gap-x-10 lg:gap-x-14 lg:gap-y-20",
            interacted && "fleet-enter",
          )}
        >
          {filtered.map((vehicle, i) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              priority={i < 3}
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
