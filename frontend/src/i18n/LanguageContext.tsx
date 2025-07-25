'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locales, SupportedLanguage, Translations, defaultLanguage } from './locales';

interface LanguageContextType {
  language: SupportedLanguage;
  translations: Translations;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, ...args: string[]) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

const LANGUAGE_STORAGE_KEY = 'school-of-sharks-language';

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage);

  // Load language from localStorage on client side only
  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;
    if (savedLanguage && Object.keys(locales).includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      // Try to detect browser language
      const browserLanguage = navigator.language.toLowerCase();
      if (browserLanguage.startsWith('th')) {
        setLanguageState('th');
      }
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  // Get nested translation by dot notation (e.g., 'auth.login')
  const getNestedTranslation = (obj: Record<string, unknown>, path: string): string | undefined => {
    const result = path.split('.').reduce<unknown>((current, key) => {
      return current && typeof current === 'object' && current !== null ? 
        (current as Record<string, unknown>)[key] : undefined;
    }, obj);
    
    return typeof result === 'string' ? result : undefined;
  };

  // Translation function with interpolation support
  const t = (key: string, ...args: string[]): string => {
    const translation = getNestedTranslation(locales[language] as Record<string, unknown>, key);
    
    if (!translation) {
      console.warn(`Translation not found for key: ${key} in language: ${language}`);
      // Fallback to English if translation not found
      if (language !== 'en') {
        const fallbackTranslation = getNestedTranslation(locales.en as Record<string, unknown>, key);
        if (fallbackTranslation) {
          return fallbackTranslation;
        }
      }
      return key; // Return key as last resort
    }

    // Simple interpolation - replace {0}, {1}, etc. with arguments
    if (args.length > 0) {
      return translation.replace(/\{(\d+)\}/g, (match: string, index: string) => {
        const argIndex = parseInt(index, 10);
        return args[argIndex] !== undefined ? String(args[argIndex]) : match;
      });
    }

    return translation;
  };

  const value: LanguageContextType = {
    language,
    translations: locales[language],
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Convenience hook for translation function only
export function useTranslation() {
  const { t } = useLanguage();
  return { t };
}
