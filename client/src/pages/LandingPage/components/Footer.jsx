import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#1a202c] text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          
          {/* Brand/Logo Area */}
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <img src="/3dgradsynnclogo.png" alt="GradSync Logo" className="w-12 h-12 object-contain drop-shadow-md" />
              <h2 className="text-2xl font-bold text-white tracking-tight">
                GradSync
              </h2>
            </div>
            <p className="text-gray-400 mt-2 text-sm max-w-sm">
              Bridging fresh graduates and top employers with smart, skill-based matching.
            </p>
          </div>

          
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} GradSync. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="#" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
