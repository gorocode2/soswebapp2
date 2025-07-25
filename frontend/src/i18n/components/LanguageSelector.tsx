'use client';

import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { SupportedLanguage, languageNames, languageFlags } from '../locales';

interface LanguageSelectorProps {
  className?: string;
  showText?: boolean;
  compact?: boolean;
}

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
    <path d="m213.66,101.66-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM101.63,168h52.74C149.85,179.65,141.24,192,128,192S106.15,179.65,101.63,168Zm-3-16C97.4,140.75,96.63,128,96.63,128s.77-12.75,2-24h58.74c1.23,11.25,2,24,2,24s-.77,12.75-2,24ZM40,128c0,16.45,3.47,32,9.64,45.09C60.67,153.85,81.71,144,96.63,144v-32C81.71,112,60.67,102.15,49.64,82.91,43.47,96,40,111.55,40,128Zm88-88c13.24,0,21.85,12.35,26.37,24H101.63C106.15,52.35,114.76,40,128,40Zm78.36,42.91C195.33,102.15,174.29,112,159.37,112v32c14.92,0,35.96,9.85,47,29.09C212.53,160,216,144.45,216,128,216,111.55,212.53,96,206.36,82.91Z"></path>
  </svg>
);

export default function LanguageSelector({ 
  className = '', 
  showText = true, 
  compact = false 
}: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    setIsOpen(false);
  };

  const languages = Object.keys(languageNames) as SupportedLanguage[];

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
        >
          <span className="text-lg">{languageFlags[language]}</span>
          {showText && <span>{languageNames[language]}</span>}
          <ChevronDownIcon />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 min-w-[150px]">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    language === lang ? 'bg-slate-700 text-cyan-400' : 'text-slate-300'
                  }`}
                >
                  <span className="text-lg">{languageFlags[lang]}</span>
                  <span className="text-sm">{languageNames[lang]}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <GlobeIcon />
        <h3 className="text-lg font-semibold text-white">{t('language.select')}</h3>
      </div>
      
      <div className="grid gap-3">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
              language === lang
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-700'
            }`}
          >
            <span className="text-2xl">{languageFlags[lang]}</span>
            <div className="text-left">
              <div className="font-semibold">{languageNames[lang]}</div>
              {language === lang && (
                <div className="text-sm text-cyan-400 mt-1">
                  {t('language.current')}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
