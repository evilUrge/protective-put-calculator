import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const currencies = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  ILS: { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', flag: '🇮🇱' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' }
};

// Mock exchange rates - in production, fetch from a real API like exchangerate-api.com
const mockExchangeRates = {
  USD: 1.0,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.0,
  CHF: 0.92,
  CAD: 1.25,
  AUD: 1.35,
  ILS: 3.25,
  CNY: 6.45,
  INR: 74.5
};

export const CurrencyProvider = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState(mockExchangeRates);
  const [loading, setLoading] = useState(false);

  // Fetch exchange rates (simulated)
  const fetchExchangeRates = useCallback(async () => {
    setLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // In production, replace with real API call like:
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      // const data = await response.json();
      // setExchangeRates(data.rates);

      // For now, use mock data with slight variations
      const rates = { ...mockExchangeRates };
      Object.keys(rates).forEach(currency => {
        if (currency !== 'USD') {
          // Add small random variation to simulate live rates
          const variation = 0.98 + Math.random() * 0.04; // ±2% variation
          rates[currency] = mockExchangeRates[currency] * variation;
        }
      });

      setExchangeRates(rates);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Convert amount from USD to target currency
  const convertFromUSD = useCallback((amount, targetCurrency = currentCurrency) => {
    if (targetCurrency === 'USD') return amount;
    return amount * (exchangeRates[targetCurrency] || 1);
  }, [currentCurrency, exchangeRates]);

  // Convert amount from any currency to USD
  const convertToUSD = useCallback((amount, fromCurrency) => {
    if (fromCurrency === 'USD') return amount;
    return amount / (exchangeRates[fromCurrency] || 1);
  }, [exchangeRates]);

  // Format currency value with proper symbol and formatting
  const formatCurrency = useCallback((amount, currencyCode = currentCurrency, decimals = 2) => {
    const currency = currencies[currencyCode];
    if (!currency) return amount.toFixed(decimals);

    const formatted = amount.toFixed(decimals);

    // Handle different currency formatting
    switch (currencyCode) {
      case 'USD':
      case 'CAD':
      case 'AUD':
        return `${currency.symbol}${formatted}`;
      case 'EUR':
        return `${formatted}${currency.symbol}`;
      case 'GBP':
        return `${currency.symbol}${formatted}`;
      case 'JPY':
        return `${currency.symbol}${Math.round(amount).toLocaleString()}`;
      case 'ILS':
        return `${formatted}${currency.symbol}`;
      case 'CHF':
        return `${currency.symbol} ${formatted}`;
      case 'CNY':
      case 'INR':
        return `${currency.symbol}${formatted}`;
      default:
        return `${currency.symbol}${formatted}`;
    }
  }, [currentCurrency]);

  // Get currency symbol
  const getCurrencySymbol = useCallback((currencyCode = currentCurrency) => {
    return currencies[currencyCode]?.symbol || '$';
  }, [currentCurrency]);

  // Update exchange rates on mount and set up periodic updates
  useEffect(() => {
    fetchExchangeRates();

    // Update rates every 5 minutes in production
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchExchangeRates]);

  const value = {
    currentCurrency,
    setCurrentCurrency,
    currencies,
    exchangeRates,
    loading,
    convertFromUSD,
    convertToUSD,
    formatCurrency,
    getCurrencySymbol,
    fetchExchangeRates
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};