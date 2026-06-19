import { useState, useEffect } from "react";
import { Briefcase, Bookmark, Bell, MessageCircle, Users, Award, ClipboardList, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
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
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user && (
                <>
                  <div className="flex items-center bg-gray-50/80 p-1.5 rounded-2xl border border-gray-200/60 backdrop-blur-md shadow-inner">
                    {/* Graduate-specific navigation */}
                    {(user?.role === "graduate" || user?.role === "jobseeker") && (
                      <>
                        <button
                          className={`relative flex items-center px-4 py-2 rounded-xl transition-all duration-300 gap-2.5 text-[13px] font-bold tracking-wide ${location.pathname.startsWith("/assessments") ? "text-gray-900 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-gray-900/5" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
                            }`}
                          onClick={() => navigate("/assessments")}
                        >
                          <Award className={`w-[22px] h-[22px] transition-colors ${location.pathname.startsWith("/assessments") ? "text-yellow-500" : "text-gray-400"}`} strokeWidth={location.pathname.startsWith("/assessments") ? 2.5 : 2} />
                          Skills
                        </button>

                        <button
                          className={`relative flex items-center px-4 py-2 rounded-xl transition-all duration-300 gap-2.5 text-[13px] font-bold tracking-wide ${location.pathname.startsWith("/my-applications") ? "text-gray-900 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-gray-900/5" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
                            }`}
                          onClick={() => navigate("/my-applications")}
                        >
                          <Briefcase className={`w-[22px] h-[22px] transition-colors ${location.pathname.startsWith("/my-applications") ? "text-blue-500" : "text-gray-400"}`} strokeWidth={location.pathname.startsWith("/my-applications") ? 2.5 : 2} />
                          Applications
                        </button>
                      </>
                    )}

                    <button
                      className={`relative flex items-center px-4 py-2 rounded-xl transition-all duration-300 gap-2.5 text-[13px] font-bold tracking-wide ${location.pathname.startsWith("/saved-jobs") ? "text-gray-900 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-gray-900/5" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
                        }`}
                      onClick={() => navigate("/saved-jobs")}
                    >
                      <Bookmark className={`w-[22px] h-[22px] transition-colors ${location.pathname.startsWith("/saved-jobs") ? "text-purple-500" : "text-gray-400"}`} strokeWidth={location.pathname.startsWith("/saved-jobs") ? 2.5 : 2} />
                      Saved Jobs
                    </button>

                    <button
                      className={`relative flex items-center px-4 py-2 rounded-xl transition-all duration-300 gap-2.5 text-[13px] font-bold tracking-wide ${location.pathname.startsWith("/messages") ? "text-gray-900 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-gray-900/5" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
                        }`}
                      onClick={() => navigate("/messages")}
                    >
                      <MessageCircle className={`w-[22px] h-[22px] transition-colors ${location.pathname.startsWith("/messages") ? "text-green-500" : "text-gray-400"}`} strokeWidth={location.pathname.startsWith("/messages") ? 2.5 : 2} />
                      Messages
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Notifications */}
                    <div className="relative">
                      <button
                        className={`relative flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300 ${notificationOpen ? "bg-blue-600 text-white shadow-lg shadow-blue-200/50" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotificationOpen(!notificationOpen);
                          setProfileDropdownOpen(false);
                        }}
                      >
                        <Bell className="w-5 h-5" strokeWidth={notificationOpen ? 2.5 : 2} />
                        {unreadCount > 0 && (
                          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                      </button>
                      {notificationOpen && (
                        <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-3 z-50">
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
                      className="group flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 p-1 pr-5 rounded-full shadow-md shadow-blue-200/50 ring-1 ring-blue-500/30 relative overflow-hidden h-12"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12"></div>
                      
                      <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner ring-1 ring-white/30 z-10 shrink-0">
                        <img src="/gradcoin.svg" alt="GradCoin" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      
                      <div className="flex items-center gap-1.5 z-10 text-white pr-1">
                        <span className="font-black text-[16px] tracking-tight">{user?.aiTokens || 0}</span>
                        <span className="text-[12px] font-bold text-blue-100 hidden lg:inline tracking-wide">GradCoins</span>
                      </div>
                    </button>
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

            {/* Mobile Utilities */}
            <div className="md:hidden flex items-center gap-2">
              {isAuthenticated && (
                <>
                  {/* Mobile Token Counter */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTokenModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-700 py-1 pl-1 pr-3 rounded-full shadow-sm ring-1 ring-blue-500/30"
                  >
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-0.5 shadow-inner">
                      <img src="/gradcoin.svg" alt="GradCoin" className="w-8 h-8 object-contain" />
                    </div>
                    <span className="font-black text-white text-[13px]">{user?.aiTokens || 0}</span>
                  </button>

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
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Bar (Fixed Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200/80 bg-white/95 backdrop-blur-lg z-[100] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] pb-6 pt-1">
        <div className="flex items-center justify-around px-2">
          {(user?.role === "graduate" || user?.role === "jobseeker") && (
            <button
              onClick={() => navigate("/assessments")}
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${location.pathname.startsWith("/assessments") ? "text-yellow-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              <Award className="w-[22px] h-[22px]" strokeWidth={location.pathname.startsWith("/assessments") ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-semibold">Skills</span>
            </button>
          )}

          <button
            onClick={() => navigate("/messages")}
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${location.pathname.startsWith("/messages") ? "text-green-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
          >
            <MessageCircle className="w-[22px] h-[22px]" strokeWidth={location.pathname.startsWith("/messages") ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-semibold">Messages</span>
          </button>

          {(user?.role === "graduate" || user?.role === "jobseeker") && (
            <button
              onClick={() => navigate("/my-applications")}
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${location.pathname.startsWith("/my-applications") ? "text-blue-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              <Briefcase className="w-[22px] h-[22px]" strokeWidth={location.pathname.startsWith("/my-applications") ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-semibold">Applied</span>
            </button>
          )}

          <button
            onClick={() => navigate("/saved-jobs")}
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${location.pathname.startsWith("/saved-jobs") ? "text-purple-600" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
          >
            <Bookmark className="w-[22px] h-[22px]" strokeWidth={location.pathname.startsWith("/saved-jobs") ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-semibold">Saved</span>
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setNotificationOpen(!notificationOpen);
              }}
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${notificationOpen ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              <div className="relative">
                <Bell className="w-[22px] h-[22px]" strokeWidth={notificationOpen ? 2.5 : 2} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-semibold">Alerts</span>
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Notifications Pop-up (Rendered outside fixed bar to prevent backdrop-blur clipping) */}
      <div className="md:hidden">
        {notificationOpen && (
          <div className="fixed bottom-24 left-4 right-4 flex justify-center z-[120]">
            <NotificationDropdown onClose={() => setNotificationOpen(false)} />
          </div>
        )}
      </div>

      {/* Token Info Modal */}
      <TokenInfoModal
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
      />

      {/* New Tokens Received Modal */}
      {newTokensData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
