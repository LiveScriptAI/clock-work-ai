
import React from "react";
import Header from "@/components/dashboard/Header";
import Navigation from "@/components/dashboard/Navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  language: string;
  setLanguage: (value: string) => void;
  handleSignOut: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  language,
  setLanguage,
  handleSignOut,
}) => {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Component */}
      <Header 
        language={language}
        setLanguage={setLanguage}
        handleSignOut={handleSignOut}
        setSheetOpen={setSheetOpen}
        sheetOpen={sheetOpen}
      />

      {/* Navigation Component */}
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
