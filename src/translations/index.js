import { en } from './en';
import { he } from './he';
import { nl } from './nl';

export const translations = {
  en,
  he,
  nl
};

export const useTranslation = (language) => {
  const t = (key, params = {}) => {
    const translation = translations[language] || translations.en;
    let text = translation[key] || key;

    // Handle parameter substitution
    if (params && typeof text === 'string') {
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
      });
    }

    return text;
  };

  return { t };
};