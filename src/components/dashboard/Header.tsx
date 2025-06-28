
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const [logo, setLogo] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Clock Work Pal User');

  // Load logo and user name from localStorage when component mounts
  useEffect(() => {
    const loadUserData = () => {
      try {
        const logoData = load<string>('companyLogo');
        if (logoData) {
          setLogo(logoData);
        }
        
        const savedUserName = load<string>('userName');
        if (savedUserName) {
          setUserName(savedUserName);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };
    loadUserData();
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
                    Welcome, {userName}
                  </span>
                </SheetTitle>
              </SheetHeader>
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
              Welcome, {userName}
            </span>
          </div>
          
          {/* Right side - removed sign out button */}
          <div className="flex items-center gap-3">
            {/* No sign out button needed for native container */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
