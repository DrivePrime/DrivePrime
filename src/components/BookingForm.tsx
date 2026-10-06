import { useId, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useBooking } from "@/context/BookingContext";
import { openWhatsApp, confirmed } from "@/config/business";
import { bookingRequest } from "@/lib/booking-message";
import { cn } from "@/lib/utils";
import { dateToIso } from "@/lib/dates";
import { WhatsAppIcon } from "./icons";
import DateField from "./DateField";
import LocationField from "./LocationField";

interface BookingFormProps {
  /**
   * "engine": hero search (location, dates → see the vehicles; WhatsApp as a shortcut).
   * "stack": vehicle page, sends the request for that vehicle on WhatsApp.
   */
  layout?: "engine" | "stack";
  /** Vehicle page: the vehicle being booked. */
  vehicleName?: string;
  className?: string;
}

const today = () => dateToIso(new Date());

export default function BookingForm({
  layout = "engine",
  vehicleName,
  className,
}: BookingFormProps) {
  const { t, language } = useLanguage();
  const booking = useBooking();
  const navigate = useNavigate();
  const id = useId();
  const engine = layout === "engine";

  const sendWhatsApp = () =>
    openWhatsApp(
      bookingRequest(t, language, {
        vehicle: vehicleName,
        location: booking.location,
        start: booking.start,
        end: booking.end,
      }),
    );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (engine) navigate("/#flotte");
    else sendWhatsApp();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={className}>
      <div
        className={cn(
          "grid gap-3",
          engine
            ? "sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-end"
            : "grid-cols-2 gap-x-3",
        )}
      >
        <div
          className={cn(engine ? "sm:col-span-2 lg:col-span-1" : "col-span-2")}
        >
          <label htmlFor={`${id}-location`} className="field-label">
            {t.booking.location}
          </label>
          {confirmed.pickupLocations ? (
            <LocationField
              id={`${id}-location`}
              value={booking.location}
              onChange={booking.setLocation}
            />
          ) : (
            <input
              id={`${id}-location`}
              type="text"
              autoComplete="off"
              value={booking.location}
              onChange={(e) => booking.setLocation(e.target.value)}
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
            value={booking.start}
            onChange={booking.setStart}
          />
        </div>
        <div>
          <label htmlFor={`${id}-end`} className="field-label">
            {t.booking.endDate}
          </label>
          <DateField
            id={`${id}-end`}
            min={booking.start || today()}
            value={booking.end}
            onChange={booking.setEnd}
          />
        </div>
        <div
          className={cn(
            engine ? "sm:col-span-2 lg:col-span-1" : "col-span-2 pt-1",
          )}
        >
          <button
            type="submit"
            className="btn-primary group/cta w-full lg:px-6"
          >
            {engine ? (
              <>
                {t.booking.searchCta}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 rtl:rotate-180 rtl:group-hover/cta:-translate-x-0.5" />
              </>
            ) : (
              <>
                <WhatsAppIcon className="h-4 w-4" />
                {t.booking.submit}
              </>
            )}
          </button>
        </div>
      </div>

      {engine && (
        <button
          type="button"
          onClick={sendWhatsApp}
          className="mt-4 inline-flex items-center gap-2 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <WhatsAppIcon className="h-4 w-4 text-primary" />
          {t.booking.orWhatsapp}
        </button>
      )}
    </form>
  );
}
