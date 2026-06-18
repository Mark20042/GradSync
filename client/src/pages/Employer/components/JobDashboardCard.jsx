import { Briefcase } from "lucide-react";
import moment from "moment";

const JobDashboardCard = ({ job }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-300 bg-gray-50/30 transition-colors">
      {/* Left: Icon + Job Info */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="h-8 w-8 shrink-0 bg-blue-100 rounded-lg flex items-center justify-center">
          <Briefcase className="w-4 h-4 text-blue-600" />
        </div>
        <div className="min-w-0 truncate">
          <h4 className="text-[14px] font-semibold text-gray-900 truncate">{job.title}</h4>
          <p className="text-[11px] text-gray-500 truncate mt-0.5">
            {job.location} • {moment(job.createdAt)?.format("MMM Do")}
          </p>
        </div>
      </div>

      {/* Right: Status */}
      <div className="shrink-0 ml-2">
        <span
          className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md ${
            !job.isClosed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {job.isClosed ? "Closed" : "Active"}
        </span>
      </div>
    </div>
  );
};

export default JobDashboardCard;
