import { useCurrency, Currency } from "@/i18n/CurrencyContext";
import { useLanguage } from "@/i18n/LanguageContext";
import PreferenceMenu, { type PreferenceOption } from "./PreferenceMenu";

const currencies: PreferenceOption<Currency>[] = [
  { value: "EUR", short: "EUR", label: "EUR", hint: "€" },
  { value: "MAD", short: "MAD", label: "MAD", hint: "DH" },
];

export default function CurrencySwitcher({
  className,
}: {
  className?: string;
}) {
  const { currency, setCurrency } = useCurrency();
  const { t } = useLanguage();
  return (
    <PreferenceMenu
      label={t.nav.currency}
      value={currency}
      options={currencies}
      onChange={setCurrency}
      className={className}
    />
  );
}
