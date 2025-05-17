
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Globe } from 'lucide-react';
import flags from '@/assets/flags';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define language options
const languages = [
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-CA', label: 'English (Canada)' },
  { code: 'es', label: 'Español' },
  { code: 'es-MX', label: 'Español (México)' },
  { code: 'fr', label: 'Français' },
  { code: 'fr-CA', label: 'Français (Canada)' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt-PT', label: 'Português' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'sv', label: 'Svenska' },
  { code: 'da', label: 'Dansk' },
  { code: 'nb', label: 'Norsk' },
  { code: 'ru', label: 'Русский' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'zh-CN', label: '中文 (简体)' },
  { code: 'zh-TW', label: '中文 (繁體)' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'id', label: 'Bahasa Indonesia' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  // Find the current language label
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px] flex items-center gap-2">
        <div className="flex items-center gap-2">
          {flags[i18n.language] ? (
            <img 
              src={flags[i18n.language]} 
              alt={currentLanguage.label}
              className="h-4 w-4 object-contain"
            />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <SelectValue>{currentLanguage.label}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map(({ code, label }) => (
          <SelectItem key={code} value={code} className="flex items-center gap-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {flags[code] ? (
                  <img src={flags[code]} alt={label} className="h-4 w-4 object-contain" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
                <span>{label}</span>
              </div>
              {code === i18n.language && <Check className="h-4 w-4 ml-2" />}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
