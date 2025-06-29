# 🛡️ Protective Put Calculator v2.0

**Professional Portfolio Insurance & Risk Management Tool**

A comprehensive, production-ready Next.js application for analyzing protective put strategies with live stock data, server-side security, multi-language support, and advanced Black-Scholes options pricing.

![Protective Put Calculator](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel) ![Next.js](https://img.shields.io/badge/Built%20with-Next.js%2014-000000?logo=next.js) ![Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind-38B2AC?logo=tailwind-css) ![TypeScript](https://img.shields.io/badge/Live%20Data-API%20Integration-blue)

## 🚀 **Live Demo**

**[Try the Calculator →](https://protective-put-calculator.vercel.app)**

## ✨ **Features**

### 🌐 **Version 2.0 - NEW FEATURES**
- **🔒 Server-Side Security**: API keys protected with Next.js API routes
- **📈 Live Stock Data**: Real-time market data from multiple providers (Financial Modeling Prep, Alpha Vantage, Twelve Data)
- **🌍 Multi-Language Support**: English, Hebrew (RTL), and Dutch
- **💱 Multi-Currency Support**: 10 major currencies (USD, EUR, GBP, JPY, CHF, CAD, AUD, ILS, CNY, INR)
- **⚡ Enhanced Performance**: Server-side rendering and optimized API caching
- **🎨 Futuristic UI**: Professional dark theme with glass morphism effects

### 📊 **Advanced Financial Calculations**
- **Black-Scholes Options Pricing**: Complete implementation for accurate put option valuation
- **Greeks Analysis**: Delta, Theta, Vega, and Gamma calculations for risk assessment
- **Scenario Analysis**: Comprehensive P&L analysis across different stock price movements
- **Live Market Data**: Real company information, market cap, and volatility estimation
- **Currency Conversion**: Real-time exchange rates for global users

### 🎯 **Strategy Analysis**
- **Strike Price Optimization**: Automatic calculation based on protection level
- **Breakeven Analysis**: Determine stock price needed to offset premium costs
- **Maximum Loss Calculation**: Clear understanding of worst-case scenarios
- **Portfolio Protection Metrics**: Protected value and downside risk quantification
- **Intelligent Warnings**: Smart alerts for high costs and market conditions

### 🔥 **User Experience**
- **Live Data Updates**: Real stock prices with green/red indicators
- **Professional Interface**: Kraken-inspired dark theme with gradients and animations
- **Responsive Design**: Perfect experience on desktop, tablet, and mobile
- **RTL Support**: Full right-to-left layout for Hebrew language
- **Smart Tooltips**: Contextual help and explanations

### ⚡ **Professional Features**
- **Multiple Time Horizons**: 30, 60, 90, 180, and 365-day options
- **Flexible Protection Levels**: 80% to 99% protection range with visual slider
- **Risk-Free Rate Integration**: Accurate options pricing with current rates
- **Volatility Analysis**: Live volatility estimation from market data
- **Investment Recommendations**: Smart guidance based on strategy metrics

## 🛠️ **Technology Stack**

- **Framework**: Next.js 14 with App Router and API routes
- **Frontend**: React 18 with modern hooks and server components
- **Styling**: Tailwind CSS with custom dark theme and glass morphism
- **APIs**: Multiple stock data providers with fallback mechanisms
- **Security**: Server-side API key management and CORS protection
- **Internationalization**: Custom translation system with RTL support
- **Icons**: Lucide React for crisp, professional iconography
- **Deployment**: Vercel with optimized Edge Functions

## 🌍 **Live Data Integration**

### **Stock Data Providers**
- **Primary**: Financial Modeling Prep (250 requests/day free)
- **Fallback 1**: Alpha Vantage (25 requests/day free)
- **Fallback 2**: Twelve Data (800 requests/day free)
- **Caching**: 1-minute intelligent caching for optimal performance

### **Real-Time Features**
- 📊 Live stock prices and market data
- 📈 Real-time change indicators (+/-)
- 🕐 Market session status (open/closed)
- 🏢 Company information and sectors
- 💰 Market capitalization data
- 📊 Estimated volatility from price ranges

### **Multi-Currency Support**
- 🇺🇸 USD - US Dollar
- 🇪🇺 EUR - Euro
- 🇬🇧 GBP - British Pound
- 🇯🇵 JPY - Japanese Yen
- 🇨🇭 CHF - Swiss Franc
- 🇨🇦 CAD - Canadian Dollar
- 🇦🇺 AUD - Australian Dollar
- 🇮🇱 ILS - Israeli Shekel
- 🇨🇳 CNY - Chinese Yuan
- 🇮🇳 INR - Indian Rupee

## 🔐 **Security Features**

### **Server-Side Architecture**
- **🔒 API Key Protection**: All external API calls made server-side
- **🛡️ CORS Security**: Proper cross-origin resource sharing
- **⚡ Edge Functions**: Fast, secure API routes
- **🔐 Environment Variables**: Secure configuration management

### **API Routes**
```
/api/stock-data?symbol=AAPL
```
- Server-side data fetching
- Multiple provider fallbacks
- Intelligent error handling
- Response caching

## 🌐 **Internationalization**

### **Supported Languages**
- **🇺🇸 English**: Default language with full feature set
- **🇮🇱 Hebrew**: Complete RTL support with Hebrew translations
- **🇳🇱 Dutch**: Full Dutch language support

### **RTL Support**
- Automatic layout direction switching
- Proper text alignment for Hebrew
- Culturally appropriate number formatting
- Regional currency preferences

## 🎯 **What is a Protective Put Strategy?**

A **Protective Put** (also called "Married Put") is a fundamental portfolio insurance technique that combines:

1. **Long Stock Position**: You own shares of a stock
2. **Long Put Option**: You buy put options to protect against downside risk

**Key Benefits:**
- 🛡️ **Downside Protection**: Limits losses if stock price falls
- 📈 **Upside Participation**: Maintains ability to profit from stock appreciation
- ⚖️ **Risk Management**: Provides peace of mind during volatile markets
- 💼 **Portfolio Insurance**: Protects significant positions from major losses

**When to Use:**
- Before earnings announcements or major events
- During periods of high market volatility
- To protect large, concentrated positions
- As alternative to stop-loss orders

## 🚀 **Quick Start**

### **Try Online (Recommended)**
[**Launch Calculator →**](https://protective-put-calculator.vercel.app)

### **Run Locally**

```bash
# Clone the repository
git clone https://github.com/evilUrge/protective-put-calculator.git
cd protective-put-calculator

# Install dependencies
npm install

# Set up environment variables (optional - demo keys work)
cp .env.example .env.local
# Add your API keys for production use

# Start development server
npm run dev

# Open http://localhost:3000
```

### **Environment Variables (Optional)**

Create `.env.local` for production API keys:

```bash
# Stock Data API Keys (Server-side only)
FMP_API_KEY=your_financial_modeling_prep_key
ALPHA_VANTAGE_KEY=your_alpha_vantage_key
TWELVE_DATA_KEY=your_twelve_data_key
```

The app works with demo keys, but adding your own keys provides higher rate limits.

### **Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy with environment variables
vercel --prod

# Set production environment variables in Vercel dashboard
```

## 📖 **How to Use**

### **1. Select Language & Currency**
- **🌐 Language**: Choose from English, Hebrew, or Dutch
- **💱 Currency**: Select from 10 supported currencies
- **🕐 Live Updates**: See real-time "Last Updated" timestamp

### **2. Enter Your Position**
- **Stock Symbol**: Enter ticker (e.g., AAPL, NVDA, TSLA)
- **Live Data**: Watch auto-populated real-time price and company info
- **Shares Owned**: Number of shares you want to protect

### **3. Set Protection Parameters**
- **Protection Level**: 80-99% with visual slider (95% = put strike at 95% of current price)
- **Time Horizon**: Days until option expiration
- **Risk-Free Rate**: Current treasury rate (typically 3-5%)
- **Implied Volatility**: Auto-estimated from live market data

### **4. Calculate & Analyze**
- Click "Calculate Protection Strategy"
- Review live costs, breakeven points, and scenarios
- Analyze Greeks for risk assessment
- Check intelligent warnings and recommendations

### **5. Make Informed Decisions**
- Compare annualized costs (warning if >5%)
- Review scenario analysis for different stock prices
- Consider time decay (theta) impact
- Evaluate cost vs. benefit for your risk tolerance

## 📊 **Understanding the Results**

### **Key Metrics**
- **Live Stock Price**: Real-time market data with change indicators
- **Strike Price**: Put option exercise price (Protection Level × Current Price)
- **Put Premium**: Cost per share for the put option (in selected currency)
- **Total Cost**: Premium × Number of Shares
- **Protection Cost %**: Cost as percentage of portfolio value
- **Annualized Cost %**: Cost if held for a full year
- **Breakeven Price**: Stock price needed to offset premium cost

### **Greeks Explained**
- **Delta**: How much put value changes per $1 stock move (negative for puts)
- **Theta**: Daily time decay cost (how much option loses per day)
- **Vega**: Sensitivity to volatility changes (higher vol = higher premium)
- **Gamma**: How quickly delta changes (acceleration of price sensitivity)

### **Live Data Indicators**
- **🟢 Live Data**: Real-time market data active
- **🟡 Demo Data**: Using demo/cached data
- **🔴 API Error**: Issue with data provider (fallback active)

## ⚠️ **Smart Warnings & Recommendations**

The calculator provides intelligent alerts:

- 🚨 **High Cost Warning**: If annualized cost exceeds 5%
- ⏰ **Time Decay Alert**: For options with <30 days expiration
- 💰 **Expensive Protection**: For very high protection levels (>98%)
- 📉 **Low Delta Warning**: If protection may be insufficient
- 🌐 **API Warnings**: Live data connectivity issues

## 🔬 **Mathematical Implementation**

### **Black-Scholes Put Option Pricing**

```javascript
// Simplified formula (full implementation in code)
Put Price = K × e^(-r×T) × N(-d2) - S × N(-d1)

where:
d1 = (ln(S/K) + (r + σ²/2)×T) / (σ×√T)
d2 = d1 - σ×√T
```

**Variables:**
- S = Current stock price (live market data)
- K = Strike price (S × Protection Level)
- r = Risk-free rate
- T = Time to expiration (in years)
- σ = Implied volatility (estimated from live data)
- N() = Cumulative standard normal distribution

### **Greeks Calculations**
All Greeks are calculated using standard Black-Scholes derivatives with live market data for accurate risk assessment.

## 🎨 **Design Philosophy**

### **Futuristic Professional Theme**
- Inspired by professional trading platforms (Kraken, Bloomberg)
- Glass morphism effects with backdrop blur
- Gradient backgrounds and glowing elements
- High contrast dark theme for extended use
- Professional color coding (green=positive, red=negative, blue=neutral, yellow=warning)

### **User Experience Principles**
- **Live Feedback**: Real-time data and calculations
- **Progressive Disclosure**: Complex information organized logically
- **Smart Defaults**: Reasonable starting values for quick analysis
- **Contextual Help**: Tooltips and explanations where needed
- **Accessibility**: RTL support and proper contrast ratios

## 🔧 **Development**

### **Project Structure**
```
├── pages/
│   ├── _app.js              # Next.js app wrapper with providers
│   ├── index.js             # Main page component
│   └── api/
│       └── stock-data.js    # Server-side API route
├── components/
│   └── ProtectivePutCalculator.js  # Main calculator component
├── src/
│   ├── contexts/            # Language and currency contexts
│   ├── translations/        # Multi-language support
│   └── css files            # Styling and animations
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── vercel.json             # Deployment configuration
```

### **API Integration**
```javascript
// Server-side API route example
export default async function handler(req, res) {
  const { symbol } = req.query;

  try {
    // Fetch from multiple providers with fallbacks
    const data = await fetchStockData(symbol);
    res.status(200).json(data);
  } catch (error) {
    // Return fallback data instead of error
    res.status(200).json(fallbackData);
  }
}
```

### **Translation System**
```javascript
// Multi-language support
const { t } = useTranslation(currentLanguage);
return <h1>{t('appTitle')}</h1>; // "Protective Put Calculator"
```

## 🚀 **Performance Optimizations**

- **Server-Side Rendering**: Fast initial page loads
- **API Caching**: 1-minute intelligent caching
- **Code Splitting**: Optimized bundle sizes
- **Edge Functions**: Global low-latency API responses
- **Image Optimization**: Next.js automatic image optimization
- **CSS Optimization**: Tailwind purging and minification

## 📊 **Browser Support**

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Financial Modeling Prep, Alpha Vantage, and Twelve Data for market data APIs
- Next.js team for the excellent framework
- Tailwind CSS for the utility-first styling approach
- Vercel for seamless deployment and hosting
- Lucide React for beautiful icons

## 📞 **Support**

- 📧 **Email**: [support@protective-put-calculator.com]
- 🐛 **Issues**: [GitHub Issues](https://github.com/evilUrge/protective-put-calculator/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/evilUrge/protective-put-calculator/discussions)

---

**Built with ❤️ for the financial community**