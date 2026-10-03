import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { pickupLocations } from "@/data/locations";
import { confirmed } from "@/config/business";

/*
  The visitor's search (pick-up location + dates), shared across the site: set in the hero,
  shown above the fleet, and carried into every "Réserver" WhatsApp message and vehicle page.
*/
export interface BookingSearch {
  location: string;
  start: string;
  end: string;
}

interface BookingContextValue extends BookingSearch {
  setLocation: (id: string) => void;
  setStart: (iso: string) => void;
  setEnd: (iso: string) => void;
  /** True once the visitor has picked dates (the search is "real"). */
  hasDates: boolean;
  /** Number of rental days, when both dates are set. */
  days: number | null;
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

const DAY = 86_400_000;
const isoTime = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

export function BookingProvider({ children }: { children: ReactNode }) {
  // Same default as the original site: the first location of its list (Marrakech airport).
  const [location, setLocation] = useState(confirmed.pickupLocations ? pickupLocations[0].id : "");
  const [start, setStartState] = useState("");
  const [end, setEnd] = useState("");

  const value = useMemo<BookingContextValue>(() => {
    const days = start && end && end >= start ? Math.max(1, Math.round((isoTime(end) - isoTime(start)) / DAY)) : null;
    return {
      location,
      start,
      end,
      setLocation,
      setStart: (iso: string) => {
        setStartState(iso);
        // A return date before the new pick-up date is no longer valid.
        setEnd((prev) => (prev && prev < iso ? "" : prev));
      },
      setEnd,
      hasDates: !!(start || end),
      days,
    };
  }, [location, start, end]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- provider + hook pair
export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within a BookingProvider");
  return ctx;
}
