
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Globe } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define language options with country codes for flags
const languages = [
  { code: 'en-GB', label: 'English (UK)', country: 'GB' },
  { code: 'en-US', label: 'English (US)', country: 'US' },
  { code: 'en-CA', label: 'English (Canada)', country: 'CA' },
  { code: 'es', label: 'Español', country: 'ES' },
  { code: 'es-MX', label: 'Español (México)', country: 'MX' },
  { code: 'fr', label: 'Français', country: 'FR' },
  { code: 'fr-CA', label: 'Français (Canada)', country: 'CA' },
  { code: 'de', label: 'Deutsch', country: 'DE' },
  { code: 'it', label: 'Italiano', country: 'IT' },
  { code: 'pt-PT', label: 'Português', country: 'PT' },
  { code: 'pt-BR', label: 'Português (Brasil)', country: 'BR' },
  { code: 'nl', label: 'Nederlands', country: 'NL' },
  { code: 'pl', label: 'Polski', country: 'PL' },
  { code: 'sv', label: 'Svenska', country: 'SE' },
  { code: 'da', label: 'Dansk', country: 'DK' },
  { code: 'nb', label: 'Norsk', country: 'NO' },
  { code: 'ru', label: 'Русский', country: 'RU' },
  { code: 'ar', label: 'العربية', country: 'SA' },
  { code: 'hi', label: 'हिन्दी', country: 'IN' },
  { code: 'bn', label: 'বাংলা', country: 'BD' },
  { code: 'zh-CN', label: '中文 (简体)', country: 'CN' },
  { code: 'zh-TW', label: '中文 (繁體)', country: 'TW' },
  { code: 'ja', label: '日本語', country: 'JP' },
  { code: 'ko', label: '한국어', country: 'KR' },
  { code: 'id', label: 'Bahasa Indonesia', country: 'ID' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  // Find the current language
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px] flex items-center gap-2">
        <div className="flex items-center gap-2">
          {currentLanguage ? (
            <ReactCountryFlag
              countryCode={currentLanguage.country}
              svg
              style={{ width: '1em', height: '1em' }}
              title={currentLanguage.label}
            />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <SelectValue>{currentLanguage.label}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map(({ code, label, country }) => (
          <SelectItem key={code} value={code} className="flex items-center gap-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <ReactCountryFlag
                  countryCode={country}
                  svg
                  style={{ width: '1em', height: '1em' }}
                  title={label}
                />
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
