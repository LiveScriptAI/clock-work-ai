
import React from "react";
import { FileText } from "lucide-react";
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
              to="/invoicing" 
              className={`flex items-center px-3 py-2 text-sm rounded-md ${
                isActive("/invoic") ? "bg-gray-100" : "hover:bg-gray-100"
              }`}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Invoice</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navigation;
