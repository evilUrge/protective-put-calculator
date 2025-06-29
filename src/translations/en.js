export const en = {
  // Header
  appTitle: "Protective Put Calculator",
  appSubtitle: "Advanced Portfolio Insurance & Risk Management",
  title: "Protective Put Calculator",
  subtitle: "Advanced Portfolio Insurance & Risk Management",
  lastUpdated: "Last Updated",

  // Navigation
  language: "Language",
  currency: "Currency",

  // Input Panel
  strategyParameters: "Strategy Parameters",
  stockSymbol: "Stock Symbol",
  stockSymbolPlaceholder: "e.g., AAPL",
  currentStockPrice: "Current Stock Price",
  numberOfShares: "Number of Shares",
  protectionLevel: "Protection Level",
  timeHorizon: "Time Horizon",
  riskFreeRate: "Risk-Free Rate",
  impliedVolatility: "Implied Volatility",
  calculate: "Calculate Protection Strategy",
  calculateStrategy: "Calculate Protection Strategy",

  // Results section
  strategyOverview: "Strategy Overview",
  putPremium: "Put Premium",
  perContract: "per contract",
  totalCost: "Total Cost",
  ofPortfolio: "of portfolio",
  annualizedCost: "Annualized Cost",
  perYear: "per year",
  maxLoss: "Max Loss",
  worstCase: "worst case",
  breakeven: "Breakeven",
  minimum: "minimum",
  protectedValue: "Protected Value",
  warnings: "Warnings",

  // Time horizons
  days30: "30 Days",
  days60: "60 Days",
  days90: "90 Days",
  days180: "180 Days",
  days365: "365 Days",

  // Results
  strikePrice: "Strike Price",
  protectionCost: "Protection Cost",
  protectionAnalysis: "Protection Analysis",
  portfolioValue: "Portfolio Value",
  maximumLoss: "Maximum Loss",

  // Greeks
  optionGreeks: "Option Greeks",
  delta: "Delta",
  theta: "Theta (daily)",
  vega: "Vega (1% vol)",
  gamma: "Gamma",

  // Scenario Analysis
  scenarioAnalysis: "Scenario Analysis",
  stockPrice: "Stock Price",
  stockValue: "Stock Value",
  putValue: "Put Value",
  totalValue: "Total Value",
  pnl: "P&L",
  pnlPercent: "P&L %",

  // Recommendations
  strategyRecommendations: "Strategy Recommendations",
  costEffectiveProtection: "✓ Cost-effective protection: Annualized cost is within acceptable range",
  adequateProtection: "✓ Adequate protection level: Put delta provides meaningful downside protection",
  reasonableTimeHorizon: "✓ Reasonable time horizon: Sufficient time reduces daily theta decay impact",
  monitorTimeDecay: "• Monitor time decay (theta) as expiration approaches",
  considerRolling: "• Consider rolling position if stock approaches strike price",
  evaluateCostBenefit: "• Evaluate cost vs. benefit relative to alternative hedging strategies",

  // Warnings
  highCostWarning: "High protection cost: {cost}% annually exceeds 5% threshold",
  shortTimeWarning: "Short time horizon may result in high time decay (theta)",
  highVolatilityWarning: "High volatility increases option premium costs",
  timeDecayWarning: "Short time horizon may result in high time decay (theta)",
  expensiveProtectionWarning: "Very high protection level increases premium costs significantly",
  lowDeltaWarning: "Low delta indicates put may provide limited protection",

  // Placeholder
  readyToCalculate: "Ready to Calculate",
  enterParameters: "Enter your stock symbol and parameters, then click \"Calculate Protection Strategy\" to analyze your protective put options.",

  // Data info
  current: "Current",
  cap: "Cap",
  estimatedFromData: "Estimated from data",
  strike: "Strike"
};