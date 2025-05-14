
import React from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type HeaderProps = {
  language: string;
  setLanguage: (value: string) => void;
  handleSignOut: () => void;
  setSheetOpen: (open: boolean) => void;
  sheetOpen: boolean;
};

const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  handleSignOut,
  setSheetOpen,
  sheetOpen
}) => {
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
                <span>Welcome, John Smith</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-4">
              {/* All placeholder navigation links have been removed */}
              {/* The navigation structure is maintained for future additions */}
            </nav>
            
            <div className="mt-6">
              <label htmlFor="mobile-language" className="text-sm font-medium block mb-1">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="mobile-language" className="w-full">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="polish">Polish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-auto pt-6 border-t border-gray-200">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="hidden md:flex items-center gap-2">
          <User className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Welcome, John Smith</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="polish">Polish</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden md:flex">
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
