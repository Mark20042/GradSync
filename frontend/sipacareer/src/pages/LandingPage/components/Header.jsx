import React, { useState } from "react";
import { Briefcase, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-900 text-white rounded-2xl shadow-lg m-4"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Briefcase className="w-6 h-6 text-white" />
            <span className="text-xl font-bold">SipaCareer</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <a
              onClick={() => {
                if (isAuthenticated && user?.role === "graduate") {
                  navigate("/find-jobs");
                } else {
                  const jobsSection = document.getElementById('jobs-section');
                  if (jobsSection) {
                    jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }
              }}
              className="cursor-pointer hover:text-purple-400 hover:underline hover:decoration-purple-400 hover:underline-offset-4 transition-colors font-medium px-3 py-2"
            >
              Find Jobs
            </a>
            <a
              onClick={() =>
                navigate(
                  isAuthenticated && user?.role === "employer"
                    ? "/employer-dashboard"
                    : "/login"
                )
              }
              className="cursor-pointer hover:text-purple-400 hover:underline hover:decoration-purple-400 hover:underline-offset-4 transition-colors font-medium px-3 py-2"
            >
              Hire
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span>Welcome, {user?.fullName}</span>
                <a
                  href={
                    user?.role === "employer"
                      ? "/employer-dashboard"
                      : "/find-jobs"
                  }
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  Dashboard
                </a>
              </div>
            ) : (
              <>
                <a
                  href="/login"
                  className="cursor-pointer hover:text-purple-400 hover:underline hover:decoration-purple-400 hover:underline-offset-4 transition-colors font-medium px-3 py-2"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 rounded-lg mt-2 p-4 space-y-3">
            <a
              onClick={() => {
                setMobileMenuOpen(false);
                const jobsSection = document.getElementById('jobs-section');
                if (jobsSection) {
                  jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  navigate("/find-jobs");
                }
              }}
              className="block cursor-pointer hover:text-purple-400 font-medium"
            >
              Find Jobs
            </a>
            <a
              onClick={() =>
                navigate(
                  isAuthenticated && user?.role === "employer"
                    ? "/employer-dashboard"
                    : "/login"
                )
              }
              className="block cursor-pointer hover:text-purple-400 font-medium"
            >
              Hire
            </a>

            {isAuthenticated ? (
              <a
                href={
                  user?.role === "employer"
                    ? "/employer-dashboard"
                    : "/find-jobs"
                }
                className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg text-center"
              >
                Dashboard
              </a>
            ) : (
              <>
                <a
                  href="/login"
                  className="block cursor-pointer hover:text-purple-400 font-medium"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg text-center"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
