import { useLanguage } from "@/i18n/LanguageContext";

/** Dates travel through the forms as local ISO days (yyyy-mm-dd). */
export const isoToDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const dateToIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const intlLocale = { fr: "fr-FR", en: "en-GB", ar: "ar-MA" } as const;

/** "12 déc. 2026" / "12 Dec 2026" / Arabic equivalent, following the site language. */
export function useDateLabel(value: string) {
  const { language } = useLanguage();
  if (!value) return "";
  return new Intl.DateTimeFormat(intlLocale[language], { day: "numeric", month: "short", year: "numeric" }).format(
    isoToDate(value),
  );
}
