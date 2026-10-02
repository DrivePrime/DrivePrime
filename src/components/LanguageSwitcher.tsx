import { useLanguage } from "@/i18n/LanguageContext";
import { Language } from "@/i18n/translations";
import { cn } from "@/lib/utils";

const languages: { code: Language; label: string; name: string }[] = [
  { code: "fr", label: "FR", name: "Français" },
  { code: "en", label: "EN", name: "English" },
  { code: "ar", label: "ع", name: "العربية" },
];

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div role="group" aria-label={t.nav.language} className={cn("flex items-center", className)}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          lang={lang.code}
          title={lang.name}
          aria-label={lang.name}
          aria-pressed={language === lang.code}
          onClick={() => setLanguage(lang.code)}
          className={cn(
            "h-8 min-w-8 px-2 text-[13px] font-medium rounded-sm transition-colors",
            language === lang.code
              ? "text-foreground bg-foreground/10"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
