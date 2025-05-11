
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Menu, Clock, MapPin, Settings, FileText, DollarSign, User, Check, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, differenceInSeconds, differenceInMinutes, differenceInHours } from "date-fns";
import SignatureCanvas from "@/components/SignatureCanvas";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const HOURLY_RATE = 15; // £15/hour placeholder rate

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
  const [endManagerName, setEndManagerName] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [breakStart, setBreakStart] = useState<Date | null>(null);
  const [totalBreakDuration, setTotalBreakDuration] = useState(0); // in seconds
  const [isShiftComplete, setIsShiftComplete] = useState(false);
  
  // Signature validation states
  const [isStartSignatureEmpty, setIsStartSignatureEmpty] = useState(true);
  const [isEndSignatureEmpty, setIsEndSignatureEmpty] = useState(true);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationType, setValidationType] = useState<'start' | 'end'>('start');

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
    if (isBreakActive) {
      // End break
      if (breakStart) {
        const breakDuration = differenceInSeconds(new Date(), breakStart);
        setTotalBreakDuration(prev => prev + breakDuration);
      }
      setBreakStart(null);
    } else {
      // Start break
      setBreakStart(new Date());
    }
    setIsBreakActive(!isBreakActive);
  };

  const confirmShiftStart = () => {
    if (isStartSignatureEmpty || !managerName.trim()) {
      setValidationType('start');
      setShowValidationAlert(true);
      return;
    }
    
    setIsStartSignatureOpen(false);
    setIsShiftActive(true);
    setStartTime(new Date());
    setIsShiftComplete(false);
    // Reset any previous shift data
    setEndTime(null);
    setTotalBreakDuration(0);
    setBreakStart(null);
    setIsBreakActive(false);
    toast.success("Shift started successfully!");
  };

  const confirmShiftEnd = () => {
    if (isEndSignatureEmpty || !endManagerName.trim()) {
      setValidationType('end');
      setShowValidationAlert(true);
      return;
    }
    
    // If still on break, end it and add to total
    if (isBreakActive && breakStart) {
      const breakDuration = differenceInSeconds(new Date(), breakStart);
      setTotalBreakDuration(prev => prev + breakDuration);
      setBreakStart(null);
      setIsBreakActive(false);
    }
    
    setIsEndSignatureOpen(false);
    setIsShiftActive(false);
    setEndTime(new Date());
    setIsShiftComplete(true);
    toast.success("Shift ended successfully!");
  };

  // Calculate time worked in seconds
  const calculateTimeWorked = () => {
    if (!startTime) return 0;
    
    const end = endTime || new Date();
    const totalSeconds = differenceInSeconds(end, startTime);
    
    // Subtract break time
    return Math.max(0, totalSeconds - totalBreakDuration);
  };

  // Format duration for display (hours and minutes)
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };

  // Calculate earnings based on time worked
  const calculateEarnings = () => {
    const seconds = calculateTimeWorked();
    const hours = seconds / 3600;
    return (hours * HOURLY_RATE).toFixed(2);
  };

  // Format break duration for display
  const getBreakDuration = () => {
    let totalBreak = totalBreakDuration;
    
    // Add current break if active
    if (isBreakActive && breakStart) {
      totalBreak += differenceInSeconds(new Date(), breakStart);
    }
    
    const minutes = Math.floor(totalBreak / 60);
    return `${minutes} minutes`;
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
                  
                  {isBreakActive && breakStart && (
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <p className="text-sm text-amber-600 font-medium">
                        On break since {format(breakStart, "h:mm a")}
                      </p>
                    </div>
                  )}
                  
                  {isShiftComplete && endTime && (
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <p className="text-sm text-red-600">
                        <span className="font-medium">Clocked out at:</span> {format(endTime, "h:mm a")}
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        <span className="font-medium">Approved by:</span> {endManagerName}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  size="lg" 
                  className={`${isShiftActive ? 'bg-gray-400 hover:bg-gray-500' : 'bg-green-600 hover:bg-green-700'}`} 
                  onClick={handleStartShift}
                  disabled={isShiftActive || isShiftComplete}
                >
                  {isShiftActive ? 'Shift Started' : 'Start Shift'}
                </Button>
                
                <Button 
                  size="lg" 
                  className={`${isBreakActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`} 
                  onClick={handleBreakToggle}
                  disabled={!isShiftActive || isShiftComplete}
                >
                  {isBreakActive ? 'End Break' : 'Start Break'}
                </Button>
                
                <Button 
                  size="lg" 
                  className="bg-red-600 hover:bg-red-700" 
                  onClick={handleEndShift}
                  disabled={!isShiftActive || isShiftComplete}
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
                    <span className="font-medium">{formatDuration(calculateTimeWorked())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Break Duration:</span>
                    <span className="font-medium">{getBreakDuration()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Earnings:</span>
                    <span className="font-medium">£{calculateEarnings()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shift Status:</span>
                    <span className={`font-medium ${isShiftActive ? 'text-green-600' : isShiftComplete ? 'text-red-600' : 'text-gray-600'}`}>
                      {isShiftActive ? (isBreakActive ? 'On Break' : 'Active') : isShiftComplete ? 'Completed' : 'Not Started'}
                    </span>
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

      {/* Start Shift Dialog */}
      <Dialog open={isStartSignatureOpen} onOpenChange={setIsStartSignatureOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manager Approval: Shift Start</DialogTitle>
            <DialogDescription>
              Manager approval is required to start a shift. Please enter manager's name and signature.
            </DialogDescription>
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
              <SignatureCanvas 
                onSignatureChange={setIsStartSignatureEmpty}
                width={isMobile ? 300 : 380} 
                height={180}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsStartSignatureOpen(false)}>Cancel</Button>
            <Button onClick={confirmShiftStart}>Confirm Start</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Shift Dialog */}
      <Dialog open={isEndSignatureOpen} onOpenChange={setIsEndSignatureOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manager Approval: Shift End</DialogTitle>
            <DialogDescription>
              Manager approval is required to end a shift. Please enter manager's name and signature.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="endManagerName" className="text-sm font-medium block mb-1">
                Manager's Name
              </label>
              <Input 
                id="endManagerName" 
                value={endManagerName} 
                onChange={(e) => setEndManagerName(e.target.value)} 
                placeholder="Enter manager's name" 
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">
                Manager's Signature
              </label>
              <SignatureCanvas 
                onSignatureChange={setIsEndSignatureEmpty}
                width={isMobile ? 300 : 380} 
                height={180}
              />
            </div>
            
            {startTime && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm">
                  <span className="font-medium">Shift started:</span> {format(startTime, "h:mm a")}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Total break time:</span> {getBreakDuration()}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Worked time:</span> {formatDuration(calculateTimeWorked())}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsEndSignatureOpen(false)}>Cancel</Button>
            <Button onClick={confirmShiftEnd}>Confirm End</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Validation Alert Dialog */}
      <AlertDialog open={showValidationAlert} onOpenChange={setShowValidationAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Missing Information</AlertDialogTitle>
            <AlertDialogDescription>
              {validationType === 'start' 
                ? "Please provide both manager's name and signature before starting the shift." 
                : "Please provide both manager's name and signature before ending the shift."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowValidationAlert(false)}>
              <Check className="mr-2 h-4 w-4" />
              Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardPage;
