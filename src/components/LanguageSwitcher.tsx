import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import PreferenceMenu, { type PreferenceOption } from "./PreferenceMenu";

const languages: PreferenceOption<Language>[] = [
  { value: "fr", short: "FR", label: "Français", lang: "fr" },
  { value: "en", short: "EN", label: "English", lang: "en" },
  { value: "ar", short: "ع", label: "العربية", lang: "ar" },
];

export default function LanguageSwitcher({
  className,
}: {
  className?: string;
}) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <PreferenceMenu
      label={t.nav.language}
      value={language}
      options={languages}
      onChange={setLanguage}
      className={className}
    />
  );
}
