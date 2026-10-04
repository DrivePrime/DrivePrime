import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Vehicle } from "@/data/vehicles";
import { useLanguage } from "@/i18n/LanguageContext";
import { useBooking } from "@/context/BookingContext";
import { whatsappUrl } from "@/config/business";
import { bookingRequest } from "@/lib/booking-message";
import { vehicleLabel } from "@/i18n/vehicle-label";
import { stageZoom } from "@/data/stage";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";
import PriceTag from "./PriceTag";
import Availability from "./Availability";
import { useCurrency } from "@/i18n/CurrencyContext";

interface VehicleCardProps {
  vehicle: Vehicle;
  /** Eager-load the first row so the fleet paints immediately. */
  priority?: boolean;
  className?: string;
  /** Layout hint for responsive image selection. */
  sizes?: string;
}

/*
  Showroom card. The car on its studio stage dominates; name and price, then three facts.
  Desktop: the actions rise onto the photo on hover / keyboard focus. Touch: always shown.
  "Réserver" carries the visitor's search (location, dates) into the WhatsApp request.
*/
export default function VehicleCard({
  vehicle,
  priority = false,
  className,
  sizes = "(min-width: 1360px) 650px, (min-width: 768px) 48vw, 100vw",
}: VehicleCardProps) {
  const { t, language } = useLanguage();
  const booking = useBooking();
  const { formatPrice } = useCurrency();
  const transmission = t.fleet.transmission[vehicle.transmission];
  const label = vehicleLabel(vehicle, t);
  const fullName = `${vehicle.name} (${transmission})`;
  const message = booking.hasDates
    ? bookingRequest(t, language, {
        vehicle: fullName,
        rate: `${t.fleet.from} ${formatPrice(vehicle.pricePerDay)} ${t.fleet.perDay}`,
        location: booking.location,
        start: booking.start,
        end: booking.end,
      })
    : t.whatsapp.vehicle(fullName);

  const reserve = (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.fleet.bookAria(label)}
      className="relative z-10 -my-3 inline-flex items-center gap-2 py-3 text-[14px] font-semibold text-primary transition-colors hover:text-gold-light"
    >
      <WhatsAppIcon className="h-4 w-4" />
      {t.fleet.book}
    </a>
  );

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative">
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

        {/* Desktop hover / focus: actions rise onto the photograph */}
        <div className="card-actions pointer-events-none absolute inset-x-0 bottom-4 hidden justify-center gap-2 [@media(hover:hover)]:flex">
          <a
            href={whatsappUrl(message)}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden="true"
            className="pointer-events-auto relative z-10 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_rgb(0_0_0/0.8)] transition-colors hover:bg-gold-light"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {t.fleet.book}
          </a>
          <span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-background/80 px-5 text-[14px] font-medium text-foreground shadow-[0_10px_30px_-10px_rgb(0_0_0/0.8)]">
            {t.fleet.details}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-x-6 px-1 pt-1">
        <h3 className="type-wide text-xl font-semibold leading-tight text-foreground">
          <Link
            to={`/vehicule/${vehicle.id}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-md focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ring"
          >
            {label}
          </Link>
        </h3>
        <PriceTag pricePerDay={vehicle.pricePerDay} size="md" align="end" />
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1">
        <p className="text-[14px] text-muted-foreground">
          {transmission}
          <span aria-hidden="true" className="mx-2 text-foreground/20">/</span>
          {t.fleet.seats(vehicle.seats)}
          <span aria-hidden="true" className="mx-2 text-foreground/20">/</span>
          {t.fleet.fuel[vehicle.fuel]}
        </p>
        <Availability />
      </div>

      {/* Visible action row: always on touch screens; on desktop kept for keyboard and screen readers */}
      <div className="mt-5 flex items-center gap-6 px-1 [@media(hover:hover)]:sr-only [@media(hover:hover)]:focus-within:not-sr-only">
        {reserve}
        <span aria-hidden="true" className="ms-auto inline-flex items-center gap-1.5 text-[14px] text-muted-foreground">
          {t.fleet.details}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </span>
      </div>
    </article>
  );
}
