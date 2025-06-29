import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, Shield, AlertTriangle, DollarSign, BarChart3, Loader, RefreshCw, Globe, ChevronDown } from 'lucide-react';
import { useLanguage, languages } from '../src/contexts/LanguageContext';
import { useCurrency, currencies } from '../src/contexts/CurrencyContext';
import { useTranslation } from '../src/translations';

const ProtectivePutCalculator = () => {
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();
  const { currentCurrency, setCurrentCurrency, formatCurrency, convertFromUSD } = useCurrency();
  const { t } = useTranslation(currentLanguage);

  const [inputs, setInputs] = useState({
    stockSymbol: 'AAPL',
    currentStockPrice: 150.00,
    numberOfShares: 100,
    protectionLevel: 0.95,
    timeHorizon: 90,
    riskFreeRate: 0.05,
    impliedVolatility: 0.25
  });

  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(new Date());
  const [stockData, setStockData] = useState(null);
  const [calculationResults, setCalculationResults] = useState(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [error, setError] = useState(null);

  // Fetch live stock data using Next.js API route
  const fetchLiveStockData = useCallback(async (symbol) => {
    if (!symbol || symbol.length < 1) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Fetching live stock data for ${symbol} via Next.js API...`);

      // Call Next.js API route instead of external API
      const response = await fetch(`/api/stock-data?symbol=${encodeURIComponent(symbol)}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      console.log(`✅ Successfully received live data via Next.js API:`, data);

      setStockData(data);
      setInputs(prev => ({
        ...prev,
        currentStockPrice: data.price,
        impliedVolatility: data.estimatedVolatility
      }));
      setLastFetched(new Date());

      // Show success message in console
      console.log(`📊 Live data loaded for ${data.symbol}: $${data.price.toFixed(2)} (${data.provider})`);

    } catch (error) {
      console.error('❌ Error fetching live stock data via Next.js API:', error);
      setError(error.message);

      // Don't clear existing data on error, just show the error
      if (!stockData) {
        // Only set fallback data if we have no data at all
        setStockData({
          symbol: symbol.toUpperCase(),
          name: `${symbol.toUpperCase()} Corporation`,
          price: 100,
          estimatedVolatility: 0.25,
          provider: 'Fallback',
          isLive: false,
          error: error.message
        });
      }
    } finally {
      setLoading(false);
    }
  }, [stockData]);

  // Auto-fetch when symbol changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputs.stockSymbol && inputs.stockSymbol.length >= 1) {
        fetchLiveStockData(inputs.stockSymbol);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [inputs.stockSymbol, fetchLiveStockData]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close language dropdown if clicking outside
      if (showLanguageMenu && !event.target.closest('[data-dropdown="language"]')) {
        setShowLanguageMenu(false);
      }
      // Close currency dropdown if clicking outside
      if (showCurrencyMenu && !event.target.closest('[data-dropdown="currency"]')) {
        setShowCurrencyMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguageMenu, showCurrencyMenu]);

  // Black-Scholes calculation functions
  const normalCDF = (x) => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  };

  const calculateProtectivePut = () => {
    const { currentStockPrice, protectionLevel, timeHorizon, riskFreeRate, impliedVolatility, numberOfShares } = inputs;

    if (!currentStockPrice || currentStockPrice <= 0) {
      return null;
    }

    const S = currentStockPrice;
    const K = currentStockPrice * protectionLevel;
    const T = timeHorizon / 365;
    const r = riskFreeRate;
    const sigma = impliedVolatility;

    if (T <= 0 || sigma <= 0 || S <= 0 || K <= 0) {
      return null;
    }

    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    const Nmd1 = normalCDF(-d1);
    const Nmd2 = normalCDF(-d2);

    // Put option price (in USD)
    const putPriceUSD = K * Math.exp(-r * T) * Nmd2 - S * Nmd1;

    // Convert to selected currency
    const putPrice = convertFromUSD(putPriceUSD);
    const currentStockPriceConverted = convertFromUSD(currentStockPrice);
    const strikePriceConverted = convertFromUSD(K);

    // Greeks
    const delta = Nmd1 - 1;
    const theta = (-S * (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * d1 * d1) * sigma / (2 * Math.sqrt(T))
      - r * K * Math.exp(-r * T) * Nmd2) / 365;
    const vega = S * Math.sqrt(T) * (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * d1 * d1) / 100;
    const gamma = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * d1 * d1) / (S * sigma * Math.sqrt(T));

    // Strategy calculations
    const portfolioValue = currentStockPriceConverted * numberOfShares;
    const totalPremiumCost = putPrice * numberOfShares;
    const costPercentage = (totalPremiumCost / portfolioValue) * 100;
    const annualizedCost = (costPercentage * 365) / timeHorizon;
    const maxLoss = (currentStockPriceConverted - strikePriceConverted + putPrice) * numberOfShares;
    const breakevenPrice = currentStockPriceConverted + putPrice;
    const protectedValue = Math.max(strikePriceConverted * numberOfShares - totalPremiumCost, 0);

    // Scenario analysis
    const scenarios = [];
    const priceRange = currentStockPriceConverted * 0.4;
    const step = priceRange / 10;

    for (let i = 0; i <= 10; i++) {
      const stockPrice = currentStockPriceConverted - priceRange / 2 + i * step;
      const stockValue = stockPrice * numberOfShares;
      const putValue = Math.max(strikePriceConverted - stockPrice, 0) * numberOfShares;
      const totalValue = stockValue + putValue - totalPremiumCost;
      const pnl = totalValue - (currentStockPriceConverted * numberOfShares - totalPremiumCost);

      scenarios.push({
        stockPrice,
        stockValue,
        putValue,
        totalValue,
        pnl,
        pnlPercent: (pnl / (currentStockPriceConverted * numberOfShares)) * 100
      });
    }

    // Warnings
    const warnings = [];
    if (annualizedCost > 5) {
      warnings.push({
        type: 'warning',
        message: t('highCostWarning', { cost: annualizedCost.toFixed(2) })
      });
    }
    if (timeHorizon < 30) {
      warnings.push({
        type: 'info',
        message: t('shortTimeWarning')
      });
    }
    if (impliedVolatility > 0.5) {
      warnings.push({
        type: 'warning',
        message: t('highVolatilityWarning')
      });
    }

    return {
      putPrice,
      strikePriceConverted,
      portfolioValue,
      totalPremiumCost,
      costPercentage,
      annualizedCost,
      maxLoss,
      breakevenPrice,
      protectedValue,
      greeks: { delta, theta, vega, gamma },
      scenarios,
      warnings
    };
  };

  const handleCalculate = () => {
    const results = calculateProtectivePut();
    setCalculationResults(results);
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    // Auto-calculate when inputs change
    setTimeout(() => handleCalculate(), 100);
  };

  const handleRefresh = () => {
    if (inputs.stockSymbol) {
      fetchLiveStockData(inputs.stockSymbol);
    }
  };

  // Auto-calculate on mount and when inputs change
  useEffect(() => {
    handleCalculate();
  }, [inputs, currentCurrency]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-indigo-900/30 via-purple-900/30 to-cyan-900/30 border-b border-gray-700/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl shadow-2xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {t('appTitle')}
                </h1>
                <p className="text-gray-400 text-lg">{t('appSubtitle')}</p>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <div className="relative" data-dropdown="language">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2 transition-all duration-200 backdrop-blur-sm"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-lg">{languages[currentLanguage].flag}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showLanguageMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-lg shadow-2xl min-w-[180px] max-h-64 overflow-y-auto z-[60]">
                    {Object.values(languages).map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-700/50 transition-colors flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg ${currentLanguage === lang.code ? 'bg-blue-600/20 text-blue-400' : 'text-gray-200'
                          }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Currency Selector */}
              <div className="relative" data-dropdown="currency">
                <button
                  onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                  className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2 transition-all duration-200 backdrop-blur-sm"
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="text-lg">{currencies[currentCurrency].flag}</span>
                  <span className="font-mono">{currentCurrency}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showCurrencyMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-lg shadow-2xl min-w-[200px] max-h-64 overflow-y-auto z-[60]">
                    {Object.values(currencies).map((currency) => (
                      <button
                        key={currency.code}
                        onClick={() => {
                          setCurrentCurrency(currency.code);
                          setShowCurrencyMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-700/50 transition-colors flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg ${currentCurrency === currency.code ? 'bg-blue-600/20 text-blue-400' : 'text-gray-200'
                          }`}
                      >
                        <span className="text-lg">{currency.flag}</span>
                        <div>
                          <div className="font-mono font-semibold">{currency.code}</div>
                          <div className="text-xs text-gray-400">{currency.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Last Updated */}
              {lastFetched && (
                <div className="text-right text-sm">
                  <div className="text-gray-400">{t('lastUpdated')}</div>
                  <div className="text-gray-300 font-mono">
                    {lastFetched.toLocaleTimeString('en', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Enhanced Input Panel */}
          <div className="lg:col-span-1">
            <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-2xl"></div>
              <div className="relative">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                  <Calculator className="w-5 h-5 text-blue-400" />
                  {t('strategyParameters')}
                </h2>

                <div className="space-y-6">
                  {/* Stock Symbol */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('stockSymbol')}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputs.stockSymbol}
                        onChange={(e) => handleInputChange('stockSymbol', e.target.value.toUpperCase())}
                        className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200"
                        placeholder={t('stockSymbolPlaceholder')}
                      />
                      <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white p-3 rounded-lg transition-all duration-200 shadow-lg"
                      >
                        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      </button>
                    </div>
                    {stockData && (
                      <div className="mt-2 text-sm text-gray-400 flex items-center gap-4">
                        <span>
                          {t('current')}: <span className="text-green-400 font-semibold">
                            {formatCurrency(convertFromUSD(stockData.price))}
                          </span>
                        </span>
                        {stockData.change && (
                          <span className={stockData.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)}%
                          </span>
                        )}
                        {stockData.marketCap && (
                          <span>{t('cap')}: {formatCurrency(convertFromUSD(stockData.marketCap / 1e9), currentCurrency, 1)}B</span>
                        )}
                      </div>
                    )}

                    {/* Live Data Status */}
                    {stockData && (
                      <div className="mt-3 p-3 rounded-lg bg-gray-700/30 border border-gray-600/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${stockData.isLive ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                            <span className="text-sm font-medium">
                              {stockData.isLive ? '🟢 Live Data' : '⚠️ Fallback Data'}
                            </span>
                          </div>
                          {stockData.provider && (
                            <span className="text-xs text-gray-400">
                              via {stockData.provider} (Next.js API)
                            </span>
                          )}
                        </div>
                        {stockData.name && (
                          <div className="text-xs text-gray-400 mt-1">
                            {stockData.name} • {stockData.sector || 'Unknown Sector'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error Display */}
                    {error && (
                      <div className="mt-3 p-3 rounded-lg bg-red-900/20 border border-red-600/30">
                        <div className="flex items-center gap-2 text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">API Error</span>
                        </div>
                        <div className="text-xs text-red-300 mt-1 break-words">
                          {error}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          💡 Check server-side API configuration or try again later.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Current Stock Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('currentStockPrice')} ({currencies[currentCurrency].symbol})
                    </label>
                    <input
                      type="number"
                      value={convertFromUSD(inputs.currentStockPrice).toFixed(2)}
                      onChange={(e) => handleInputChange('currentStockPrice', parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200"
                      step="0.01"
                      disabled={loading}
                    />
                  </div>

                  {/* Number of Shares */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('numberOfShares')}</label>
                    <input
                      type="number"
                      value={inputs.numberOfShares}
                      onChange={(e) => handleInputChange('numberOfShares', parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200"
                    />
                  </div>

                  {/* Protection Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('protectionLevel')}: {(inputs.protectionLevel * 100).toFixed(0)}%
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        min="0.80"
                        max="0.99"
                        step="0.01"
                        value={inputs.protectionLevel}
                        onChange={(e) => handleInputChange('protectionLevel', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700/50 rounded-lg appearance-none cursor-pointer range-slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>80%</span>
                        <span>99%</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {t('strike')}: {formatCurrency(convertFromUSD(inputs.currentStockPrice * inputs.protectionLevel))}
                    </div>
                  </div>

                  {/* Time Horizon */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('timeHorizon')}</label>
                    <select
                      value={inputs.timeHorizon}
                      onChange={(e) => handleInputChange('timeHorizon', parseInt(e.target.value))}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200"
                    >
                      <option value={30}>{t('days30')}</option>
                      <option value={60}>{t('days60')}</option>
                      <option value={90}>{t('days90')}</option>
                      <option value={180}>{t('days180')}</option>
                      <option value={365}>{t('days365')}</option>
                    </select>
                  </div>

                  {/* Risk-Free Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('riskFreeRate')}: {(inputs.riskFreeRate * 100).toFixed(1)}%
                    </label>
                    <input
                      type="number"
                      value={inputs.riskFreeRate}
                      onChange={(e) => handleInputChange('riskFreeRate', parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200"
                      step="0.001"
                      min="0"
                      max="0.1"
                    />
                  </div>

                  {/* Implied Volatility */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('impliedVolatility')}: {(inputs.impliedVolatility * 100).toFixed(0)}%
                    </label>
                    <input
                      type="number"
                      value={inputs.impliedVolatility}
                      onChange={(e) => handleInputChange('impliedVolatility', parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm transition-all duration-200"
                      step="0.01"
                      min="0.05"
                      max="1.0"
                    />
                    {stockData?.estimatedVolatility && (
                      <div className="text-sm text-gray-400 mt-1">
                        {t('estimatedFromData')}: {(stockData.estimatedVolatility * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>

                  {/* Enhanced Calculate Button */}
                  <button
                    onClick={handleCalculate}
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <BarChart3 className="w-5 h-5" />
                      {t('calculateStrategy')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {calculationResults ? (
              <div className="space-y-6">
                {/* Strategy Overview */}
                <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-blue-600/5 rounded-2xl"></div>
                  <div className="relative">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                      <Shield className="w-5 h-5 text-green-400" />
                      {t('strategyOverview')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                        <div className="text-sm text-gray-400">{t('putPremium')}</div>
                        <div className="text-2xl font-bold text-green-400">
                          {formatCurrency(calculationResults.putPrice)}
                        </div>
                        <div className="text-xs text-gray-500">{t('perContract')}</div>
                      </div>

                      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                        <div className="text-sm text-gray-400">{t('totalCost')}</div>
                        <div className="text-2xl font-bold text-blue-400">
                          {formatCurrency(calculationResults.totalPremiumCost)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {calculationResults.costPercentage.toFixed(2)}% {t('ofPortfolio')}
                        </div>
                      </div>

                      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                        <div className="text-sm text-gray-400">{t('annualizedCost')}</div>
                        <div className="text-2xl font-bold text-purple-400">
                          {calculationResults.annualizedCost.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-500">{t('perYear')}</div>
                      </div>

                      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                        <div className="text-sm text-gray-400">{t('maxLoss')}</div>
                        <div className="text-2xl font-bold text-red-400">
                          {formatCurrency(Math.max(0, calculationResults.maxLoss))}
                        </div>
                        <div className="text-xs text-gray-500">{t('worstCase')}</div>
                      </div>

                      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                        <div className="text-sm text-gray-400">{t('breakeven')}</div>
                        <div className="text-2xl font-bold text-yellow-400">
                          {formatCurrency(calculationResults.breakevenPrice)}
                        </div>
                        <div className="text-xs text-gray-500">{t('stockPrice')}</div>
                      </div>

                      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                        <div className="text-sm text-gray-400">{t('protectedValue')}</div>
                        <div className="text-2xl font-bold text-cyan-400">
                          {formatCurrency(calculationResults.protectedValue)}
                        </div>
                        <div className="text-xs text-gray-500">{t('minimum')}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {calculationResults.warnings && calculationResults.warnings.length > 0 && (
                  <div className="relative bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-sm rounded-2xl border border-yellow-600/30 p-6">
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-400">
                      <AlertTriangle className="w-5 h-5" />
                      {t('warnings')}
                    </h4>
                    <div className="space-y-2">
                      {calculationResults.warnings.map((warning, index) => (
                        <div key={index} className="flex items-start gap-2 text-yellow-200">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{warning.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Greeks */}
                <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 rounded-2xl"></div>
                  <div className="relative">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      {t('optionGreeks')}
                    </h4>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/30">
                        <div className="text-sm text-gray-400">Delta</div>
                        <div className="text-lg font-semibold text-purple-400">
                          {calculationResults.greeks.delta.toFixed(3)}
                        </div>
                      </div>

                      <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/30">
                        <div className="text-sm text-gray-400">Gamma</div>
                        <div className="text-lg font-semibold text-pink-400">
                          {calculationResults.greeks.gamma.toFixed(4)}
                        </div>
                      </div>

                      <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/30">
                        <div className="text-sm text-gray-400">Theta</div>
                        <div className="text-lg font-semibold text-red-400">
                          {calculationResults.greeks.theta.toFixed(3)}
                        </div>
                      </div>

                      <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/30">
                        <div className="text-sm text-gray-400">Vega</div>
                        <div className="text-lg font-semibold text-cyan-400">
                          {calculationResults.greeks.vega.toFixed(3)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scenario Analysis */}
                <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 to-blue-600/5 rounded-2xl"></div>
                  <div className="relative">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                      <BarChart3 className="w-5 h-5 text-cyan-400" />
                      {t('scenarioAnalysis')}
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-600/30">
                            <th className="text-left py-2 text-gray-400">{t('stockPrice')}</th>
                            <th className="text-right py-2 text-gray-400">{t('stockValue')}</th>
                            <th className="text-right py-2 text-gray-400">{t('putValue')}</th>
                            <th className="text-right py-2 text-gray-400">{t('totalValue')}</th>
                            <th className="text-right py-2 text-gray-400">{t('pnl')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calculationResults.scenarios.map((scenario, index) => (
                            <tr key={index} className="border-b border-gray-700/20 hover:bg-gray-700/10">
                              <td className="py-2 text-gray-300">
                                {formatCurrency(scenario.stockPrice)}
                              </td>
                              <td className="text-right py-2 text-gray-300">
                                {formatCurrency(scenario.stockValue)}
                              </td>
                              <td className="text-right py-2 text-green-400">
                                {formatCurrency(scenario.putValue)}
                              </td>
                              <td className="text-right py-2 text-blue-400">
                                {formatCurrency(scenario.totalValue)}
                              </td>
                              <td className={`text-right py-2 ${scenario.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {scenario.pnl >= 0 ? '+' : ''}{formatCurrency(scenario.pnl)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                <div className="text-center">
                  <Calculator className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">{t('readyToCalculate')}</h3>
                  <p className="text-gray-500">{t('enterParameters')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectivePutCalculator;