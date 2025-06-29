import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const languages = {
  en: { code: 'en', name: 'English', flag: '🇺🇸', rtl: false },
  he: { code: 'he', name: 'עברית', flag: '🇮🇱', rtl: true },
  nl: { code: 'nl', name: 'Nederlands', flag: '🇳🇱', rtl: false }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    // Update document direction for RTL languages
    document.dir = languages[langCode].rtl ? 'rtl' : 'ltr';
  };

  const value = {
    currentLanguage,
    changeLanguage,
    languages,
    isRTL: languages[currentLanguage].rtl
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};