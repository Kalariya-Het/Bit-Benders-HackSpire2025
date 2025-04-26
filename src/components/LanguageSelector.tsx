
import React from 'react';
import { LanguagePreference } from '../types/voice-types';

interface LanguageSelectorProps {
  selectedLanguage: LanguagePreference;
  onSelectLanguage: (language: LanguagePreference) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  selectedLanguage, 
  onSelectLanguage 
}) => {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'de', name: 'Deutsch (German)' },
    { code: 'ja', name: '日本語 (Japanese)' },
    { code: 'zh', name: '中文 (Chinese)' }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 my-3">
      {languages.map((language) => (
        <button
          key={language.code}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            selectedLanguage === language.code
              ? 'bg-mosaic-600 text-white'
              : 'bg-white/50 hover:bg-white/80 text-mosaic-800'
          }`}
          onClick={() => onSelectLanguage(language.code as LanguagePreference)}
        >
          {language.name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
