import { translations, Language, TranslationKey } from '../translations';

export const useTranslation = (language: Language = 'tr') => {
  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return { t };
};