
import React from "react";
import { Settings, FileText, DollarSign } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => currentPath.includes(path);

  return (
    <div className="bg-white border-b px-6 py-2 hidden md:block">
      <nav className="max-w-7xl mx-auto">
        <ul className="flex space-x-4">
          <li>
            <Link 
              to="/dashboard/settings" 
              className={`flex items-center px-3 py-2 text-sm rounded-md ${
                isActive("/settings") ? "bg-gray-100" : "hover:bg-gray-100"
              }`}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/dashboard/templates" 
              className={`flex items-center px-3 py-2 text-sm rounded-md ${
                isActive("/templates") ? "bg-gray-100" : "hover:bg-gray-100"
              }`}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Work Templates</span>
            </Link>
          </li>
          <li className="relative group">
            <Link 
              to="/dashboard/invoicing" 
              className={`flex items-center px-3 py-2 text-sm rounded-md ${
                isActive("/invoic") ? "bg-gray-100" : "hover:bg-gray-100"
              }`}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              <span>Invoicing</span>
            </Link>
            <div className="absolute hidden group-hover:block bg-white border shadow-lg rounded-md min-w-[180px] mt-1 py-1 z-50">
              <Link 
                to="/dashboard/invoicing" 
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Create Invoice
              </Link>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navigation;
