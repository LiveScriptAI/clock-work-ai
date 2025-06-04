
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";
import { useAuth } from '@/hooks/useAuth';
import { fetchInvoiceSettings } from "@/services/invoiceSettingsService";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

type HeaderProps = {
  setSheetOpen: (open: boolean) => void;
  sheetOpen: boolean;
};

const Header: React.FC<HeaderProps> = ({
  setSheetOpen,
  sheetOpen
}) => {
  const {
    t,
    i18n
  } = useTranslation();
  const isMobile = useIsMobile();
  const {
    user,
    handleSignOut
  } = useAuth();
  const [logo, setLogo] = useState<string | null>(null);

  // Fetch logo when component mounts if user is logged in
  useEffect(() => {
    const fetchLogo = async () => {
      if (!user?.id) return;
      try {
        const settings = await fetchInvoiceSettings(user.id);
        if (settings?.logo_url) {
          setLogo(settings.logo_url);
        }
      } catch (error) {
        console.error("Failed to fetch logo:", error);
      }
    };
    fetchLogo();
  }, [user]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
              <SheetHeader>
                {logo && (
                  <div className="mb-4">
                    <img 
                      src={logo} 
                      alt="Company Logo" 
                      className="h-12 w-auto object-contain" 
                    />
                  </div>
                )}
                <SheetTitle className="flex items-center gap-3 text-left">
                  <User className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <span className="text-base font-medium text-gray-900">
                    {t('Welcome')}, {user?.user_metadata?.full_name || user?.email}
                  </span>
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
          
          {/* Logo and Welcome text */}
          <div className="flex items-center gap-3">
            {logo && (
              <img 
                src={logo} 
                alt="Company Logo" 
                className="h-10 w-auto object-contain" 
              />
            )}
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-lg font-semibold text-gray-900 hidden sm:block">
                {t('Welcome')}, {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut} 
              className="hidden md:flex px-4 py-2 text-sm font-medium"
            >
              {t('Sign Out')}
            </Button>
            
            <Select value={i18n.language} onValueChange={lng => i18n.changeLanguage(lng)}>
              <SelectTrigger className="w-auto min-w-[120px] flex items-center gap-2 px-3 py-2 h-9 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300">
                <ReactCountryFlag 
                  countryCode={i18n.language === 'es' ? 'ES' : 'GB'} 
                  svg 
                  style={{
                    width: '16px',
                    height: '16px'
                  }} 
                />
                <SelectValue>
                  {i18n.language === 'es' ? 'Español' : 'English'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en" className="flex items-center gap-2 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <ReactCountryFlag 
                      countryCode="GB" 
                      svg 
                      style={{
                        width: '16px',
                        height: '16px'
                      }} 
                    />
                    English
                  </div>
                </SelectItem>

                <SelectItem value="es" className="flex items-center gap-2 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <ReactCountryFlag 
                      countryCode="ES" 
                      svg 
                      style={{
                        width: '16px',
                        height: '16px'
                      }} 
                    />
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
