import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { vehicles, categories, VehicleCategory } from "@/data/vehicles";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import VehicleCard from "./VehicleCard";

export default function Fleet() {
  const [active, setActive] = useState<VehicleCategory>("Tous");
  const { t } = useLanguage();
  const reduce = useReducedMotion();

  const counts = useMemo(() => {
    const c = new Map<VehicleCategory, number>([["Tous", vehicles.length]]);
    vehicles.forEach((v) => c.set(v.category, (c.get(v.category) ?? 0) + 1));
    return c;
  }, []);

  const visibleCategories = categories.filter((c) => (counts.get(c) ?? 0) > 0);
  const filtered = active === "Tous" ? vehicles : vehicles.filter((v) => v.category === active);

  return (
    <section id="flotte" aria-labelledby="fleet-title" className="pt-20 pb-24 lg:pt-28 lg:pb-32">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div className="max-w-2xl">
            <h2 id="fleet-title" className="type-display text-4xl sm:text-5xl font-semibold text-foreground">
              {t.fleet.title}
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground">
              {t.fleet.description}
            </p>
          </div>
          <p className="sr-only" aria-live="polite">
            {t.fleet.count(filtered.length)}
          </p>
        </div>

        <div className="sticky top-16 lg:top-[72px] z-30 -mx-5 mt-10 border-b border-border bg-background/95 px-5 pt-3 backdrop-blur-sm sm:mx-0 sm:px-0">
          <div
            role="group"
            aria-label={t.fleet.filterLabel}
            className="no-scrollbar -mx-5 flex gap-7 overflow-x-auto px-5 sm:mx-0 sm:px-0"
          >
            {visibleCategories.map((category) => {
              const selected = active === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setActive(category);
                    // Deep in a long list, a shorter result set would leave the visitor in empty space.
                    const grid = document.getElementById("fleet-grid");
                    if (grid && grid.getBoundingClientRect().top < 0) {
                      grid.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
                    }
                  }}
                  className={cn(
                    "relative shrink-0 whitespace-nowrap pb-3.5 pt-1 text-[15px] font-medium transition-colors",
                    "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:origin-left after:transition-transform after:duration-300",
                    selected
                      ? "text-foreground after:scale-x-100 after:bg-primary"
                      : "text-muted-foreground hover:text-foreground after:scale-x-0 after:bg-foreground/40",
                  )}
                >
                  {t.fleet.categories[category]}
                  <sup className="tabular ms-1 text-[11px] font-normal text-muted-foreground">
                    {counts.get(category)}
                  </sup>
                </button>
              );
            })}
          </div>
        </div>

        <motion.div
          id="fleet-grid"
          key={active}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="mt-10 scroll-mt-40 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14"
        >
          {filtered.map((vehicle, i) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} priority={i < 3} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
