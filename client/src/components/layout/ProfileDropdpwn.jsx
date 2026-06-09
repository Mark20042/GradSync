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

  const isGradOrSeeker = userRole?.toLowerCase() === "graduate" || userRole?.toLowerCase() === "jobseeker";
  const displayRole = isAdmin ? "Administrator" : (isGradOrSeeker ? (userRole?.toLowerCase() === "jobseeker" ? "Job Seeker" : "Graduate") : "Employer");

  const handleProfileClick = () => {
    if (isAdmin) {
      navigate("/admin-dashboard");
    } else {
      navigate(isGradOrSeeker ? "/profile" : "/company-profile");
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Profile button */}
      <button
        onClick={onToggle}
        className={`flex items-center space-x-3 p-1 pr-4 rounded-full transition-all duration-300 border h-12 ${
          isOpen ? 'bg-white border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.06)]' : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm'
        }`}
      >
        {avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
        ) : (
          <div className="h-10 w-10 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
            <span className="font-bold text-white text-sm tracking-wider">
              {(isGradOrSeeker ? fullName : companyName)
                ?.charAt(0)
                .toUpperCase()}
            </span>
          </div>
        )}

        <div className="hidden sm:flex flex-col items-start text-left ml-1">
          <span className="text-[13px] font-bold text-gray-900 truncate max-w-[130px] leading-tight tracking-tight">
            {isGradOrSeeker ? fullName : companyName}
          </span>
          <span className="text-[11px] font-semibold text-gray-500 leading-tight mt-0.5 tracking-wide">
            {displayRole}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ml-1 ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {isGradOrSeeker ? fullName : companyName}
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
