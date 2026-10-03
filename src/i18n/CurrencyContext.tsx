import { createContext, useContext, useState, ReactNode } from "react";
import { useLanguage } from "./LanguageContext";

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
const groupFr = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const groupEn = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
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

  const { language } = useLanguage();

  const formatPrice = (priceInEuro: number): string => {
    const en = language === "en";
    const n = currency === "MAD" ? priceInEuro * MAD_PER_EUR : priceInEuro;
    const num = (en ? groupEn : groupFr).format(n);
    if (currency === "MAD") return `${num}${NBSP}DH`;
    return en ? `€${num}` : `${num}${NBSP}€`;
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, formatPrice, currencySymbol: currency === "MAD" ? "DH" : "€" }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- provider + hook pair
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
