# 🛡️ Protective Put Calculator

**Professional Portfolio Insurance & Risk Management Tool**

A comprehensive, production-ready calculator for analyzing protective put strategies (also known as "married put" strategies) with full Black-Scholes options pricing, Greeks analysis, and advanced risk management features.

![Protective Put Calculator](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel) ![React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react) ![Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind-38B2AC?logo=tailwind-css)

## 🚀 **Live Demo**

**[Try the Calculator →](https://protective-put-calculator.vercel.app)**

## ✨ **Features**

### 📊 **Advanced Financial Calculations**
- **Black-Scholes Options Pricing**: Complete implementation for accurate put option valuation
- **Greeks Analysis**: Delta, Theta, Vega, and Gamma calculations for risk assessment
- **Scenario Analysis**: Comprehensive P&L analysis across different stock price movements
- **Cost Analysis**: Protection cost as percentage of portfolio and annualized cost metrics

### 🎯 **Strategy Analysis**
- **Strike Price Optimization**: Automatic calculation based on protection level
- **Breakeven Analysis**: Determine stock price needed to offset premium costs
- **Maximum Loss Calculation**: Clear understanding of worst-case scenarios
- **Portfolio Protection Metrics**: Protected value and downside risk quantification

### 🔥 **User Experience**
- **Auto-updating Data**: Simulated live stock price updates with realistic market data
- **Dark Professional Interface**: Modern Kraken-inspired design for serious investors
- **Responsive Design**: Perfect experience on desktop, tablet, and mobile
- **Smart Warnings**: Intelligent alerts for high costs and suboptimal strategies
- **Real-time Calculations**: Instant updates as you adjust parameters

### ⚡ **Professional Features**
- **Multiple Time Horizons**: 30, 60, 90, 180, and 365-day options
- **Flexible Protection Levels**: 80% to 99% protection range
- **Risk-Free Rate Integration**: Accurate options pricing with current rates
- **Volatility Analysis**: Implied volatility impact on option pricing
- **Investment Recommendations**: Smart guidance based on strategy metrics

## 🛠️ **Technology Stack**

- **Frontend**: React 18 with modern hooks and functional components
- **Styling**: Tailwind CSS with custom dark theme and professional gradients
- **Icons**: Lucide React for crisp, professional iconography
- **Deployment**: Vercel with optimized build configuration
- **Mathematics**: Custom Black-Scholes implementation with accurate Greeks calculations

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

# Start development server
npm start

# Open http://localhost:3000
```

### **Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📖 **How to Use**

### **1. Enter Your Position**
- **Stock Symbol**: Enter ticker (e.g., AAPL, NVDA, TSLA)
- **Current Price**: Auto-populated or manually adjusted
- **Shares Owned**: Number of shares you want to protect

### **2. Set Protection Parameters**
- **Protection Level**: 80-99% (95% = put strike at 95% of current price)
- **Time Horizon**: Days until option expiration
- **Risk-Free Rate**: Current treasury rate (typically 3-5%)
- **Implied Volatility**: Expected stock volatility (auto-estimated)

### **3. Calculate & Analyze**
- Click "Calculate Protection Strategy"
- Review costs, breakeven points, and scenarios
- Analyze Greeks for risk assessment
- Check warnings and recommendations

### **4. Make Informed Decisions**
- Compare annualized costs (warning if >5%)
- Review scenario analysis for different stock prices
- Consider time decay (theta) impact
- Evaluate cost vs. benefit for your risk tolerance

## 📊 **Understanding the Results**

### **Key Metrics**
- **Strike Price**: Put option exercise price (Protection Level × Current Price)
- **Put Premium**: Cost per share for the put option
- **Total Cost**: Premium × Number of Shares
- **Protection Cost %**: Cost as percentage of portfolio value
- **Annualized Cost %**: Cost if held for a full year
- **Breakeven Price**: Stock price needed to offset premium cost

### **Greeks Explained**
- **Delta**: How much put value changes per $1 stock move (negative for puts)
- **Theta**: Daily time decay cost (how much option loses per day)
- **Vega**: Sensitivity to volatility changes (higher vol = higher premium)
- **Gamma**: How quickly delta changes (acceleration of price sensitivity)

### **Scenario Analysis**
- Shows portfolio value across different stock price outcomes
- Highlights how put protection limits downside losses
- Demonstrates cost of protection in various scenarios

## ⚠️ **Smart Warnings & Recommendations**

The calculator provides intelligent alerts:

- 🚨 **High Cost Warning**: If annualized cost exceeds 5%
- ⏰ **Time Decay Alert**: For options with <30 days expiration
- 💰 **Expensive Protection**: For very high protection levels (>98%)
- 📉 **Low Delta Warning**: If protection may be insufficient

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
- S = Current stock price
- K = Strike price (S × Protection Level)
- r = Risk-free rate
- T = Time to expiration (in years)
- σ = Implied volatility
- N() = Cumulative standard normal distribution

### **Greeks Calculations**
All Greeks are calculated using standard Black-Scholes derivatives for accurate risk assessment.

## 🎨 **Design Philosophy**

### **Dark Professional Theme**
- Inspired by professional trading platforms like Kraken
- High contrast for clear data visualization
- Gradient accents for visual hierarchy
- Professional color coding (green=good, red=warning, blue=info)

### **User Experience Principles**
- **Immediate Feedback**: Real-time calculations and updates
- **Progressive Disclosure**: Complex information organized logically
- **Smart Defaults**: Reasonable starting values for quick analysis
- **Clear Warnings**: Prominent alerts for important considerations

## 🔧 **Development**

### **Project Structure**
```
src/
├── App.js          # Main calculator component
├── App.css         # Custom styles and range slider
├── index.js        # React entry point
└── index.css       # Tailwind and global styles

public/
├── index.html      # HTML template with SEO meta tags
├── manifest.json   # PWA configuration
vercel.json         # Vercel deployment configuration
```

### **Key Dependencies**
- `react`: Core React library
- `lucide-react`: Professional icon set
- `tailwindcss`: Utility-first CSS framework

### **Available Scripts**
- `npm start`: Development server
- `npm build`: Production build
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App

## 📈 **Future Enhancements**

### **Planned Features**
- 📊 **Live Market Data**: Integration with real-time stock APIs
- 📱 **Mobile App**: React Native version for iOS/Android
- 🔄 **Strategy Comparison**: Compare multiple protection strategies
- 📧 **Alerts & Notifications**: Email/SMS alerts for optimal entry/exit points
- 📋 **Portfolio Integration**: Multi-position analysis
- 🎯 **Backtesting**: Historical performance analysis
- 📊 **Advanced Charts**: Interactive price and Greek visualizations

### **Technical Improvements**
- Real options chain data integration
- Monte Carlo simulations
- Machine learning volatility predictions
- Advanced Greeks (Charm, Vanna, etc.)

## 🤝 **Contributing**

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit changes**: `git commit -m 'Add AmazingFeature'`
4. **Push to branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### **Areas for Contribution**
- 🔧 Additional options strategies (covered calls, collars, etc.)
- 📊 Advanced visualizations and charts
- 🌐 International market support
- 🧪 Testing and validation
- 📖 Documentation improvements
- 🎨 UI/UX enhancements

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ **Disclaimer**

**This tool is for educational and informational purposes only. It is not financial advice.**

- Options trading involves substantial risk and is not suitable for all investors
- Past performance does not guarantee future results
- Consider consulting with a qualified financial advisor
- The calculator uses theoretical models; actual market prices may differ
- All calculations are estimates and should be verified independently

## 🙏 **Acknowledgments**

- **Black-Scholes Model**: Fischer Black, Myron Scholes, and Robert Merton
- **Design Inspiration**: Kraken and other professional trading platforms
- **React Community**: For excellent documentation and ecosystem
- **Tailwind CSS**: For the utility-first CSS framework
- **Lucide Icons**: For beautiful, consistent iconography

---

**Built with ❤️ for the investing community**

*Star ⭐ this repository if you find it useful!*