import { useState, useEffect } from "react";
import { Briefcase, Bookmark, Bell, MessageCircle, Users, Award } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import ProfileDropdown from "./../../../components/layout/ProfileDropdpwn";
import NotificationDropdown from "../../../components/NotificationDropdown";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATH } from "../../../utils/apiPath";
import { Sparkles } from "lucide-react";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count initially and when dropdown closes (to reflect newly read items)
  useEffect(() => {
    if (user && !notificationOpen) {
      axiosInstance.get(API_PATH.NOTIFICATIONS.GET_ALL)
        .then(res => {
          setUnreadCount(res.data.filter(n => !n.isRead).length);
        })
        .catch(err => console.error("Could not fetch notifications", err));
    }
  }, [user, notificationOpen]);

  // Listen for instant mark-as-read events
  useEffect(() => {
    const handleReadEvent = () => setUnreadCount(prev => Math.max(0, prev - 1));
    window.addEventListener('notificationRead', handleReadEvent);
    return () => window.removeEventListener('notificationRead', handleReadEvent);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (profileDropdownOpen) setProfileDropdownOpen(false);
      if (notificationOpen) setNotificationOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [profileDropdownOpen, notificationOpen]);

  const handleScanMatches = async () => {
    setScanning(true);
    try {
      const response = await axiosInstance.post(API_PATH.AI.SCAN_MATCHES);
      alert(`Scan complete! Found ${response.data.matchesFound} new matches.`);
    } catch (error) {
      console.error("Error scanning matches:", error);
      alert("Failed to scan for matches.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">GradSync</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {user && (
              <>
                {/* AI Mentor - Only for Graduates */}
                {user?.role === "graduate" && (
                  <>
                    <button
                      className="relative flex items-center px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                      onClick={() => navigate("/ai-mentor")}
                      title="AI Career Coach"
                    >
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      Career Coach
                    </button>

                    {/* Skill Center */}
                    <button
                      className="relative flex items-center px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                      onClick={() => navigate("/skill-center")}
                      title="Skill Center"
                    >
                      <Award className="w-5 h-5 text-yellow-500" />
                      Skills
                    </button>

                    {/* My Applications */}
                    <button
                      className="relative flex items-center px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                      onClick={() => navigate("/my-applications")}
                      title="My Applications"
                    >
                      <Briefcase className="w-5 h-5 text-gray-500" />
                      Applications
                    </button>
                  </>
                )}

                {/* Saved Jobs */}
                <button
                  className="relative flex items-center px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => navigate("/saved-jobs")}
                >
                  <Bookmark className="w-5 h-5 text-gray-500" />
                  Saved Jobs
                </button>

                {/* Messages */}
                <button
                  className="relative flex items-center px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => navigate("/messages")}
                >
                  <MessageCircle className="w-5 h-5 text-gray-500" />
                  Messages
                </button>



                {/* Notifications */}
                <div className="relative">
                  <button
                    className="relative flex items-center px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotificationOpen(!notificationOpen);
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <div className="relative">
                      <Bell className="w-5 h-5 text-gray-500" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                      )}
                    </div>
                    Notifications
                  </button>
                  {notificationOpen && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <NotificationDropdown onClose={() => setNotificationOpen(false)} />
                    </div>
                  )}
                </div>
              </>
            )}

            {isAuthenticated ? (
              <ProfileDropdown
                isOpen={profileDropdownOpen}
                onToggle={(e) => {
                  e.stopPropagation();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                avatar={user?.avatar || ""}
                fullName={user?.fullName || ""}
                companyName={user?.companyName || ""}
                email={user?.email || ""}
                userRole={user?.role || ""}
                onLogout={logout}
              />
            ) : (
              <>
                <a
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {isAuthenticated && (
              <div className="relative">
                <ProfileDropdown
                  isOpen={profileDropdownOpen}
                  onToggle={(e) => {
                    e.stopPropagation();
                    setProfileDropdownOpen(!profileDropdownOpen);
                  }}
                  avatar={user?.avatar || ""}
                  fullName={user?.fullName || ""}
                  companyName={user?.companyName || ""}
                  email={user?.email || ""}
                  userRole={user?.role || ""}
                  onLogout={logout}
                />
              </div>
            )}

            {/* Mobile Menu Toggle - You might want a state for this if you want a full mobile menu overlay */}
            {/* For now, relying on ProfileDropdown for basic actions, but a full menu is better */}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar (Bottom or Slide-out) - Optional improvement */}
      {/* Currently, the desktop menu items are hidden on mobile. 
          To make it fully responsive, we should add a mobile menu overlay here. */}

      <div className="md:hidden border-t border-gray-100 bg-white overflow-x-auto">
        <div className="flex items-center justify-around p-2">
          {user?.role === "graduate" && (
            <>
              <button onClick={() => navigate("/ai-mentor")} className="flex flex-col items-center p-2 text-gray-500 hover:text-blue-600">
                <Sparkles className="w-5 h-5" />
                <span className="text-[10px] mt-1">Coach</span>
              </button>
              <button onClick={() => navigate("/skill-center")} className="flex flex-col items-center p-2 text-gray-500 hover:text-yellow-600">
                <Award className="w-5 h-5" />
                <span className="text-[10px] mt-1">Skills</span>
              </button>
            </>
          )}
          <button onClick={() => navigate("/messages")} className="flex flex-col items-center p-2 text-gray-500 hover:text-blue-600">
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] mt-1">Messages</span>
          </button>
          <button onClick={() => navigate("/network")} className="flex flex-col items-center p-2 text-gray-500 hover:text-blue-600">
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-1">Network</span>
          </button>
          <button onClick={() => navigate("/saved-jobs")} className="flex flex-col items-center p-2 text-gray-500 hover:text-blue-600">
            <Bookmark className="w-5 h-5" />
            <span className="text-[10px] mt-1">Saved</span>
          </button>
          <button onClick={() => {
            setNotificationOpen(!notificationOpen);
          }} className="flex flex-col items-center p-2 text-gray-500 hover:text-blue-600 relative">
            <div className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </div>
            <span className="text-[10px] mt-1">Alerts</span>
          </button>
        </div>
        {notificationOpen && (
          <div className="absolute top-16 right-0 left-0 mx-4 z-50">
            <NotificationDropdown onClose={() => setNotificationOpen(false)} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
