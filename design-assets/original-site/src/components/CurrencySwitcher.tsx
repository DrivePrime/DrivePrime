import { useCurrency, Currency } from "@/i18n/CurrencyContext";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  const currencies: { code: Currency; label: string }[] = [
    { code: "EUR", label: "€ EUR" },
    { code: "MAD", label: "DH MAD" },
  ];

  return (
    <div className="flex items-center bg-secondary/50 rounded-lg p-0.5">
      {currencies.map((curr) => (
        <button
          key={curr.code}
          onClick={() => setCurrency(curr.code)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            currency === curr.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {curr.label}
        </button>
      ))}
    </div>
  );
}