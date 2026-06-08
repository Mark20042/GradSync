import { useState, useEffect } from "react";
import { Briefcase, Bookmark, Bell, MessageCircle, Users, Award, ClipboardList, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";

import ProfileDropdown from ".././../../../components/layout/ProfileDropdpwn";
import NotificationDropdown from "../../../../components/NotificationDropdown";
import TokenInfoModal from "../../../../components/TokenInfoModal";
import axiosInstance from "../../../../utils/axiosInstance";
import { API_PATH, BASE_URL } from "../../../../utils/apiPath";

import io from "socket.io-client";
import toast from "react-hot-toast";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [newTokensData, setNewTokensData] = useState(null);
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

  // Socket.IO for real-time notifications
  useEffect(() => {
    if (user && isAuthenticated) {
      const socket = io(BASE_URL);
      socket.emit("joinRoom", user._id);
      
      socket.on("receiveNotification", (notification) => {
        setUnreadCount(prev => prev + 1);
        
        if (notification.type === "TOKENS_ADDED") {
          setNewTokensData(notification);
        } else {
          // Show in-app toast
          toast(notification.title + ": " + notification.message, {
            icon: '🔔',
            duration: 5000,
          });
        }
      });
      
      return () => socket.disconnect();
    }
  }, [user, isAuthenticated]);

  // Listen for instant mark-as-read events
  useEffect(() => {
    const handleReadEvent = () => setUnreadCount(0);
    window.addEventListener('notificationReadAll', handleReadEvent);
    return () => window.removeEventListener('notificationReadAll', handleReadEvent);
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
      window.dispatchEvent(new CustomEvent("openFeedbackModal", {
        detail: { featureName: "Job Match Analysis" }
      }));
    } catch (error) {
      console.error("Error scanning matches:", error);
      alert("Failed to scan for matches.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-17 h-17 flex items-center justify-center">
              <img src="/3dgradsynnclogo.png" alt="GradSync Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg text-gray-900">GradSync</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {user && (
              <>
                {/* Graduate-specific navigation */}
                {(user?.role === "graduate" || user?.role === "jobseeker") && (
                  <>
                    {/* Skill Center */}
                    <button
                      className="relative flex items-center px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                      onClick={() => navigate("/assessments")}
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

                {/* Token Counter */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setTokenModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-1.5 rounded-full border border-blue-100"
                >
                  <img src="/gradcoin.svg" alt="GradCoin" className="w-8 h-8 drop-shadow-md object-contain -mt-0.5" />
                  <span className="font-extrabold text-blue-700 text-lg leading-none">{user?.aiTokens || 0}</span>
                  <span className="text-sm font-bold text-blue-700 hidden sm:inline leading-none">GradCoins</span>
                </button>
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
          {(user?.role === "graduate" || user?.role === "jobseeker") && (
            <>
              <button onClick={() => navigate("/assessments")} className="flex flex-col items-center p-2 text-gray-500 hover:text-yellow-600">
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

      {/* Token Info Modal */}
      <TokenInfoModal 
        isOpen={tokenModalOpen} 
        onClose={() => setTokenModalOpen(false)} 
      />

      {/* New Tokens Received Modal */}
      {newTokensData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setNewTokensData(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <img src="/gradcoin.svg" alt="GradCoin" className="w-12 h-12 drop-shadow-md animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Woohoo!</h2>
              <p className="text-green-50 font-medium">Tokens Received</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-6 text-sm">
                {newTokensData.message}
              </p>
              <button 
                onClick={() => {
                  setNewTokensData(null);
                  window.location.reload(); // Quick refresh to update the token balance globally
                }}
                className="w-full bg-green-600 text-white font-medium py-2.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
