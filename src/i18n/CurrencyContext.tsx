import { createContext, useContext, useState, ReactNode } from "react";

export type Currency = "EUR" | "MAD";

/** Fixed display rate used by the business for dirham prices. */
const MAD_PER_EUR = 10;

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInEuro: number) => string;
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
const group = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const NBSP = "\u00a0";

function readSaved(): Currency {
  try {
    const saved = localStorage.getItem("currency");
    return saved === "MAD" || saved === "EUR" ? saved : "EUR";
  } catch {
    return "EUR";
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(readSaved);

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem("currency", curr);
    } catch {
      /* storage unavailable: keep in-memory choice */
    }
  };

  const formatPrice = (priceInEuro: number): string =>
    currency === "MAD"
      ? `${group.format(priceInEuro * MAD_PER_EUR)}${NBSP}DH`
      : `${group.format(priceInEuro)}${NBSP}€`;

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, formatPrice, currencySymbol: currency === "MAD" ? "DH" : "€" }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
