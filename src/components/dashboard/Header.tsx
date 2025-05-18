
import React from "react";
import { Button } from "@/components/ui/button";
import { User, Menu, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
+  SelectItemIndicator,
} from '@/components/ui/select';

type HeaderProps = {
  handleSignOut: () => void;
  setSheetOpen: (open: boolean) => void;
  sheetOpen: boolean;
};

const Header: React.FC<HeaderProps> = ({
  handleSignOut,
  setSheetOpen,
  sheetOpen
}) => {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <header className="bg-white shadow-sm py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-500" />
                <span>{t('Welcome')}, John Smith</span>
              </SheetTitle>
            </SheetHeader>
            
            <div className="mt-auto pt-6 border-t border-gray-200">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleSignOut}
              >
                {t('Sign Out')}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="hidden md:flex items-center gap-2">
          <User className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold">{t('Welcome')}, John Smith</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden md:flex">
            {t('Sign Out')}
          </Button>
          <Select
            value={i18n.language}
            onValueChange={(lng) => i18n.changeLanguage(lng)}
          >
           <SelectTrigger className="ml-4 flex items-center gap-2 px-3 py-1.5 h-10 text-sm font-medium text-gray-700 hover:bg-gray-100">
  <ReactCountryFlag
    countryCode={i18n.language === 'es' ? 'ES' : 'GB'}
    svg
    style={{ width: '1em', height: '1em' }}
  />
  <SelectValue>
    {i18n.language === 'es' ? 'Español' : 'English'}
  </SelectValue>
</SelectTrigger>
            <SelectContent>
              <SelectItem value="en" className="flex items-center gap-2 px-3 py-2 text-sm">
    <div className="flex items-center gap-2 flex-1">
      <ReactCountryFlag countryCode="GB" svg style={{ width: '1em', height: '1em' }} />
      English
    </div>
+   <SelectItemIndicator>
+     <Check className="h-4 w-4 text-indigo-600" />
+   </SelectItemIndicator>
  </SelectItem>

             <SelectItem value="es" className="flex items-center gap-2 px-3 py-2 text-sm">
  <div className="flex items-center gap-2 flex-1">
    <ReactCountryFlag countryCode="ES" svg style={{ width: '1em', height: '1em' }} />
    Español
  </div>
  <SelectItemIndicator>
    <Check className="h-4 w-4 text-indigo-600" />
  </SelectItemIndicator>
</SelectItem>

            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
};

export default Header;
