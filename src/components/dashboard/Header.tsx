
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";
import { useAuth } from '@/hooks/useAuth';
import { fetchInvoiceSettings } from "@/services/invoiceSettingsService";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

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
  const { user, handleSignOut } = useAuth();
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
              {logo && (
                <div className="mb-3">
                  <img 
                    src={logo} 
                    alt="Company Logo" 
                    className="h-10 object-contain" 
                  />
                </div>
              )}
              <SheetTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-500" />
                {t('Welcome')}, {user?.user_metadata?.full_name || user?.email}
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
          {logo && (
            <img 
              src={logo} 
              alt="Company Logo" 
              className="h-8 mr-2 object-contain" 
            />
          )}
          <User className="h-5 w-5 text-gray-500" />
          {t('Welcome')}, {user?.user_metadata?.full_name || user?.email}
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut} 
            className="hidden md:flex"
          >
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
              </SelectItem>

              <SelectItem value="es" className="flex items-center gap-2 px-3 py-2 text-sm">
                <div className="flex items-center gap-2 flex-1">
                  <ReactCountryFlag countryCode="ES" svg style={{ width: '1em', height: '1em' }} />
                  Español
                </div>
              </SelectItem>

            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
};

export default Header;
