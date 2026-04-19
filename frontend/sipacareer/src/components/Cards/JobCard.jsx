import { Bookmark, Building, Building2, Calendar, MapPin, Briefcase, Clock, DollarSign } from "lucide-react";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../StatusBadge";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const getCategoryColor = (category) => {
  // Professional, subtle color palette
  return "bg-slate-50 text-slate-700 border-slate-100";
};

const JobCard = ({ job, onClick, onToggleSave, onApply, saved, hideApply, publicView = false }) => {
  const { user } = useAuth();
  // Using a consistent professional style for all categories
  const categoryStyle = "bg-gray-50 text-gray-700 border-gray-200";

  const formatSalary = (min, max) => {
    const minValue = min ? Number(min) : 0;
    const maxValue = max ? Number(max) : 0;

    if (minValue === 0 && maxValue === 0) {
      return "Salary not specified";
    }

    const formatNumber = (num) => {
      if (!num || num === 0) return "";
      return `₱${num.toLocaleString("en-PH")}`;
    };

    const formattedMin = formatNumber(minValue);
    const formattedMax = formatNumber(maxValue);

    if (formattedMin && formattedMax) {
      return `${formattedMin} - ${formattedMax}`;
    } else if (formattedMin) {
      return `From ${formattedMin}`;
    } else if (formattedMax) {
      return `Up to ${formattedMax}`;
    } else {
      return "Salary not specified";
    }
  };

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group relative cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      {/* Top section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          {job?.company?.companyLogo ? (
            <div className="w-12 h-12 rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden flex-shrink-0">
              <img
                src={job?.company?.companyLogo}
                alt="Company Logo"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-gray-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors leading-tight line-clamp-2 break-words pr-2">
              {job?.title}
            </h3>
            <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1 font-medium truncate">
              {job?.company?.companyName}
            </p>
          </div>
        </div>

        {user && !publicView && (
          <button
            className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${job?.isSaved || saved
              ? "bg-blue-50 text-blue-600"
              : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
          >
            <Bookmark
              className={`w-5 h-5 ${job?.isSaved || saved ? "fill-current" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="mb-6 flex-grow">
        <div className="flex flex-wrap items-center gap-2">
          {/* Location Badge */}
          <span className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-100">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            {job?.location || "Remote"}
          </span>

          {/* Type Badge */}
          <span className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-100">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {job?.type}
          </span>

          {/* Category Badge */}
          {job?.category && (
            <span className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-100">
              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
              {job?.category}
            </span>
          )}
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
        <div className="flex flex-col">
          <div className="text-gray-900 font-bold text-base flex items-center gap-1">
            {formatSalary(job?.salaryMin, job?.salaryMax)}
            {(job?.salaryMin || job?.salaryMax) && <span className="text-xs font-normal text-gray-400">/mo</span>}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            Posted {job?.createdAt ? moment(job?.createdAt).fromNow() : "recently"}
          </div>
        </div>

        {!saved && (
          <>
            {job?.applicationStatus ? (
              <StatusBadge status={job?.applicationStatus} />
            ) : (
              !hideApply && (
                <button
                  className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all duration-200 shadow-sm active:scale-95"
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

export const JobCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full flex flex-col">
      {/* Top section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4 w-full">
          <div className="flex-shrink-0">
            <Skeleton width={48} height={48} borderRadius={8} />
          </div>
          <div className="flex-1">
            <Skeleton width="60%" height={24} style={{ marginBottom: 4 }} />
            <Skeleton width="40%" height={16} />
          </div>
        </div>
      </div>

      {/* Tags Skeleton */}
      <div className="mb-6 flex-grow">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton width={80} height={26} borderRadius={6} />
          <Skeleton width={90} height={26} borderRadius={6} />
          <Skeleton width={70} height={26} borderRadius={6} />
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
        <div className="space-y-1">
          <Skeleton width={100} height={20} />
          <Skeleton width={60} height={14} />
        </div>
        <Skeleton width={90} height={36} borderRadius={8} />
      </div>
    </div>
  );
};

export default JobCard;
