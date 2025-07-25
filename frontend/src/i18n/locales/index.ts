import { en, TranslationKeys } from './en';
import { th } from './th';

export const locales = {
  en,
  th
} as const;

export type SupportedLanguage = keyof typeof locales;
export type Translations = TranslationKeys;

export const defaultLanguage: SupportedLanguage = 'en';

export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  th: 'ไทย'
};

export const languageFlags: Record<SupportedLanguage, string> = {
  en: '🇺🇸',
  th: '🇹🇭'
};

export { en, th };
