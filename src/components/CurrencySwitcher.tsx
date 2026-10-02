import { useCurrency, Currency } from "@/i18n/CurrencyContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const currencies: { code: Currency; label: string }[] = [
  { code: "EUR", label: "€" },
  { code: "MAD", label: "DH" },
];

export default function CurrencySwitcher({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  const { t } = useLanguage();

  return (
    <div role="group" aria-label={t.nav.currency} className={cn("flex items-center", className)}>
      {currencies.map((curr) => (
        <button
          key={curr.code}
          type="button"
          aria-label={curr.code}
          aria-pressed={currency === curr.code}
          onClick={() => setCurrency(curr.code)}
          className={cn(
            "h-8 min-w-8 px-2 text-[13px] font-medium rounded-sm transition-colors",
            currency === curr.code
              ? "text-foreground bg-foreground/10"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {curr.label}
        </button>
      ))}
    </div>
  );
}
