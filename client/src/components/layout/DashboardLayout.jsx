import React from "react";
import { useState, useEffect } from "react";
import {
  Briefcase,
  Building2,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Bell,
  Sparkles,
  HelpCircle,
  Settings,
  BarChart3,
  Award,
  MessageSquare,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import NotificationDropdown from "../NotificationDropdown";
import TokenInfoModal from "../TokenInfoModal";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_PATH, BASE_URL } from "../../utils/apiPath";
import { EMPLOYER_MENU, JOB_SEEKER_MENU } from "../../utils/data";
import ProfileDropdpwn from "./ProfileDropdpwn";
import io from "socket.io-client";
import toast from "react-hot-toast";

const NavigationItem = ({ item, active, onClick, isCollapsed }) => {
  const Icon = item.icon;

  return (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
        active
          ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-50"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <Icon
        className={`w-5 h-5 flex-shrink-0 ${
          active ? "text-blue-600" : "text-gray-500"
        }`}
      />
      {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
    </button>
  );
};

const DashboardLayout = ({ activeMenu, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState(activeMenu || "dashboard");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenTokenModal = () => setTokenModalOpen(true);
    window.addEventListener("openTokenModal", handleOpenTokenModal);
    return () => window.removeEventListener("openTokenModal", handleOpenTokenModal);
  }, []);
  const [newTokensData, setNewTokensData] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch unread count initially and when dropdown closes
  useEffect(() => {
    if (user && !notificationOpen) {
      axiosInstance
        .get(API_PATH.NOTIFICATIONS.GET_ALL)
        .then((res) => {
          setUnreadCount(res.data.filter((n) => !n.isRead).length);
        })
        .catch((err) => console.error("Could not fetch notifications", err));
    }
  }, [user, notificationOpen]);

  // Socket.IO for real-time notifications
  useEffect(() => {
    if (user && !user.isAdmin) {
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
  }, [user]);

  // Listen for instant mark-as-read events
  useEffect(() => {
    const handleReadEvent = () => setUnreadCount(0);
    window.addEventListener("notificationReadAll", handleReadEvent);
    return () => window.removeEventListener("notificationReadAll", handleReadEvent);
  }, []);

  //Handle responsive behavior

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // close dropdowns when clicking
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

  const handleNavigation = (itemId) => {
    setActiveNavItem(itemId);
    navigate(`/${itemId}`);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const sidebarCollapsed = !isMobile && false;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform
      ${
        isMobile
          ? sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
          : "translate-x-0"
      }
      ${sidebarCollapsed ? "w-16" : "w-64"}
      bg-white border-r border-gray-200 flex flex-col`}
      >
        {/* Company Logo */}
        <div className="flex items-center h-16 pl-6 border-b border-gray-200">
          {!sidebarCollapsed ? (
            <Link className="flex items-center space-x-3" to="/">
              <div className="w-17 h-17 flex items-center justify-center overflow-hidden">
                <img
                  src="/3dgradsynnclogo.png"
                  alt="GradSync Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-gray-900 font-bold text-xl">GradSync</span>
            </Link>
          ) : (
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto pb-24 no-scrollbar">
          {/* Employer Navigation - Only if NOT admin */}
          {!user?.isAdmin &&
            user?.role === "employer" &&
            EMPLOYER_MENU.map((item) => (
              <NavigationItem
                key={item.id}
                item={item}
                active={activeNavItem === item.id}
                onClick={handleNavigation}
                isCollapsed={sidebarCollapsed}
              />
            ))}

          {/* Job Seeker Navigation - Only if NOT admin */}
          {!user?.isAdmin &&
            (user?.role === "graduate" || user?.role === "jobseeker") &&
            JOB_SEEKER_MENU.map((item) => (
              <NavigationItem
                key={item.id}
                item={item}
                active={activeNavItem === item.id}
                onClick={handleNavigation}
                isCollapsed={sidebarCollapsed}
              />
            ))}

          {/* Admin Navigation */}
          {user?.isAdmin && (
            <>
              {[
                {
                  id: "admin-dashboard",
                  name: "Dashboard",
                  icon: LayoutDashboard,
                },
                { id: "admin-users", name: "Users", icon: Users },

                { id: "admin-jobs", name: "Jobs", icon: Briefcase },
                {
                  id: "admin-applications",
                  name: "Applications",
                  icon: FileSpreadsheet,
                },
                {
                  id: "admin-assessments",
                  name: "Assessments",
                  icon: Sparkles,
                },
                {
                  id: "admin-assessment-review",
                  name: "Assessment Review",
                  icon: Award,
                },
                {
                  id: "admin-interview-questions",
                  name: "Interview Qs",
                  icon: HelpCircle,
                },
                {
                  id: "admin-interview-scores",
                  name: "Interview Scores",
                  icon: BarChart3,
                },
                { id: "admin-faqs", name: "FAQs", icon: HelpCircle },
                {
                  id: "admin-employer-settings",
                  name: "Employer Settings",
                  icon: Settings,
                },
                {
                  id: "admin-ai-resource-center",
                  name: "AI Resource Center",
                  icon: Sparkles,
                },
                { id: "admin-ai-feedbacks", name: "Feature Feedbacks", icon: MessageSquare },
                { id: "admin-reports", name: "Reports", icon: FileSpreadsheet },
              ].map((item) => (
                <NavigationItem
                  key={item.id}
                  item={item}
                  active={activeNavItem === item.id}
                  onClick={handleNavigation}
                  isCollapsed={sidebarCollapsed}
                />
              ))}
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 right-4 left-4">
          <button
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
            onClick={logout}
          >
            <LogOut className="h-5 w-5 flex-shrink-0 text-gray-500" />
            {!sidebarCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black opacity-25 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 
      ${isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-64"}`}
      >
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <button
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                onClick={toggleSidebar}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </button>
            )}

            <div>
              <h1 className="text-base font-semibold text-gray-900">
                {user?.isAdmin ? "Administrator Overview" : "Welcome back!"}
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                {user?.isAdmin
                  ? "Here's the platform activity for today."
                  : user?.role === "employer"
                  ? "Here's what's happening with your jobs today."
                  : "Here's what's happening with your career today."}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            {!user?.isAdmin && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationOpen(!notificationOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className={`relative flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300 ${
                    notificationOpen ? "bg-blue-600 text-white shadow-lg shadow-blue-200/50" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Bell className="w-5 h-5" strokeWidth={notificationOpen ? 2.5 : 2} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-transparent"></span>
                  )}
                </button>
                {notificationOpen && (
                  <div onClick={(e) => e.stopPropagation()} className="absolute right-0 mt-3 z-50">
                    <NotificationDropdown
                      onClose={() => setNotificationOpen(false)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* AI Tokens Display */}
            {!user?.isAdmin && (
              <button 
                onClick={() => setTokenModalOpen(true)}
                className="group flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 p-1 pr-5 rounded-full shadow-md shadow-blue-200/50 ring-1 ring-blue-500/30 relative overflow-hidden mx-2 h-12"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12"></div>
                
                <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner ring-1 ring-white/30 z-10 shrink-0">
                  <img src="/gradcoin.svg" alt="GradCoin" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                <div className="flex items-center gap-1.5 z-10 text-white pr-1">
                  <span className="font-black text-[16px] tracking-tight">{user?.aiTokens || 0}</span>
                  <span className="text-[12px] font-bold text-blue-100 hidden sm:inline tracking-wide">GradCoins</span>
                </div>
              </button>
            )}
            
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            <ProfileDropdpwn
              isOpen={profileDropdownOpen}
              onToggle={(e) => {
                e.stopPropagation();
                setProfileDropdownOpen(!profileDropdownOpen);
              }}
              avatar={user?.avatar || API_PATH.DEFAULT_AVATAR}
              companyName={user?.fullName || "CompanyName"}
              email={user?.email || "email"}
              userRole={user?.role}
              isAdmin={user?.isAdmin}
              onLogout={logout}
            />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

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
    </div>
  );
};

export default DashboardLayout;
