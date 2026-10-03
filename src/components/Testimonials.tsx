import { Quote } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { testimonials } from "@/data/testimonials";

/*
  "Ce que disent nos clients" — the original site's reviews, verbatim and in the language
  they were written in. Editorial quotes: no star ratings, no auto-playing carousel.
  Desktop: a quiet grid. Phones: a swipeable row with the next quote peeking in.
*/
export default function Testimonials() {
  const { t } = useLanguage();

  return (
    <section id="temoignages" aria-labelledby="testimonials-title" className="pb-20 pt-6 lg:pb-28 lg:pt-10">
      <div className="container">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="testimonials-title" className="type-display text-4xl font-semibold text-foreground sm:text-5xl lg:col-span-6">
            {t.testimonials.title}
          </h2>
          <p className="max-w-[44ch] text-base leading-relaxed text-muted-foreground sm:text-lg lg:col-span-5 lg:col-start-8">
            {t.testimonials.intro}
          </p>
        </div>

        <ul
          aria-label={t.testimonials.listLabel}
          className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 sm:overflow-visible sm:px-0 lg:mt-16 lg:grid-cols-3 lg:gap-x-12"
        >
          {testimonials.map((review) => (
            <li
              key={review.name}
              className="w-[85%] shrink-0 snap-start sm:w-auto"
            >
              {/* The whole card follows the quote's script direction (French/English quotes stay LTR in Arabic). */}
              <figure lang={review.lang} dir="ltr" className="flex h-full flex-col border-t border-foreground/15 pt-6 text-left">
                <Quote className="h-5 w-5 text-primary" aria-hidden="true" />
                <blockquote className="mt-4 flex-1">
                  <p className="text-[16px] leading-relaxed text-foreground/90 sm:text-[17px]">{review.text}</p>
                </blockquote>
                <figcaption className="mt-6 text-[14px]">
                  <span className="font-semibold text-foreground">{review.name}</span>
                  <span className="block text-muted-foreground">{review.location}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
