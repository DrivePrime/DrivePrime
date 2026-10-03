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

/** One WhatsApp booking request format for the whole site. */
export function bookingRequest(t: Translations, language: Language, f: RequestFields) {
  const w = t.whatsapp;
  const optional = (label: string, value?: string) => (value?.trim() ? [`${label}: ${value.trim()}`] : []);
  return [
    w.request,
    ...optional(w.name, f.name),
    ...optional(w.email, f.email),
    `${w.vehicle_}: ${f.vehicle || w.any}`,
    `${w.location}: ${(f.location && locationText(f.location, language, t)) || w.any}`,
    `${w.start}: ${formatDay(f.start ?? "") || w.any}`,
    `${w.end}: ${formatDay(f.end ?? "") || w.any}`,
    ...optional(w.message, f.message),
  ].join("\n");
}
