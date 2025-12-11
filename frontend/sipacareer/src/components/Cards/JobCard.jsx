import { Bookmark, Building, Building2, Calendar, MapPin } from "lucide-react";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../StatusBadge";

const JobCard = ({ job, onClick, onToggleSave, onApply, saved, hideApply, publicView = false }) => {
  const { user } = useAuth();

  const formatSalary = (min, max) => {
    // Convert to numbers if they're strings
    const minValue = min ? Number(min) : 0;
    const maxValue = max ? Number(max) : 0;

    // If both are 0, return "Salary not specified"
    if (minValue === 0 && maxValue === 0) {
      return "Salary not specified";
    }

    // Simple formatting without Intl.NumberFormat
    const formatNumber = (num) => {
      if (!num || num === 0) return "";
      return `₱${num.toLocaleString("en-PH")}`;
    };

    const formattedMin = formatNumber(minValue);
    const formattedMax = formatNumber(maxValue);

    if (formattedMin && formattedMax) {
      return `${formattedMin} - ${formattedMax}/mo`;
    } else if (formattedMin) {
      return `From ${formattedMin}/mo`;
    } else if (formattedMax) {
      return `Up to ${formattedMax}/mo`;
    } else {
      return "Salary not specified";
    }
  };

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:shadow-gray-200 transition-all duration-300 group relative overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Top section */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {job?.company?.companyLogo ? (
            <img
              src={job?.company?.companyLogo}
              alt="Company Logo"
              className="w-10 h-10 object-cover rounded-xl border-2 border-white/20 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
          )}

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors leading-snug">
              {job?.title}
            </h3>
            <p className="text-gray-600 text-xs flex items-center gap-1.5 mt-0.5">
              <Building className="w-3 h-3" />
              {job?.company?.companyName}
            </p>
          </div>
        </div>

        {user && !publicView && (
          <button
            className={`p-1.5 rounded-lg transition-all duration-200 ${job?.isSaved || saved
              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
              : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
          >
            <Bookmark
              className={`w-4 h-4 ${job?.isSaved || saved ? "fill-current" : ""
                }`}
            />
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-[10px]">
          {(job?.isSaved || saved) && (
            <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-200">
              <Bookmark className="w-2.5 h-2.5 fill-current" />
              Saved
            </span>
          )}
          <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
            <MapPin className="w-2.5 h-2.5" />
            {job?.location || "Remote"}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full font-medium ${job?.type === "Full Time"
              ? "bg-green-100 text-green-800"
              : job?.type === "Part-Time"
                ? "bg-yellow-100 text-yellow-800"
                : job?.type === "Contract"
                  ? "bg-blue-100 text-blue-800"
                  : job?.type === "Internship"
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-gray-100 text-gray-800"
              }`}
          >
            {job?.type}
          </span>
          <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
            {job?.category}
          </span>
        </div>
      </div>

      {/* Date */}
      <div className="flex items-center justify-between text-[10px] font-medium text-gray-500 mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {job?.createdAt
              ? moment(job?.createdAt).format("Do MMM, YYYY")
              : "N/A"}
          </span>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex items-center justify-between">
        <div className="text-blue-600 font-semibold text-base">
          {formatSalary(job?.salaryMin, job?.salaryMax)}
        </div>
        {!saved && (
          <>
            {job?.applicationStatus ? (
              <StatusBadge status={job?.applicationStatus} />
            ) : (
              !hideApply && (
                <button
                  className="bg-gradient-to-r from-blue-50 to-blue-50 text-xs text-blue-700 hover:text-white px-4 py-2 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-200 font-semibold transform hover:translate-y-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApply();
                  }}
                >
                  Apply
                </button>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobCard;
