import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileDropdown = ({
  isOpen,
  onToggle,
  avatar,
  companyName,
  email,
  fullName,
  onLogout,
  userRole,
  isAdmin,
  onClose,
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose?.();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const displayRole = isAdmin ? "Administrator" : (userRole?.toLowerCase() === "graduate" ? "Graduate" : "Employer");

  const handleProfileClick = () => {
    if (isAdmin) {
      navigate("/admin-dashboard");
    } else {
      navigate(userRole === "graduate" ? "/profile" : "/company-profile");
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Profile button */}
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200"
      >
        {avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            className="h-9 w-9 rounded-xl object-cover"
          />
        ) : (
          <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="font-semibold text-white text-sm">
              {(userRole?.toLowerCase() === "graduate" ? fullName : companyName)
                ?.charAt(0)
                .toUpperCase()}
            </span>
          </div>
        )}

        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
            {userRole?.toLowerCase() === "graduate" ? fullName : companyName}
          </p>
          <p className="text-xs text-gray-500">
            {displayRole}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userRole?.toLowerCase() === "graduate" ? fullName : companyName}
            </p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>

          <button
            onClick={handleProfileClick}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            {isAdmin ? "Dashboard" : "View Profile"}
          </button>

          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
