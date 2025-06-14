
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";
// Removed useAuth import
// Removed fetchInvoiceSettings import (as it depends on user.id)
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

type HeaderProps = {
  setSheetOpen: (open: boolean) => void;
  sheetOpen: boolean;
};

const Header: React.FC<HeaderProps> = ({
  setSheetOpen,
  sheetOpen
}) => {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  // Removed user and handleSignOut from useAuth()
  const [logo, setLogo] = useState<string | null>(null); // Keep logo state, but fetching logic is removed

  // Removed useEffect for fetching logo as it depended on user.id
  // useEffect(() => {
  //   const fetchLogo = async () => {
  //     if (!user?.id) return;
  //     try {
  //       const settings = await fetchInvoiceSettings(user.id);
  //       if (settings?.logo_url) {
  //         setLogo(settings.logo_url);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch logo:", error);
  //     }
  //   };
  //   fetchLogo();
  // }, [user]);

  return (
    <header className="shadow-sm border-b border-gray-200 rounded-none bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
              <SheetHeader>
                {/* Logo display can remain if a static logo is set elsewhere or if fetched differently later */}
                {logo && (
                  <div className="mb-4">
                    <img src={logo} alt="Company Logo" className="h-12 w-auto object-contain" />
                  </div>
                )}
                <SheetTitle className="text-left">
                  <span className="text-base font-medium text-gray-900">
                    {t('Welcome')} {/* Generic welcome */}
                  </span>
                </SheetTitle>
              </SheetHeader>
              
              {/* Removed Sign Out button from sheet content */}
              {/* <div className="mt-auto pt-6 border-t border-gray-200">
                <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                  {t('Sign Out')}
                </Button>
              </div> */}
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-3">
            {logo && (
              <div className="hidden sm:block">
                <img src={logo} alt="Company Logo" className="h-8 w-auto object-contain" />
              </div>
            )}
            <span className="text-lg font-semibold text-gray-900 hidden sm:block">
              {t('Welcome')} {/* Generic welcome */}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Removed Sign Out button from header actions */}
            {/* <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden md:flex px-4 py-2 text-sm font-medium">
              {t('Sign Out')}
            </Button> */}
            
            <Select value={i18n.language} onValueChange={lng => i18n.changeLanguage(lng)}>
              <SelectTrigger className="w-auto min-w-[120px] flex items-center gap-2 px-3 py-2 h-9 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300">
                <ReactCountryFlag countryCode={i18n.language === 'es' ? 'ES' : 'GB'} svg style={{
                  width: '16px',
                  height: '16px'
                }} />
                <SelectValue>
                  {i18n.language === 'es' ? 'Español' : 'English'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en" className="flex items-center gap-2 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <ReactCountryFlag countryCode="GB" svg style={{
                      width: '16px',
                      height: '16px'
                    }} />
                    English
                  </div>
                </SelectItem>

                <SelectItem value="es" className="flex items-center gap-2 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <ReactCountryFlag countryCode="ES" svg style={{
                      width: '16px',
                      height: '16px'
                    }} />
                    Español
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
