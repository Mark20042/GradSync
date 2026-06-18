import { Clock } from "lucide-react";

const ApplicationDashboardCard = ({ applicant, position, time }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-300 bg-gray-50/30 transition-colors">
      <div className="flex items-center space-x-3 min-w-0">
        <div className="h-8 w-8 shrink-0 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs tracking-wider">
            {applicant?.fullName
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)}
          </span>
        </div>

        <div className="min-w-0 truncate">
          <h4 className="text-[14px] font-semibold text-gray-900 truncate">
            {applicant?.fullName || applicant?.name}
          </h4>
          <p className="text-[11px] text-gray-500 truncate mt-0.5">{position}</p>
        </div>
      </div>

      <div className="flex items-center text-[10px] uppercase font-bold text-gray-400 shrink-0 ml-2 bg-gray-100 px-2 py-1 rounded-md tracking-wider">
        <Clock className="w-3 h-3 mr-1 opacity-70" />
        {time}
      </div>
    </div>
  );
};

export default ApplicationDashboardCard;
