import React from "react";
import { Calendar, Download, Eye, Trophy, Medal, Award } from "lucide-react";
import moment from "moment";
import { getInitials } from "../../utils/helper";
import StatusBadge from "./../../components/StatusBadge";

const RankedCandidates = ({ applications, handleDownloadResume, setSelectedApplicant }) => {
  const rankedApps = [...applications].sort((a, b) => b.matchScore - a.matchScore);

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-7 h-7 text-yellow-500" />;
    if (index === 1) return <Medal className="w-7 h-7 text-slate-400" />;
    if (index === 2) return <Award className="w-7 h-7 text-amber-700" />;
    return <span className="text-xl font-bold text-gray-300">#{index + 1}</span>;
  };

  return (
    <div className="space-y-4 mt-6">
      {rankedApps.map((application, index) => (
        <div
          key={application._id}
          className={`flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border ${
            index === 0
              ? "border-yellow-300 shadow-md shadow-yellow-100 ring-2 ring-yellow-50"
              : index < 3
              ? "border-blue-200 shadow-sm"
              : "border-gray-100"
          } rounded-2xl transition-all relative overflow-hidden group hover:shadow-lg`}
        >
          <div className="flex items-center gap-5">
            {/* Ranking Number Indicator */}
            <div className="w-10 flex justify-center items-center flex-shrink-0">
              {getRankIcon(index)}
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              {application.applicant.avatar ? (
                <img
                  src={application.applicant.avatar}
                  alt={application.applicant.fullName}
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover ring-2 ring-white shadow-md"
                />
              ) : (
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-md ring-2 ring-white">
                  <span className="text-blue-700 font-bold text-xl tracking-wide">
                    {getInitials(application.applicant.fullName)}
                  </span>
                </div>
              )}
              {index === 0 && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                  TOP
                </span>
              )}
            </div>

            {/* Applicant Info */}
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate group-hover:text-blue-600 transition-colors">
                {application.applicant.fullName}
              </h3>
              <p className="text-gray-500 text-sm truncate mt-0.5">
                {application.applicant.email}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                {application.matchScore > 0 ? (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100 shadow-sm">
                    <span className="font-bold">Score: {application.matchScore}</span>
                    <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full"></div>
                    <span className="text-xs font-semibold opacity-90">
                      {application.matchReason}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-50 text-gray-600 px-3 py-1 rounded-lg border border-gray-100">
                    <span className="text-xs font-semibold">General Match</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{moment(application.createdAt)?.fromNow()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 md:mt-0 pl-0 sm:pl-16 md:pl-0">
            <StatusBadge status={application.status} />

            <button
              className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-all shadow-sm active:scale-95 ml-2"
              title="Download Resume"
              onClick={() => handleDownloadResume(application.applicant.resume)}
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gray-900 text-white text-sm sm:text-base font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-md shadow-gray-200 active:scale-[0.98] cursor-pointer"
              onClick={() => setSelectedApplicant(application)}
            >
              <Eye className="w-4 h-4" />
              Preview Profile
            </button>
          </div>
        </div>
      ))}

      {rankedApps.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 font-medium">No candidates to rank yet.</p>
          </div>
      )}
    </div>
  );
};

export default RankedCandidates;
