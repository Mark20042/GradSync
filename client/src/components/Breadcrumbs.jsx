import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-400" />}
          {index === items.length - 1 ? (
            <span className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">
              {item.label}
            </span>
          ) : item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-blue-600 transition-colors cursor-pointer truncate max-w-[150px] sm:max-w-none"
            >
              {item.label}
            </button>
          ) : item.link ? (
            <Link
              to={item.link}
              className="hover:text-blue-600 transition-colors truncate max-w-[150px] sm:max-w-none"
            >
              {item.label}
            </Link>
          ) : (
            <span className="truncate max-w-[150px] sm:max-w-none">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
