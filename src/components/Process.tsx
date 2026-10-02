import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { whatsappUrl } from "@/config/business";
import { WhatsAppIcon } from "./icons";

export default function Process() {
  const { t } = useLanguage();

  return (
    <section id="reserver" aria-labelledby="process-title" className="bg-card py-24 lg:py-28">
      <div className="container">
        <h2 id="process-title" className="type-display text-4xl sm:text-5xl font-semibold text-foreground">
          {t.process.title}
        </h2>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {t.process.steps.map((step, i) => (
            <li key={step.title} className="border-t border-foreground/15 pt-6">
              <span className="tabular type-wide block text-[15px] font-semibold text-primary">
                {i + 1}
              </span>
              <h3 className="type-wide mt-4 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-wrap gap-3">
          <a
            href={whatsappUrl(t.whatsapp.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {t.hero.ctaWhatsapp}
          </a>
          <Link to="/#flotte" className="btn-ghost">
            {t.hero.ctaFleet}
          </Link>
        </div>
      </div>
    </section>
  );
}
