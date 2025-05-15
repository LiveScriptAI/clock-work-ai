import React from "react";
import { NavLink } from "react-router-dom";
import { Settings, FileText, DollarSign } from "lucide-react";

const Navigation: React.FC = () => {
  return (
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
            <NavLink
              to="/invoicing"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 ${
                  isActive ? "text-indigo-600 font-semibold" : "text-gray-700"
                }`
              }
            >
              <DollarSign className="mr-2 h-4 w-4" />
              <span>Invoicing</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navigation;

