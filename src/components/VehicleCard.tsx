import { Link } from "react-router-dom";
import type { Vehicle } from "@/data/vehicles";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCurrency } from "@/i18n/CurrencyContext";
import { whatsappUrl } from "@/config/business";
import { WhatsAppIcon } from "./icons";
import { cn } from "@/lib/utils";
import { vehicleLabel } from "@/i18n/vehicle-label";

interface VehicleCardProps {
  vehicle: Vehicle;
  /** Eager-load the first row so the fleet paints immediately. */
  priority?: boolean;
  className?: string;
}

export default function VehicleCard({ vehicle, priority = false, className }: VehicleCardProps) {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const transmission = t.fleet.transmission[vehicle.transmission];
  const label = vehicleLabel(vehicle, t);
  const fullName = `${vehicle.name} (${transmission})`;

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-card">
        <img
          src={vehicle.thumb}
          srcSet={`${vehicle.thumb} 768w, ${vehicle.image} 1536w`}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
          alt={label}
          width={768}
          height={512}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition-[transform,filter] duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-hover:brightness-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="type-wide text-[17px] font-semibold leading-snug text-foreground">
            <Link
              to={`/vehicule/${vehicle.id}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ring focus-visible:after:rounded-md"
            >
              {label}
            </Link>
          </h3>
          <p className="shrink-0 text-end leading-tight">
            <span className="sr-only">{t.fleet.from} </span>
            <span className="tabular text-[17px] font-semibold text-foreground">
              {formatPrice(vehicle.pricePerDay)}
            </span>
            <span className="text-[13px] text-muted-foreground"> {t.fleet.perDay}</span>
          </p>
        </div>

        <p className="mt-1.5 text-[14px] text-muted-foreground">
          {t.fleet.categories[vehicle.category]}
          <span aria-hidden="true" className="mx-2 text-foreground/20">/</span>
          {transmission}
          <span aria-hidden="true" className="mx-2 text-foreground/20">/</span>
          {t.fleet.fuel[vehicle.fuel]}
          <span aria-hidden="true" className="mx-2 text-foreground/20">/</span>
          {t.fleet.seats(vehicle.seats)}
        </p>

        <div className="mt-4 flex items-center gap-5 border-t border-border pt-3.5">
          <a
            href={whatsappUrl(t.whatsapp.vehicle(fullName))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.fleet.bookAria(label)}
            className="relative z-10 inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:text-gold-light transition-colors"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {t.fleet.book}
          </a>
          <span className="ms-auto text-[14px] text-muted-foreground transition-colors group-hover:text-foreground">
            {t.fleet.details}
          </span>
        </div>
      </div>
    </article>
  );
}
