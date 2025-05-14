
import React from "react";
import { FileText } from "lucide-react";
import { NavLink } from "react-router-dom";

const Navigation: React.FC = () => {
  return (
    <div className="bg-white border-b px-6 py-2 hidden md:block">
      <nav className="max-w-7xl mx-auto">
        <ul className="flex space-x-4">
          <li>
            <NavLink
              to="/invoicing"
              end
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm rounded-md ${
                  isActive ? "bg-gray-100 font-semibold" : "hover:bg-gray-100"
                }`
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Invoice</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navigation;
