import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { whatsappUrl } from "@/config/business";
import { WhatsAppIcon } from "./icons";

/*
  Booking steps as a horizontal timeline: a genuine sequence, so it is numbered.
  Quiet band between the photo-led sections around it.
*/
export default function Process() {
  const { t } = useLanguage();

  return (
    <section id="reserver" aria-labelledby="process-title" className="py-20 lg:py-28">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <h2 id="process-title" className="type-display text-4xl font-semibold text-foreground sm:text-5xl">
            {t.process.title}
          </h2>
          <div className="flex flex-wrap gap-3">
            <a href={whatsappUrl(t.whatsapp.general)} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <WhatsAppIcon className="h-4 w-4" />
              {t.hero.ctaWhatsapp}
            </a>
            <Link to="/#flotte" className="btn-ghost group/cta">
              {t.hero.ctaFleet}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 rtl:rotate-180 rtl:group-hover/cta:-translate-x-0.5" />
            </Link>
          </div>
        </div>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {/* the line that ties the three steps together (desktop) */}
          <span aria-hidden="true" className="absolute inset-x-0 top-[1.15rem] hidden h-px bg-foreground/15 md:block" />
          {t.process.steps.map((step, i) => (
            <li key={step.title} className="relative">
              <span className="tabular type-wide relative z-10 grid h-9 w-9 place-items-center rounded-full border border-primary/60 bg-background text-[14px] font-semibold text-primary">
                {i + 1}
              </span>
              <h3 className="type-wide mt-6 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
