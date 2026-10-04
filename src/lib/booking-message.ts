import type { Translations, Language } from "@/i18n/translations";
import { cityName, findLocation } from "@/data/locations";

/** "12/12/2026" (the format the team reads in WhatsApp). */
export const formatDay = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "");

export function locationText(id: string, language: Language, t: Translations) {
  const loc = findLocation(id);
  return loc ? `${cityName(loc.city, language)} – ${t.locations[loc.kind]}` : id.trim();
}

interface RequestFields {
  name?: string;
  email?: string;
  vehicle?: string;
  location?: string;
  start?: string;
  end?: string;
  message?: string;
}

/*
  One WhatsApp booking request format for the whole site.
  Only what the visitor actually chose is included — never a price (prices stay on the site).
*/
export function bookingRequest(t: Translations, language: Language, f: RequestFields) {
  const w = t.whatsapp;
  const line = (label: string, value?: string) => (value?.trim() ? [`${label}${w.sep}${value.trim()}`] : []);
  const start = formatDay(f.start ?? "");
  const end = formatDay(f.end ?? "");
  const dates = start && end ? [`${w.dates}${w.sep}${w.range(start, end)}`] : [...line(w.start, start), ...line(w.end, end)];
  return [
    f.vehicle ? w.bookVehicle(f.vehicle) : w.bookAny,
    ...line(w.name, f.name),
    ...line(w.email, f.email),
    ...dates,
    ...line(w.pickup, f.location && locationText(f.location, language, t)),
    ...line(w.message, f.message),
    w.confirm,
  ].join("\n");
}
