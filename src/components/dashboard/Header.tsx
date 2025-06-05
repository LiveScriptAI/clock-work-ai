
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Crown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";
import { useAuth } from '@/hooks/useAuth';
import { fetchInvoiceSettings } from "@/services/invoiceSettingsService";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Link } from 'react-router-dom';

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
    handleSignOut,
    isSubscribed,
    subscriptionTier
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
    <header className="shadow-sm border-b border-gray-200 rounded-none bg-white">
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
                {logo && <div className="mb-4">
                    <img src={logo} alt="Company Logo" className="h-12 w-auto object-contain" />
                  </div>}
                <SheetTitle className="text-left">
                  <span className="text-base font-medium text-gray-900">
                    {t('Welcome')}, {user?.user_metadata?.full_name || user?.email}
                  </span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-auto pt-6 border-t border-gray-200 space-y-2">
                <Link to="/billing">
                  <Button variant="outline" className="w-full justify-start">
                    <Crown className="w-4 h-4 mr-2" />
                    View Plans & Pricing
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                  {t('Sign Out')}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Welcome text with logo (desktop only) */}
          <div className="flex items-center gap-3">
            {logo && <div className="hidden sm:block">
                <img src={logo} alt="Company Logo" className="h-8 w-auto object-contain" />
              </div>}
            <div className="hidden sm:block">
              <span className="text-lg font-semibold text-gray-900">
                {t('Welcome')}, {user?.user_metadata?.full_name || user?.email}
              </span>
              {isSubscribed && (
                <div className="flex items-center gap-2 mt-1">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">
                    Clock Work Pal {subscriptionTier === 'pro' ? 'Pro' : 'Basic'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <Link to="/billing">
              <Button variant="outline" size="sm" className="hidden md:flex px-4 py-2 text-sm font-medium">
                <Crown className="w-4 h-4 mr-2" />
                View Plans & Pricing
              </Button>
            </Link>
            
            <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden md:flex px-4 py-2 text-sm font-medium">
              {t('Sign Out')}
            </Button>
            
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
