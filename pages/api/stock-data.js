// Stock Data API Route - Server-side API integration for Next.js
// Multiple providers with fallback mechanism for reliable data fetching

// Configuration for different stock data providers
const API_PROVIDERS = {
  FINANCIAL_MODELING_PREP: 'financial_modeling_prep',
  ALPHA_VANTAGE: 'alpha_vantage',
  TWELVE_DATA: 'twelve_data',
  POLYGON: 'polygon',
  SIMULATION: 'simulation'
};

// Primary provider (Free APIs with generous limits)
const CURRENT_PROVIDER = API_PROVIDERS.FINANCIAL_MODELING_PREP;

// API configurations - Using server-side environment variables
const API_CONFIG = {
  [API_PROVIDERS.FINANCIAL_MODELING_PREP]: {
    baseUrl: 'https://financialmodelingprep.com/api/v3',
    key: process.env.FMP_API_KEY || 'demo', // demo key works for limited requests
    rateLimit: 250
  },
  [API_PROVIDERS.ALPHA_VANTAGE]: {
    baseUrl: 'https://www.alphavantage.co/query',
    key: process.env.ALPHA_VANTAGE_KEY || '',
    rateLimit: 25
  },
  [API_PROVIDERS.TWELVE_DATA]: {
    baseUrl: 'https://api.twelvedata.com',
    key: process.env.TWELVE_DATA_KEY || '',
    rateLimit: 800
  }
};

// Cache to avoid excessive API calls (in-memory for simplicity)
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute cache

// Market hours helper
const isMarketOpen = () => {
  const now = new Date();
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  const est = new Date(utc.getTime() + (-5 * 3600000)); // EST timezone

  const day = est.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = est.getHours();
  const minute = est.getMinutes();
  const time = hour * 100 + minute;

  // Market closed on weekends
  if (day === 0 || day === 6) return false;

  // Market hours: 9:30 AM to 4:00 PM EST
  return time >= 930 && time < 1600;
};

// Financial Modeling Prep API
const fetchFromFinancialModelingPrep = async (symbol) => {
  const config = API_CONFIG[API_PROVIDERS.FINANCIAL_MODELING_PREP];
  const apiKey = config.key;
  const quoteUrl = `${config.baseUrl}/quote/${symbol}?apikey=${apiKey}`;

  console.log(`🔄 Fetching live data for ${symbol} from Financial Modeling Prep...`);

  const response = await fetch(quoteUrl);

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error(`No data found for symbol ${symbol}`);
  }

  const quote = data[0];

  // Calculate estimated volatility from price range
  const high52 = quote.yearHigh || quote.previousClose * 1.2;
  const low52 = quote.yearLow || quote.previousClose * 0.8;
  const estimatedVolatility = Math.max(0.1, Math.min(2.0, (high52 - low52) / quote.previousClose));

  return {
    symbol: quote.symbol,
    name: quote.name || `${symbol} Corporation`,
    price: quote.price || quote.previousClose,
    change: quote.change || 0,
    changePercent: quote.changesPercentage || 0,
    volume: quote.volume || 0,
    marketCap: quote.marketCap || null,
    estimatedVolatility,
    sector: quote.sector || 'Unknown',
    lastUpdated: new Date().toISOString(),
    marketSession: isMarketOpen() ? 'open' : 'closed',
    high52Week: high52,
    low52Week: low52,
    avgVolume: quote.avgVolume || quote.volume,
    peRatio: quote.pe || null,
    dividendYield: quote.dividendYield || 0,
    provider: 'Financial Modeling Prep',
    isLive: true
  };
};

// Alpha Vantage API
const fetchFromAlphaVantage = async (symbol) => {
  const config = API_CONFIG[API_PROVIDERS.ALPHA_VANTAGE];
  const apiKey = config.key;

  if (!apiKey) {
    throw new Error('Alpha Vantage API key not configured');
  }

  const url = `${config.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

  console.log(`🔄 Fetching live data for ${symbol} from Alpha Vantage...`);

  const response = await fetch(url);
  const data = await response.json();

  if (data['Error Message']) {
    throw new Error(data['Error Message']);
  }

  if (data['Note']) {
    throw new Error('API rate limit exceeded');
  }

  const quote = data['Global Quote'];
  if (!quote) {
    throw new Error(`No data found for symbol ${symbol}`);
  }

  const price = parseFloat(quote['05. price']);
  const change = parseFloat(quote['09. change']);
  const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
  const high = parseFloat(quote['03. high']);
  const low = parseFloat(quote['04. low']);

  return {
    symbol: quote['01. symbol'],
    name: `${symbol} Corporation`,
    price: price,
    change: change,
    changePercent: changePercent,
    volume: parseInt(quote['06. volume']),
    marketCap: null,
    estimatedVolatility: Math.max(0.1, Math.min(2.0, (high - low) / price)),
    sector: 'Unknown',
    lastUpdated: quote['07. latest trading day'],
    marketSession: isMarketOpen() ? 'open' : 'closed',
    high52Week: high,
    low52Week: low,
    avgVolume: parseInt(quote['06. volume']),
    peRatio: null,
    dividendYield: 0,
    provider: 'Alpha Vantage',
    isLive: true
  };
};

// Twelve Data API
const fetchFromTwelveData = async (symbol) => {
  const config = API_CONFIG[API_PROVIDERS.TWELVE_DATA];
  const apiKey = config.key;

  if (!apiKey) {
    throw new Error('Twelve Data API key not configured');
  }

  const url = `${config.baseUrl}/quote?symbol=${symbol}&apikey=${apiKey}`;

  console.log(`🔄 Fetching live data for ${symbol} from Twelve Data...`);

  const response = await fetch(url);
  const data = await response.json();

  if (data.code === 429) {
    throw new Error('API rate limit exceeded');
  }

  if (data.code && data.code !== 200) {
    throw new Error(data.message || `API error: ${data.code}`);
  }

  if (!data.symbol) {
    throw new Error(`No data found for symbol ${symbol}`);
  }

  const price = parseFloat(data.close);
  const change = parseFloat(data.change);
  const changePercent = parseFloat(data.percent_change);

  return {
    symbol: data.symbol,
    name: data.name || `${symbol} Corporation`,
    price: price,
    change: change,
    changePercent: changePercent,
    volume: parseInt(data.volume) || 0,
    marketCap: null,
    estimatedVolatility: Math.max(0.1, Math.min(2.0, Math.abs(changePercent) / 100)),
    sector: 'Unknown',
    lastUpdated: data.datetime,
    marketSession: isMarketOpen() ? 'open' : 'closed',
    high52Week: parseFloat(data.fifty_two_week_high) || price * 1.2,
    low52Week: parseFloat(data.fifty_two_week_low) || price * 0.8,
    avgVolume: parseInt(data.volume) || 0,
    peRatio: null,
    dividendYield: 0,
    provider: 'Twelve Data',
    isLive: true
  };
};

// Main stock data fetching function
const fetchStockData = async (symbol) => {
  if (!symbol || symbol.length < 1) {
    throw new Error('Symbol is required');
  }

  const upperSymbol = symbol.toUpperCase();
  const cacheKey = `${CURRENT_PROVIDER}_${upperSymbol}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`📋 Using cached data for ${symbol}`);
    return cached.data;
  }

  try {
    let data;

    // Try primary provider first
    switch (CURRENT_PROVIDER) {
      case API_PROVIDERS.FINANCIAL_MODELING_PREP:
        data = await fetchFromFinancialModelingPrep(upperSymbol);
        break;
      case API_PROVIDERS.ALPHA_VANTAGE:
        data = await fetchFromAlphaVantage(upperSymbol);
        break;
      case API_PROVIDERS.TWELVE_DATA:
        data = await fetchFromTwelveData(upperSymbol);
        break;
      default:
        throw new Error('No valid API provider configured');
    }

    // Cache the successful result
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    console.log(`✅ Successfully fetched live data for ${symbol}: $${data.price.toFixed(2)} (${data.provider})`);
    return data;

  } catch (error) {
    console.warn(`Primary API (${CURRENT_PROVIDER}) failed:`, error.message);

    // Try fallback providers
    const fallbackProviders = Object.values(API_PROVIDERS).filter(
      provider => provider !== CURRENT_PROVIDER && provider !== API_PROVIDERS.SIMULATION
    );

    for (const provider of fallbackProviders) {
      try {
        let fallbackData;
        switch (provider) {
          case API_PROVIDERS.FINANCIAL_MODELING_PREP:
            fallbackData = await fetchFromFinancialModelingPrep(upperSymbol);
            break;
          case API_PROVIDERS.ALPHA_VANTAGE:
            fallbackData = await fetchFromAlphaVantage(upperSymbol);
            break;
          case API_PROVIDERS.TWELVE_DATA:
            fallbackData = await fetchFromTwelveData(upperSymbol);
            break;
        }

        if (fallbackData) {
          console.log(`✅ Fallback API (${provider}) succeeded`);
          cache.set(cacheKey, {
            data: fallbackData,
            timestamp: Date.now()
          });
          return fallbackData;
        }
      } catch (fallbackError) {
        console.warn(`Fallback API (${provider}) failed:`, fallbackError.message);
      }
    }

    // If all APIs fail, return fallback data
    throw new Error(`All API providers failed for symbol ${upperSymbol}. Please check API configuration.`);
  }
};

// Next.js API route handler
export default async function handler(req, res) {
  // Debug logging for environment variables
  console.log('🔍 Environment Debug:');
  console.log('FMP_API_KEY:', process.env.FMP_API_KEY ? 'SET' : 'MISSING');
  console.log('ALPHA_VANTAGE_KEY:', process.env.ALPHA_VANTAGE_KEY ? 'SET' : 'MISSING');
  console.log('TWELVE_DATA_KEY:', process.env.TWELVE_DATA_KEY ? 'SET' : 'MISSING');

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  try {
    console.log(`🚀 API route called for symbol: ${symbol}`);
    const data = await fetchStockData(symbol);
    res.status(200).json(data);
  } catch (error) {
    console.error(`❌ API route error for ${symbol}:`, error.message);

    // Return fallback data instead of hard error
    const fallbackData = {
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Corporation`,
      price: 100,
      change: 0,
      changePercent: 0,
      volume: 1000000,
      marketCap: null,
      estimatedVolatility: 0.25,
      sector: 'Unknown',
      lastUpdated: new Date().toISOString(),
      marketSession: isMarketOpen() ? 'open' : 'closed',
      high52Week: 120,
      low52Week: 80,
      avgVolume: 1000000,
      peRatio: null,
      dividendYield: 0,
      provider: 'Fallback',
      isLive: false,
      error: error.message
    };

    res.status(200).json(fallbackData);
  }
}