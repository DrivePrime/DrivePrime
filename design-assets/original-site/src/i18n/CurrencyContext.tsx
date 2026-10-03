import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Currency = 'EUR' | 'MAD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInEuro: number) => string;
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency');
    return (saved as Currency) || 'EUR';
  });

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('currency', curr);
  };

  const formatPrice = (priceInEuro: number): string => {
    if (currency === 'MAD') {
      return `${priceInEuro * 10} DH`;
    }
    return `${priceInEuro}€`;
  };

  const currencySymbol = currency === 'MAD' ? 'DH' : '€';

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    formatPrice,
    currencySymbol,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}