
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Menu, Clock, MapPin, Settings, FileText, DollarSign, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";

const DashboardPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [isStartSignatureOpen, setIsStartSignatureOpen] = useState(false);
  const [isEndSignatureOpen, setIsEndSignatureOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [language, setLanguage] = useState("english");
  const [managerName, setManagerName] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/login");
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Navigation to login happens via the auth state change listener
  };

  const handleStartShift = () => {
    setIsStartSignatureOpen(true);
  };

  const handleEndShift = () => {
    setIsEndSignatureOpen(true);
  };

  const handleBreakToggle = () => {
    setIsBreakActive(!isBreakActive);
  };

  const confirmShiftStart = () => {
    setIsStartSignatureOpen(false);
    setIsShiftActive(true);
    setStartTime(new Date());
  };

  const confirmShiftEnd = () => {
    setIsEndSignatureOpen(false);
    setIsShiftActive(false);
    setStartTime(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile-friendly Header with Hamburger Menu */}
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
                <div className="flex items-center gap-2 px-1 py-2 rounded-md hover:bg-gray-100">
                  <Settings className="h-4 w-4 text-gray-500" />
                  <a href="#settings" className="text-sm">Settings</a>
                </div>
                <div className="flex items-center gap-2 px-1 py-2 rounded-md hover:bg-gray-100">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <a href="#templates" className="text-sm">Work Templates</a>
                </div>
                <div className="flex items-center gap-2 px-1 py-2 rounded-md hover:bg-gray-100">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <a href="#invoicing" className="text-sm">Invoicing</a>
                </div>
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
          
          {/* Desktop Header Content */}
          <div className="hidden md:flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Welcome, John Smith</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language selector only shown on desktop */}
            <div className="hidden md:block">
              <Select defaultValue="english">
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
            
            {/* Sign out button only shown on desktop */}
            <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden md:flex">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <div className="bg-white border-b px-6 py-2 hidden md:block">
        <nav className="max-w-7xl mx-auto">
          <ul className="flex space-x-4">
            <li>
              <a 
                href="#settings" 
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </a>
            </li>
            <li>
              <a 
                href="#templates" 
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100"
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Work Templates</span>
              </a>
            </li>
            <li>
              <a 
                href="#invoicing" 
                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                <span>Invoicing</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Time Tracking Controls */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {startTime && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Clocked in at:</span> {format(startTime, "h:mm a 'on' MMMM d, yyyy")}
                  </p>
                  <p className="text-sm text-green-800 mt-1">
                    <span className="font-medium">Manager:</span> {managerName}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  size="lg" 
                  className={`${isShiftActive ? 'bg-gray-400 hover:bg-gray-500' : 'bg-green-600 hover:bg-green-700'}`} 
                  onClick={handleStartShift}
                  disabled={isShiftActive}
                >
                  {isShiftActive ? 'Shift Started' : 'Start Shift'}
                </Button>
                
                <Button 
                  size="lg" 
                  className={`${isBreakActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`} 
                  onClick={handleBreakToggle}
                  disabled={!isShiftActive}
                >
                  {isBreakActive ? 'End Break' : 'Start Break'}
                </Button>
                
                <Button 
                  size="lg" 
                  className="bg-red-600 hover:bg-red-700" 
                  onClick={handleEndShift}
                  disabled={!isShiftActive}
                >
                  End Shift
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hours Worked:</span>
                    <span className="font-medium">7.5 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Break Duration:</span>
                    <span className="font-medium">45 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Earnings:</span>
                    <span className="font-medium">$168.75</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Location Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-200 rounded-md h-48 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-74.5,40,9,0/300x200?access_token=pk.placeholder')] bg-cover bg-center opacity-80"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <MapPin className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded text-xs">
                    Mock Map - Location Verified
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Signature Dialogs */}
      <Dialog open={isStartSignatureOpen} onOpenChange={setIsStartSignatureOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manager Approval: Shift Start</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="managerName" className="text-sm font-medium block mb-1">
                Manager's Name
              </label>
              <Input 
                id="managerName" 
                value={managerName} 
                onChange={(e) => setManagerName(e.target.value)} 
                placeholder="Enter manager's name" 
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">
                Manager's Signature
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md h-40 flex items-center justify-center p-4 bg-gray-50">
                <p className="text-gray-500 text-center">Sign here to approve shift start</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsStartSignatureOpen(false)}>Cancel</Button>
            <Button onClick={confirmShiftStart} disabled={!managerName.trim()}>Confirm Start</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEndSignatureOpen} onOpenChange={setIsEndSignatureOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manager Approval: Shift End</DialogTitle>
          </DialogHeader>
          <div className="border-2 border-dashed border-gray-300 rounded-md h-40 flex items-center justify-center mb-4">
            <p className="text-gray-500">Sign here to approve shift end</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEndSignatureOpen(false)}>Cancel</Button>
            <Button onClick={confirmShiftEnd}>Confirm End</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;
