
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from '@/hooks/useAuth';
import { load } from "@/services/localStorageService";

type HeaderProps = {
  setSheetOpen: (open: boolean) => void;
  sheetOpen: boolean;
};

const Header: React.FC<HeaderProps> = ({
  setSheetOpen,
  sheetOpen
}) => {
  const isMobile = useIsMobile();
  const { user, handleSignOut } = useAuth();
  const [logo, setLogo] = useState<string | null>(null);

  // Load logo from localStorage when component mounts
  useEffect(() => {
    const loadLogo = () => {
      try {
        const logoData = load<string>('companyLogo');
        if (logoData) {
          setLogo(logoData);
        }
      } catch (error) {
        console.error("Failed to load logo:", error);
      }
    };
    loadLogo();
  }, []);

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
                {logo && (
                  <div className="mb-4">
                    <img src={logo} alt="Company Logo" className="h-12 w-auto object-contain" />
                  </div>
                )}
                <SheetTitle className="text-left">
                  <span className="text-base font-medium text-gray-900">
                    Welcome, {user?.user_metadata?.full_name || user?.email}
                  </span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-auto pt-6 border-t border-gray-200">
                <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Welcome text with logo (desktop only) */}
          <div className="flex items-center gap-3">
            {logo && (
              <div className="hidden sm:block">
                <img src={logo} alt="Company Logo" className="h-8 w-auto object-contain" />
              </div>
            )}
            <span className="text-lg font-semibold text-gray-900 hidden sm:block">
              Welcome, {user?.user_metadata?.full_name || user?.email}
            </span>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut} 
              className="hidden md:flex px-4 py-2 text-sm font-medium"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
