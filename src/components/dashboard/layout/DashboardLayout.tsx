import React from "react";
interface DashboardLayoutProps {
  children: React.ReactNode;
  sheetOpen: boolean;
  setSheetOpen: (value: boolean) => void;
}
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sheetOpen,
  setSheetOpen
}) => {
  return <div className="min-h-screen flex flex-col bg-gray-400">
      {/* Main Content */}
      <main className="flex-1 p-4 bg-[#0e6797] overflow-y-auto">
        <div className="w-full space-y-4">
          {children}
        </div>
      </main>
    </div>;
};
export default DashboardLayout;