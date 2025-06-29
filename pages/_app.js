import '../src/index.css';
import '../src/App.css';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { CurrencyProvider } from '../src/contexts/CurrencyContext';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Protective Put Calculator - Advanced Portfolio Insurance</title>
        <meta name="description" content="Professional protective put strategy calculator for portfolio insurance and risk management. Real-time stock data, multi-currency support, and advanced Black-Scholes pricing." />
        <meta name="keywords" content="protective put, options calculator, portfolio insurance, Black-Scholes, risk management, finance" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Protective Put Calculator" />
        <meta property="og:title" content="Protective Put Calculator" />
        <meta property="og:description" content="Advanced portfolio insurance and risk management calculator" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#181c24" />
      </Head>
      <LanguageProvider>
        <CurrencyProvider>
          <Component {...pageProps} />
        </CurrencyProvider>
      </LanguageProvider>
    </>
  );
}