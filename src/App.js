import React, { useState, useEffect } from 'react';
import { Calculator, TrendingDown, Shield, AlertTriangle, DollarSign, BarChart3, Loader, RefreshCw } from 'lucide-react';
import './App.css';

const ProtectivePutCalculator = () => {
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
  const [stockData, setStockData] = useState({
    price: 150.00,
    symbol: 'AAPL',
    marketCap: 2400000000000,
    estimatedVolatility: 0.25
  });
  const [calculationResults, setCalculationResults] = useState(null);

  // Simulated stock data - in production this would fetch from yfinance or other APIs
  const mockStockData = {
    'AAPL': { price: 150.00, marketCap: 2400000000000, vol: 0.25 },
    'NVDA': { price: 120.00, marketCap: 3000000000000, vol: 0.35 },
    'TSLA': { price: 200.00, marketCap: 800000000000, vol: 0.45 },
    'MSFT': { price: 350.00, marketCap: 2600000000000, vol: 0.22 },
    'GOOGL': { price: 140.00, marketCap: 1800000000000, vol: 0.28 },
    'AMZN': { price: 170.00, marketCap: 1700000000000, vol: 0.30 },
    'META': { price: 280.00, marketCap: 700000000000, vol: 0.32 },
    'SPY': { price: 450.00, marketCap: 500000000000, vol: 0.18 },
    'QQQ': { price: 380.00, marketCap: 200000000000, vol: 0.22 },
    'IWM': { price: 180.00, marketCap: 50000000000, vol: 0.28 }
  };

  // Fetch stock data simulation
  const fetchStockData = async (symbol) => {
    if (!symbol || symbol.length < 1) return;
    
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const upperSymbol = symbol.toUpperCase();
      const data = mockStockData[upperSymbol] || { 
        price: 100.00 + Math.random() * 200, 
        marketCap: 100000000000 + Math.random() * 1000000000000,
        vol: 0.15 + Math.random() * 0.4 
      };
      
      const stockInfo = {
        price: data.price,
        symbol: upperSymbol,
        marketCap: data.marketCap,
        estimatedVolatility: data.vol
      };
      
      setStockData(stockInfo);
      setInputs(prev => ({
        ...prev,
        currentStockPrice: data.price,
        impliedVolatility: data.vol
      }));
      setLastFetched(new Date());
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when symbol changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputs.stockSymbol && inputs.stockSymbol.length >= 1) {
        fetchStockData(inputs.stockSymbol);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [inputs.stockSymbol]);

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
    
    const Nd1 = normalCDF(d1);
    const Nd2 = normalCDF(d2);
    const Nmd1 = normalCDF(-d1);
    const Nmd2 = normalCDF(-d2);
    
    // Put option price
    const putPrice = K * Math.exp(-r * T) * Nmd2 - S * Nmd1;
    
    // Greeks
    const delta = Nmd1 - 1;
    const theta = (-S * (1/Math.sqrt(2*Math.PI)) * Math.exp(-0.5 * d1 * d1) * sigma / (2 * Math.sqrt(T)) 
                   - r * K * Math.exp(-r * T) * Nmd2) / 365;
    const vega = S * Math.sqrt(T) * (1/Math.sqrt(2*Math.PI)) * Math.exp(-0.5 * d1 * d1) / 100;
    const gamma = (1/Math.sqrt(2*Math.PI)) * Math.exp(-0.5 * d1 * d1) / (S * sigma * Math.sqrt(T));
    
    // Strategy calculations
    const strikePrice = K;
    const portfolioValue = currentStockPrice * numberOfShares;
    const totalPremiumCost = putPrice * numberOfShares;
    const costPercentage = (totalPremiumCost / portfolioValue) * 100;
    const annualizedCost = (costPercentage * 365) / timeHorizon;
    const maxLoss = (currentStockPrice - strikePrice + putPrice) * numberOfShares;
    const breakevenPrice = currentStockPrice + putPrice;
    const protectedValue = Math.max(strikePrice * numberOfShares - totalPremiumCost, 0);
    
    // Scenario analysis
    const scenarios = [];
    const priceRange = currentStockPrice * 0.4;
    const step = priceRange / 10;
    
    for (let i = 0; i <= 10; i++) {
      const stockPrice = currentStockPrice - priceRange/2 + i * step;
      const stockValue = stockPrice * numberOfShares;
      const putValue = Math.max(strikePrice - stockPrice, 0) * numberOfShares;
      const totalValue = stockValue + putValue - totalPremiumCost;
      const pnl = totalValue - (currentStockPrice * numberOfShares - totalPremiumCost);
      
      scenarios.push({
        stockPrice,
        stockValue,
        putValue,
        totalValue,
        pnl,
        pnlPercent: (pnl / (currentStockPrice * numberOfShares)) * 100
      });
    }
    
    // Warnings
    const warnings = [];
    if (annualizedCost > 5) {
      warnings.push({
        type: 'warning',
        message: `High protection cost: ${annualizedCost.toFixed(2)}% annually exceeds 5% threshold`
      });
    }
    if (timeHorizon < 30) {
      warnings.push({
        type: 'warning', 
        message: 'Short time horizon may result in high time decay (theta)'
      });
    }
    if (protectionLevel > 0.98) {
      warnings.push({
        type: 'info',
        message: 'Very high protection level increases premium costs significantly'
      });
    }
    if (Math.abs(delta) < 0.3) {
      warnings.push({
        type: 'info',
        message: 'Low delta indicates put may provide limited protection'
      });
    }
    
    return {
      putPrice,
      delta,
      theta,
      vega,
      gamma,
      strikePrice,
      portfolioValue,
      totalPremiumCost,
      costPercentage,
      annualizedCost,
      maxLoss,
      breakevenPrice,
      protectedValue,
      scenarios,
      warnings
    };
  };

  const handleCalculate = () => {
    const results = calculateProtectivePut();
    setCalculationResults(results);
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = () => {
    if (inputs.stockSymbol) {
      fetchStockData(inputs.stockSymbol);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Protective Put Calculator</h1>
                <p className="text-gray-400 mt-1">Advanced Portfolio Insurance & Risk Management</p>
              </div>
            </div>
            {lastFetched && (
              <div className="text-right">
                <div className="text-sm text-gray-400">Last Updated</div>
                <div className="text-sm text-gray-300">{lastFetched.toLocaleTimeString()}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                <Calculator className="w-5 h-5 text-blue-400" />
                Strategy Parameters
              </h2>
              
              <div className="space-y-6">
                {/* Stock Symbol */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stock Symbol</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputs.stockSymbol}
                      onChange={(e) => handleInputChange('stockSymbol', e.target.value.toUpperCase())}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., AAPL"
                    />
                    <button
                      onClick={handleRefresh}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-lg transition-colors"
                    >
                      {loading ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    </button>
                  </div>
                  {stockData && (
                    <div className="mt-2 text-sm text-gray-400">
                      Current: <span className="text-green-400 font-semibold">${stockData.price?.toFixed(2)}</span>
                      {stockData.marketCap && (
                        <span className="ml-3">Cap: ${(stockData.marketCap / 1e9).toFixed(1)}B</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Current Stock Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Stock Price ($)</label>
                  <input
                    type="number"
                    value={inputs.currentStockPrice}
                    onChange={(e) => handleInputChange('currentStockPrice', parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    step="0.01"
                    disabled={loading}
                  />
                </div>

                {/* Number of Shares */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Number of Shares</label>
                  <input
                    type="number"
                    value={inputs.numberOfShares}
                    onChange={(e) => handleInputChange('numberOfShares', parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Protection Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Protection Level: {(inputs.protectionLevel * 100).toFixed(0)}%
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0.80"
                      max="0.99"
                      step="0.01"
                      value={inputs.protectionLevel}
                      onChange={(e) => handleInputChange('protectionLevel', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>80%</span>
                      <span>99%</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Strike: ${(inputs.currentStockPrice * inputs.protectionLevel).toFixed(2)}
                  </div>
                </div>

                {/* Time Horizon */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time Horizon</label>
                  <select
                    value={inputs.timeHorizon}
                    onChange={(e) => handleInputChange('timeHorizon', parseInt(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={30}>30 Days</option>
                    <option value={60}>60 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={180}>180 Days</option>
                    <option value={365}>365 Days</option>
                  </select>
                </div>

                {/* Risk-Free Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Risk-Free Rate: {(inputs.riskFreeRate * 100).toFixed(1)}%
                  </label>
                  <input
                    type="number"
                    value={inputs.riskFreeRate}
                    onChange={(e) => handleInputChange('riskFreeRate', parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    step="0.001"
                    min="0"
                    max="0.1"
                  />
                </div>

                {/* Implied Volatility */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Implied Volatility: {(inputs.impliedVolatility * 100).toFixed(0)}%
                  </label>
                  <input
                    type="number"
                    value={inputs.impliedVolatility}
                    onChange={(e) => handleInputChange('impliedVolatility', parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    step="0.01"
                    min="0.05"
                    max="1.0"
                  />
                  {stockData?.estimatedVolatility && (
                    <div className="text-sm text-gray-400 mt-1">
                      Estimated from data: {(stockData.estimatedVolatility * 100).toFixed(0)}%
                    </div>
                  )}
                </div>

                {/* Calculate Button */}
                <button
                  onClick={handleCalculate}
                  disabled={!inputs.currentStockPrice || inputs.currentStockPrice <= 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Calculator className="w-5 h-5" />
                  Calculate Protection Strategy
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {calculationResults ? (
              <div className="space-y-6">
                {/* Warnings */}
                {calculationResults.warnings.length > 0 && (
                  <div className="space-y-2">
                    {calculationResults.warnings.map((warning, index) => (
                      <div key={index} className={`p-4 rounded-lg border flex items-center gap-3 ${
                        warning.type === 'warning' 
                          ? 'bg-yellow-900/20 border-yellow-600 text-yellow-400' 
                          : 'bg-blue-900/20 border-blue-600 text-blue-400'
                      }`}>
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <span>{warning.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-green-900 to-green-800 p-4 rounded-lg border border-green-700">
                    <div className="text-sm text-green-300 font-medium">Strike Price</div>
                    <div className="text-2xl font-bold text-white">${calculationResults.strikePrice.toFixed(2)}</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 rounded-lg border border-blue-700">
                    <div className="text-sm text-blue-300 font-medium">Put Premium</div>
                    <div className="text-2xl font-bold text-white">${calculationResults.putPrice.toFixed(2)}</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-900 to-purple-800 p-4 rounded-lg border border-purple-700">
                    <div className="text-sm text-purple-300 font-medium">Total Cost</div>
                    <div className="text-2xl font-bold text-white">${calculationResults.totalPremiumCost.toFixed(0)}</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-900 to-orange-800 p-4 rounded-lg border border-orange-700">
                    <div className="text-sm text-orange-300 font-medium">Protection Cost</div>
                    <div className="text-2xl font-bold text-white">{calculationResults.costPercentage.toFixed(2)}%</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-900 to-red-800 p-4 rounded-lg border border-red-700">
                    <div className="text-sm text-red-300 font-medium">Annualized Cost</div>
                    <div className="text-2xl font-bold text-white">{calculationResults.annualizedCost.toFixed(2)}%</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 p-4 rounded-lg border border-indigo-700">
                    <div className="text-sm text-indigo-300 font-medium">Breakeven</div>
                    <div className="text-2xl font-bold text-white">${calculationResults.breakevenPrice.toFixed(2)}</div>
                  </div>
                </div>

                {/* Protection Analysis */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Protection Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Portfolio Value</div>
                      <div className="text-xl font-semibold text-white">${calculationResults.portfolioValue.toFixed(0)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Maximum Loss</div>
                      <div className="text-xl font-semibold text-red-400">${calculationResults.maxLoss.toFixed(0)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Protected Value</div>
                      <div className="text-xl font-semibold text-green-400">${calculationResults.protectedValue.toFixed(0)}</div>
                    </div>
                  </div>
                </div>

                {/* Greeks */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="font-semibold mb-4 text-white">Option Greeks</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Delta</div>
                      <div className="text-lg font-semibold text-white">{calculationResults.delta.toFixed(3)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Theta (daily)</div>
                      <div className="text-lg font-semibold text-white">${calculationResults.theta.toFixed(3)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Vega (1% vol)</div>
                      <div className="text-lg font-semibold text-white">${calculationResults.vega.toFixed(3)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Gamma</div>
                      <div className="text-lg font-semibold text-white">{calculationResults.gamma.toFixed(4)}</div>
                    </div>
                  </div>
                </div>

                {/* Scenario Analysis */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Scenario Analysis
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left p-3 font-semibold text-gray-300">Stock Price</th>
                          <th className="text-right p-3 font-semibold text-gray-300">Stock Value</th>
                          <th className="text-right p-3 font-semibold text-gray-300">Put Value</th>
                          <th className="text-right p-3 font-semibold text-gray-300">Total Value</th>
                          <th className="text-right p-3 font-semibold text-gray-300">P&L</th>
                          <th className="text-right p-3 font-semibold text-gray-300">P&L %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculationResults.scenarios.map((scenario, index) => (
                          <tr key={index} className={`border-b border-gray-700 hover:bg-gray-700/30 ${
                            Math.abs(scenario.stockPrice - inputs.currentStockPrice) < 0.01 ? 'bg-blue-900/20' : ''
                          }`}>
                            <td className="p-3 text-white">${scenario.stockPrice.toFixed(2)}</td>
                            <td className="p-3 text-right text-gray-300">${scenario.stockValue.toFixed(0)}</td>
                            <td className="p-3 text-right text-gray-300">${scenario.putValue.toFixed(0)}</td>
                            <td className="p-3 text-right text-white font-medium">${scenario.totalValue.toFixed(0)}</td>
                            <td className={`p-3 text-right font-medium ${scenario.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${scenario.pnl.toFixed(0)}
                            </td>
                            <td className={`p-3 text-right font-medium ${scenario.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {scenario.pnlPercent.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-700 rounded-lg p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
                    <DollarSign className="w-5 h-5 text-indigo-400" />
                    Strategy Recommendations
                  </h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    {calculationResults.annualizedCost <= 5 && (
                      <p className="text-green-400">✓ Cost-effective protection: Annualized cost is within acceptable range</p>
                    )}
                    {Math.abs(calculationResults.delta) >= 0.3 && (
                      <p className="text-green-400">✓ Adequate protection level: Put delta provides meaningful downside protection</p>
                    )}
                    {inputs.timeHorizon >= 90 && (
                      <p className="text-green-400">✓ Reasonable time horizon: Sufficient time reduces daily theta decay impact</p>
                    )}
                    <p>• Monitor time decay (theta) as expiration approaches</p>
                    <p>• Consider rolling position if stock approaches strike price</p>
                    <p>• Evaluate cost vs. benefit relative to alternative hedging strategies</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
                <Calculator className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Ready to Calculate</h3>
                <p className="text-gray-500">Enter your stock symbol and parameters, then click "Calculate Protection Strategy" to analyze your protective put options.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectivePutCalculator;