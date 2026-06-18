import React, { useState, useEffect } from "react";
import { Briefcase, Menu, X, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null);
    } else {
      alert("App is either already installed, or your browser hasn't triggered the install prompt yet. Try refreshing!");
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-gray-800 m-4 top-4 z-50 transition-all"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img src="/3dgradsynnclogo.png" alt="GradSync Logo" className="w-14 h-14 sm:w-13 sm:h-13 object-contain drop-shadow-md" />
            <span className="text-xl font-bold tracking-tight">GradSync</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <a
              onClick={() => {
                if (isAuthenticated && (user?.role === "graduate" || user?.role === "jobseeker")) {
                  navigate("/find-jobs");
                } else {
                  const jobsSection = document.getElementById('jobs-section');
                  if (jobsSection) {
                    jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }
              }}
              className="cursor-pointer text-gray-300 hover:text-white transition-colors font-medium text-sm"
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
              className="cursor-pointer text-gray-300 hover:text-white transition-colors font-medium text-sm"
            >
              Hire
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleInstallClick}
              className="flex items-center space-x-1.5 cursor-pointer bg-white/10 hover:bg-white/20 text-white py-1.5 px-3.5 rounded-lg font-medium transition-colors text-sm border border-white/5"
            >
              <Download size={15} />
              <span>Install App</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">Welcome, <span className="text-white font-medium">{user?.fullName}</span></span>
                <a
                  href={
                    user?.role === "employer"
                      ? "/employer-dashboard"
                      : "/find-jobs"
                  }
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md shadow-blue-500/20 font-medium text-sm"
                >
                  Dashboard
                </a>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <a
                  href="/login"
                  className="cursor-pointer text-gray-300 hover:text-white transition-colors font-medium px-3 py-2 text-sm"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md shadow-blue-500/20 text-sm"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>

          {/* Mobile Right Side (Install + Burger) */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={handleInstallClick}
              className="flex items-center space-x-1 cursor-pointer bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 rounded-md font-medium transition-colors text-xs border border-white/5"
            >
              <Download size={14} />
              <span>Install App</span>
            </button>
            <button
              className="focus:outline-none text-gray-300 hover:text-white p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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
