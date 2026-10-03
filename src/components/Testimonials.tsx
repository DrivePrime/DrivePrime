import { useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { testimonials } from "@/data/testimonials";
import { vehicles } from "@/data/vehicles";
import { useSwipe } from "@/hooks/use-swipe";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/*
  "Ce que disent nos clients" — one review at a time, large. Reviews are the original site's,
  verbatim, in their own language (confirmed genuine by the owner). Manual navigation only:
  arrows, swipe, arrow keys; fade with a slight slide in the direction of travel.
*/
export default function Testimonials() {
  const { t, isRTL } = useLanguage();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const n = testimonials.length;
  const review = testimonials[index];
  const car = review.vehicleId ? vehicles.find((v) => v.id === review.vehicleId) : undefined;

  const go = (step: 1 | -1) => {
    setDir(step);
    setIndex((i) => (i + step + n) % n);
  };
  // Physical swipe left = next in LTR, previous in RTL.
  const swipe = useSwipe((d) => go((isRTL ? -d : d) as 1 | -1));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") go(isRTL ? -1 : 1);
    else if (e.key === "ArrowLeft") go(isRTL ? 1 : -1);
    else return;
    e.preventDefault();
  };

  const arrow =
    "grid h-14 w-14 place-items-center rounded-full border border-foreground/20 text-foreground transition-[background-color,border-color,color,transform] duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95";

  const controls = (className: string) => (
    <div className={cn("items-center gap-6", className)}>
      <button type="button" onClick={() => go(-1)} aria-label={t.testimonials.prev} aria-controls="review-slide" className={arrow}>
        <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
      </button>
      <p dir="ltr" className="tabular type-wide text-[15px] font-semibold text-foreground" aria-hidden="true">
        {pad(index + 1)} <span className="text-muted-foreground">/ {pad(n)}</span>
      </p>
      <button type="button" onClick={() => go(1)} aria-label={t.testimonials.next} aria-controls="review-slide" className={arrow}>
        <ArrowRight className="h-5 w-5 rtl:rotate-180" />
      </button>
    </div>
  );

  return (
    <section id="temoignages" aria-labelledby="testimonials-title" className="relative overflow-hidden py-24 lg:py-36">
      <div className="container grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="flex flex-col lg:col-span-4">
          <h2 id="testimonials-title" className="type-display text-4xl font-semibold text-foreground sm:text-5xl">
            {t.testimonials.title}
          </h2>
          <p className="mt-5 max-w-[34ch] text-base leading-relaxed text-muted-foreground sm:text-lg">{t.testimonials.intro}</p>
          {controls("mt-auto hidden pt-12 lg:flex")}
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label={t.testimonials.listLabel}
          tabIndex={0}
          onKeyDown={onKey}
          {...swipe}
          className="relative rounded-lg focus-visible:outline-offset-8 lg:col-span-8"
        >
          {/* Large, quiet quotation mark */}
          <svg
            aria-hidden="true"
            viewBox="0 0 48 36"
            className="absolute start-0 top-0 h-12 w-16 text-primary/30 sm:h-16 sm:w-[5.3rem]"
            fill="currentColor"
          >
            <path d="M0 36V22.5C0 9.6 5.4 2.1 16.2 0l2.4 4.5C12.6 6.4 9.6 10.4 9.6 16.5H18V36H0Zm30 0V22.5C30 9.6 35.4 2.1 46.2 0l1.8 4.5c-6 1.9-9 5.9-9 12H48V36H30Z" />
          </svg>

          <div
            id="review-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={t.testimonials.position(index + 1, n)}
            aria-live="polite"
            className="min-h-[20rem] pt-20 sm:min-h-[22rem] sm:pt-24"
          >
            <figure
              key={index}
              lang={review.lang}
              dir="ltr"
              className={cn("text-left", dir === 1 ? "quote-in-next" : "quote-in-prev")}
            >
              <blockquote>
                <p className="type-wide max-w-[30ch] text-[1.4rem] font-medium leading-[1.42] text-foreground sm:text-[1.85rem] lg:text-[2.1rem]">
                  {review.text}
                </p>
              </blockquote>
              <figcaption className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
                <span>
                  <span className="block text-[15px] font-semibold text-foreground">{review.name}</span>
                  <span className="block text-[14px] text-muted-foreground">{review.location}</span>
                </span>
                {car && (
                  <Link
                    to={`/vehicule/${car.id}`}
                    aria-label={`${t.testimonials.rentedCar} : ${car.name}`}
                    className="group/car inline-flex items-center gap-3 rounded-full border border-border py-1 pe-4 ps-1 text-[14px] text-foreground/85 transition-colors hover:border-foreground/30 hover:text-foreground"
                  >
                    <span className="block h-8 w-12 overflow-hidden rounded-full bg-card">
                      <img src={car.thumb} alt="" loading="lazy" className="h-full w-full scale-[1.45] object-cover object-[50%_62%]" />
                    </span>
                    {car.name}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/car:translate-x-0.5" />
                  </Link>
                )}
              </figcaption>
            </figure>
          </div>

          {/* Progress: one segment per review, each one selectable */}
          <div className="mt-10 flex items-center gap-2">
            {testimonials.map((r, i) => (
              <button
                key={r.name}
                type="button"
                onClick={() => {
                  setDir(i > index ? 1 : -1);
                  setIndex(i);
                }}
                aria-label={t.testimonials.position(i + 1, n)}
                aria-current={i === index}
                className="group/seg py-3"
              >
                <span
                  className={cn(
                    "block h-0.5 rounded-full transition-[width,background-color] duration-500 [transition-timing-function:var(--ease-out)]",
                    i === index ? "w-12 bg-primary" : "w-6 bg-foreground/20 group-hover/seg:bg-foreground/45",
                  )}
                />
              </button>
            ))}
          </div>

          {controls("mt-8 flex lg:hidden")}
        </div>
      </div>
    </section>
  );
}
