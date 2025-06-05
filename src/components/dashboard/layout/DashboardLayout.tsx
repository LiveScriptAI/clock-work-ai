
import React from "react";
import Header from "@/components/dashboard/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sheetOpen: boolean;
  setSheetOpen: (value: boolean) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sheetOpen,
  setSheetOpen,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header Component */}
      <Header
        setSheetOpen={setSheetOpen}
        sheetOpen={sheetOpen}
      />

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
