
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Settings, FileText, DollarSign, MapPin, Clock, User } from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [isStartSignatureOpen, setIsStartSignatureOpen] = useState(false);
  const [isEndSignatureOpen, setIsEndSignatureOpen] = useState(false);

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
  };

  const confirmShiftEnd = () => {
    setIsEndSignatureOpen(false);
    setIsShiftActive(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Welcome, John Smith</h2>
          </div>
          <div className="flex items-center gap-4">
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
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b px-6 py-2">
        <NavigationMenu className="max-w-7xl mx-auto">
          <NavigationMenuList className="flex space-x-4">
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#templates">
                <FileText className="mr-2 h-4 w-4" />
                <span>Work Templates</span>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#invoicing">
                <DollarSign className="mr-2 h-4 w-4" />
                <span>Invoicing</span>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  size="lg" 
                  className={`${isShiftActive ? 'bg-gray-400 hover:bg-gray-500' : 'bg-green-600 hover:bg-green-700'}`} 
                  onClick={handleStartShift}
                  disabled={isShiftActive}
                >
                  Start Shift
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
          <div className="border-2 border-dashed border-gray-300 rounded-md h-40 flex items-center justify-center mb-4">
            <p className="text-gray-500">Sign here to approve shift start</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsStartSignatureOpen(false)}>Cancel</Button>
            <Button onClick={confirmShiftStart}>Confirm Start</Button>
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
