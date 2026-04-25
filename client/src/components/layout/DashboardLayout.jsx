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
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import NotificationDropdown from "../NotificationDropdown";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_PATH } from "../../utils/apiPath";
import { EMPLOYER_MENU, JOB_SEEKER_MENU } from "../../utils/data";
import ProfileDropdpwn from "./ProfileDropdpwn";

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
  const [scanning, setScanning] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch unread count initially and when dropdown closes
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
      bg-white border-r border-gray-200`}
      >
        {/* Company Logo */}
        <div className="flex items-center h-16 pl-6 border-b border-gray-200">
          {!sidebarCollapsed ? (
            <Link className="flex items-center space-x-3" to="/">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-gray-900 font-bold text-xl">
                GradSync
              </span>
            </Link>
          ) : (
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
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
            user?.role === "graduate" &&
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
                  id: "admin-assessments",
                  name: "Assessments",
                  icon: Sparkles,
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
                Welcome back!
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Here's what's happening with your jobs today.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNotificationOpen(!notificationOpen);
                  setProfileDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 relative"
              >
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                  )}
                </div>
                <span className="hidden md:inline font-medium text-sm">
                  Notifications
                </span>
              </button>
              {notificationOpen && (
                <div onClick={(e) => e.stopPropagation()}>
                  <NotificationDropdown
                    onClose={() => setNotificationOpen(false)}
                  />
                </div>
              )}
            </div>
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
    </div>
  );
};

export default DashboardLayout;
