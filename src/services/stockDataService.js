// Stock Data Service - Live API Integration
// Multiple providers with fallback mechanism for reliable data fetching

// Configuration for different stock data providers
const API_PROVIDERS = {
  FINANCIAL_MODELING_PREP: 'financial_modeling_prep', // Free tier available
  ALPHA_VANTAGE: 'alpha_vantage', // Free tier available
  TWELVE_DATA: 'twelve_data', // Free tier available
  POLYGON: 'polygon',
  SIMULATION: 'simulation' // Fallback only
};

// Primary provider (Free APIs with generous limits)
const CURRENT_PROVIDER = API_PROVIDERS.FINANCIAL_MODELING_PREP;

// API configurations - Add your API keys to environment variables
const API_CONFIG = {
  [API_PROVIDERS.FINANCIAL_MODELING_PREP]: {
    baseUrl: 'https://financialmodelingprep.com/api/v3',
    key: process.env.REACT_APP_FMP_API_KEY || 'demo', // demo key works for limited requests
    rateLimit: 250 // requests per day for free tier
  },
  [API_PROVIDERS.ALPHA_VANTAGE]: {
    baseUrl: 'https://www.alphavantage.co/query',
    key: process.env.REACT_APP_ALPHA_VANTAGE_KEY || '',
    rateLimit: 25 // requests per day for free tier
  },
  [API_PROVIDERS.TWELVE_DATA]: {
    baseUrl: 'https://api.twelvedata.com',
    key: process.env.REACT_APP_TWELVE_DATA_KEY || '',
    rateLimit: 800 // requests per day for free tier
  }
};

// Cache to avoid excessive API calls
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute cache

// Main stock data fetching function
export const fetchStockData = async (symbol) => {
  if (!symbol || symbol.length < 1) {
    throw new Error('Symbol is required');
  }

  const upperSymbol = symbol.toUpperCase();
  const cacheKey = `${CURRENT_PROVIDER}_${upperSymbol}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
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
          console.log(`Fallback API (${provider}) succeeded`);
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

    // If all APIs fail, throw error
    throw new Error(`All API providers failed for symbol ${upperSymbol}. Please check your API keys or try again later.`);
  }
};

// Financial Modeling Prep API (Free tier: 250 requests/day)
const fetchFromFinancialModelingPrep = async (symbol) => {
  const config = API_CONFIG[API_PROVIDERS.FINANCIAL_MODELING_PREP];
  const apiKey = config.key;

  // Real-time quote endpoint
  const quoteUrl = `${config.baseUrl}/quote/${symbol}?apikey=${apiKey}`;

  try {
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

    const result = {
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

    console.log(`✅ Successfully fetched live data for ${symbol}:`, result);
    return result;

  } catch (error) {
    console.error(`❌ Financial Modeling Prep API error for ${symbol}:`, error);
    throw error;
  }
};

// Alpha Vantage API (Free tier: 25 requests/day)
const fetchFromAlphaVantage = async (symbol) => {
  const config = API_CONFIG[API_PROVIDERS.ALPHA_VANTAGE];
  const apiKey = config.key;

  if (!apiKey) {
    throw new Error('Alpha Vantage API key not configured');
  }

  const url = `${config.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

  try {
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
      throw new Error('No quote data available');
    }

    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

    const result = {
      symbol: quote['01. symbol'],
      name: `${symbol} Corporation`,
      price,
      change,
      changePercent,
      volume: parseInt(quote['06. volume']) || 0,
      marketCap: null,
      estimatedVolatility: 0.25, // Default value, would need additional API call for accurate volatility
      sector: 'Unknown',
      lastUpdated: new Date().toISOString(),
      marketSession: isMarketOpen() ? 'open' : 'closed',
      high52Week: parseFloat(quote['03. high']),
      low52Week: parseFloat(quote['04. low']),
      avgVolume: parseInt(quote['06. volume']) || 0,
      peRatio: null,
      dividendYield: 0,
      provider: 'Alpha Vantage',
      isLive: true
    };

    console.log(`✅ Successfully fetched live data for ${symbol}:`, result);
    return result;

  } catch (error) {
    console.error(`❌ Alpha Vantage API error for ${symbol}:`, error);
    throw error;
  }
};

// Twelve Data API (Free tier: 800 requests/day)
const fetchFromTwelveData = async (symbol) => {
  const config = API_CONFIG[API_PROVIDERS.TWELVE_DATA];
  const apiKey = config.key;

  if (!apiKey) {
    throw new Error('Twelve Data API key not configured');
  }

  const url = `${config.baseUrl}/quote?symbol=${symbol}&apikey=${apiKey}`;

  try {
    console.log(`🔄 Fetching live data for ${symbol} from Twelve Data...`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(data.message);
    }

    const price = parseFloat(data.close);
    const change = parseFloat(data.change);
    const changePercent = parseFloat(data.percent_change);

    const result = {
      symbol: data.symbol,
      name: data.name || `${symbol} Corporation`,
      price,
      change,
      changePercent,
      volume: parseInt(data.volume) || 0,
      marketCap: null,
      estimatedVolatility: 0.25, // Default value
      sector: 'Unknown',
      lastUpdated: new Date().toISOString(),
      marketSession: isMarketOpen() ? 'open' : 'closed',
      high52Week: parseFloat(data.fifty_two_week.high) || price * 1.2,
      low52Week: parseFloat(data.fifty_two_week.low) || price * 0.8,
      avgVolume: parseInt(data.volume) || 0,
      peRatio: null,
      dividendYield: 0,
      provider: 'Twelve Data',
      isLive: true
    };

    console.log(`✅ Successfully fetched live data for ${symbol}:`, result);
    return result;

  } catch (error) {
    console.error(`❌ Twelve Data API error for ${symbol}:`, error);
    throw error;
  }
};

// Market status helper
const isMarketOpen = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 100 + minute; // HHMM format

  // Weekend check
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // Market hours: 9:30 AM - 4:00 PM EST (approximate)
  return currentTime >= 930 && currentTime <= 1600;
};

// Market status functions
export const getMarketStatus = () => {
  return {
    isOpen: isMarketOpen(),
    nextOpen: getNextMarketOpen(),
    nextClose: getNextMarketClose(),
    lastUpdate: new Date()
  };
};

const getNextMarketOpen = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 30, 0, 0);
  return tomorrow;
};

const getNextMarketClose = () => {
  const now = new Date();
  const today = new Date(now);
  today.setHours(16, 0, 0, 0);

  if (now > today) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  return today;
};

// Batch fetching for multiple symbols
export const fetchMultipleStocks = async (symbols) => {
  if (!Array.isArray(symbols)) {
    throw new Error('Symbols must be an array');
  }

  const promises = symbols.map(symbol =>
    fetchStockData(symbol).catch(error => ({ error: error.message }))
  );

  const results = await Promise.all(promises);

  return results.map((result, index) => ({
    symbol: symbols[index],
    success: !result.error,
    data: result.error ? null : result,
    error: result.error || null
  }));
};

// Options data fetching (placeholder for future implementation)
export const fetchOptionsData = async (symbol, expiration) => {
  // This would integrate with real options data APIs
  // Most free APIs don't include options data, this would require paid services
  throw new Error('Options data requires premium API subscription');
};

export default {
  fetchStockData,
  fetchMultipleStocks,
  fetchOptionsData,
  getMarketStatus,
  API_PROVIDERS,
  CURRENT_PROVIDER
};