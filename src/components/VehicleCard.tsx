import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Vehicle } from "@/data/vehicles";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCurrency } from "@/i18n/CurrencyContext";
import { whatsappUrl } from "@/config/business";
import { vehicleLabel } from "@/i18n/vehicle-label";
import { stageZoom } from "@/data/stage";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";

interface VehicleCardProps {
  vehicle: Vehicle;
  /** Eager-load the first row so the fleet paints immediately. */
  priority?: boolean;
  className?: string;
  /** Layout hint for responsive image selection. */
  sizes?: string;
}

/*
  Showroom card: the car on its studio stage first, then name and price, three facts,
  one action. The whole card opens the vehicle page; "Réserver" goes straight to WhatsApp.
*/
export default function VehicleCard({
  vehicle,
  priority = false,
  className,
  sizes = "(min-width: 1360px) 650px, (min-width: 768px) 48vw, 100vw",
}: VehicleCardProps) {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const transmission = t.fleet.transmission[vehicle.transmission];
  const label = vehicleLabel(vehicle, t);
  const fullName = `${vehicle.name} (${transmission})`;

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="stage" style={{ "--stage-zoom": stageZoom(vehicle.id) } as CSSProperties}>
        <img
          src={vehicle.thumb}
          srcSet={`${vehicle.thumb} 768w, ${vehicle.image} 1536w`}
          sizes={sizes}
          alt={label}
          width={768}
          height={512}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-1 pt-1">
        <h3 className="type-wide text-xl font-semibold leading-tight text-foreground">
          <Link
            to={`/vehicule/${vehicle.id}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-md focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ring"
          >
            {label}
          </Link>
        </h3>
        <p className="leading-none">
          <span className="sr-only">{t.fleet.from} </span>
          <span className="tabular text-xl font-semibold text-foreground">{formatPrice(vehicle.pricePerDay)}</span>
          <span className="text-[13px] text-muted-foreground"> {t.fleet.perDay}</span>
        </p>
      </div>

      <p className="mt-2 px-1 text-[14px] text-muted-foreground">
        {transmission}
        <span aria-hidden="true" className="mx-2 text-foreground/20">
          /
        </span>
        {t.fleet.seats(vehicle.seats)}
        <span aria-hidden="true" className="mx-2 text-foreground/20">
          /
        </span>
        {t.fleet.fuel[vehicle.fuel]}
      </p>

      <div className="mt-5 flex items-center gap-6 px-1">
        <a
          href={whatsappUrl(t.whatsapp.vehicle(fullName))}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.fleet.bookAria(label)}
          className="relative z-10 inline-flex items-center gap-2 text-[14px] font-semibold text-primary transition-colors hover:text-gold-light"
        >
          <WhatsAppIcon className="h-4 w-4" />
          {t.fleet.book}
        </a>
        <span
          aria-hidden="true"
          className="ms-auto inline-flex items-center gap-1.5 text-[14px] text-muted-foreground transition-colors group-hover:text-foreground"
        >
          {t.fleet.details}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </span>
      </div>
    </article>
  );
}
