import { locations as sourceLocations } from "./vehicles";
import type { Language } from "@/i18n/translations";

/*
  Pick-up locations, structured from the original site's list (src/data/vehicles.ts,
  "City - Aéroport" / "City - Ville"). Nothing is added here: this only splits each entry
  into city + kind so it can be translated, grouped and searched.
*/
export type LocationKind = "airport" | "city";

export interface PickupLocation {
  /** Original label, kept as the stable identifier */
  id: string;
  city: string;
  kind: LocationKind;
}

export const pickupLocations: PickupLocation[] = sourceLocations.map((id) => {
  const [city, kind] = id.split(" - ");
  return { id, city, kind: kind === "Aéroport" ? "airport" : "city" };
});

/** Cities in their original order, each with its locations. */
export const pickupCities = pickupLocations.reduce<{ city: string; items: PickupLocation[] }[]>((groups, loc) => {
  const group = groups.find((g) => g.city === loc.city);
  if (group) group.items.push(loc);
  else groups.push({ city: loc.city, items: [loc] });
  return groups;
}, []);

// City names as written in English and Arabic (French = the source spelling).
const cityNames: Record<string, { en: string; ar: string }> = {
  Marrakech: { en: "Marrakech", ar: "مراكش" },
  Casablanca: { en: "Casablanca", ar: "الدار البيضاء" },
  Agadir: { en: "Agadir", ar: "أكادير" },
  Rabat: { en: "Rabat", ar: "الرباط" },
  Tanger: { en: "Tangier", ar: "طنجة" },
  Tétouan: { en: "Tetouan", ar: "تطوان" },
  Fès: { en: "Fez", ar: "فاس" },
  Oujda: { en: "Oujda", ar: "وجدة" },
  Essaouira: { en: "Essaouira", ar: "الصويرة" },
  "Beni Mellal": { en: "Beni Mellal", ar: "بني ملال" },
  "Al Hoceima": { en: "Al Hoceima", ar: "الحسيمة" },
  Nador: { en: "Nador", ar: "الناظور" },
};

export const cityName = (city: string, language: Language) =>
  language === "fr" ? city : (cityNames[city]?.[language] ?? city);

/** Every spelling of a city, so search works whatever the visitor types. */
export const citySpellings = (city: string) => [city, cityNames[city]?.en ?? city, cityNames[city]?.ar ?? city];

export const findLocation = (id: string) => pickupLocations.find((l) => l.id === id);
