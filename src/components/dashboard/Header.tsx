
import React from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
        </div>
      </div>
    </header>
  );
};

export default Header;
