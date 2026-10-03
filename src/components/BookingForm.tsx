import { useId, useState, FormEvent } from "react";
import { vehicles } from "@/data/vehicles";
import { cityName, findLocation, pickupLocations } from "@/data/locations";
import { useLanguage } from "@/i18n/LanguageContext";
import { openWhatsApp, confirmed } from "@/config/business";
import { cn } from "@/lib/utils";
import { dateToIso } from "@/lib/dates";
import { WhatsAppIcon } from "./icons";
import DateField from "./DateField";
import LocationField from "./LocationField";

interface BookingFormProps {
  /** "bar" = one row on desktop (hero); "stack" = vertical (vehicle page) */
  layout?: "bar" | "stack";
  /** When set, the vehicle is fixed and its selector is hidden. */
  vehicleName?: string;
  className?: string;
}

const today = () => dateToIso(new Date());
const formatDate = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "");

export default function BookingForm({ layout = "bar", vehicleName, className }: BookingFormProps) {
  const { t, language } = useLanguage();
  const id = useId();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  // Same default as the original site: the first location of its list (Marrakech airport).
  const [location, setLocation] = useState(confirmed.pickupLocations ? pickupLocations[0].id : "");
  const [vehicle, setVehicle] = useState(vehicleName ?? "");
  const [error, setError] = useState("");

  const locationText = () => {
    const loc = findLocation(location);
    return loc ? `${cityName(loc.city, language)} – ${t.locations[loc.kind]}` : location.trim();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (start && end && end < start) {
      setError(t.booking.endBeforeStart);
      return;
    }
    setError("");
    const w = t.whatsapp;
    const lines = [
      w.request,
      `${w.vehicle_}: ${vehicle || w.any}`,
      `${w.location}: ${locationText() || w.any}`,
      `${w.start}: ${formatDate(start) || w.any}`,
      `${w.end}: ${formatDate(end) || w.any}`,
    ];
    openWhatsApp(lines.join("\n"));
  };

  const bar = layout === "bar";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        "grid gap-4",
        bar
          ? "sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.25fr_auto] lg:items-end lg:gap-3"
          : "grid-cols-2 gap-x-3",
        className,
      )}
    >
      <div className={cn(bar ? "sm:col-span-2 lg:col-span-1" : "col-span-2")}>
        <label htmlFor={`${id}-location`} className="field-label">
          {t.booking.location}
        </label>
        {confirmed.pickupLocations ? (
          <LocationField id={`${id}-location`} value={location} onChange={setLocation} />
        ) : (
          <input
            id={`${id}-location`}
            type="text"
            autoComplete="off"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t.booking.locationPlaceholder}
            className="field"
          />
        )}
      </div>
      <div>
        <label htmlFor={`${id}-start`} className="field-label">
          {t.booking.startDate}
        </label>
        <DateField
          id={`${id}-start`}
          min={today()}
          value={start}
          onChange={(iso) => {
            setStart(iso);
            if (end && end < iso) setEnd("");
            setError("");
          }}
        />
      </div>
      <div>
        <label htmlFor={`${id}-end`} className="field-label">
          {t.booking.endDate}
        </label>
        <DateField
          id={`${id}-end`}
          min={start || today()}
          value={end}
          onChange={(iso) => {
            setEnd(iso);
            setError("");
          }}
          invalid={!!error}
          describedBy={error ? `${id}-error` : undefined}
        />
      </div>
      {!vehicleName && (
        <div className={cn(bar && "sm:col-span-2 lg:col-span-1")}>
          <label htmlFor={`${id}-vehicle`} className="field-label">
            {t.booking.vehicle}
          </label>
          <select
            id={`${id}-vehicle`}
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            className="field"
          >
            <option value="">{t.booking.anyVehicle}</option>
            {vehicles.map((v) => (
              <option key={v.id} value={`${v.name} (${t.fleet.transmission[v.transmission]})`}>
                {v.name} · {t.fleet.transmission[v.transmission]}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className={cn(bar ? "sm:col-span-2 lg:col-span-1" : "col-span-2 pt-1")}>
        <button type="submit" className="btn-primary w-full lg:px-5">
          <WhatsAppIcon className="h-4 w-4" />
          {t.booking.submit}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="col-span-full text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
