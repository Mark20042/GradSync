import React from "react";
import { Calendar, Download, Eye } from "lucide-react";
import moment from "moment";
import { getInitials } from "../../utils/helper";
import StatusBadge from "./../../components/StatusBadge";

const RankedCandidates = ({ applications, handleDownloadResume, setSelectedApplicant }) => {
  // Sort applications by match score strictly, filtering out 0 scores if you want only matching ones
  // But let's show all applications just ranked by score
  const rankedApps = [...applications].sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="space-y-4 mt-6">
      {rankedApps.map((application, index) => (
        <div
          key={application._id}
          className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-blue-100 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
        >
          {/* Ranking Number Indicator */}
          <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-b from-blue-50 to-blue-100/50 flex flex-col items-center justify-center border-r border-blue-100">
            <span className="text-xs font-semibold text-blue-400 mb-1 uppercase tracking-wider">Rank</span>
            <span className="text-2xl font-black text-blue-600">#{index + 1}</span>
          </div>

          <div className="flex items-center gap-4 pl-16">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {application.applicant.avatar ? (
                <img
                  src={application.applicant.avatar}
                  alt={application.applicant.fullName}
                  className="h-14 w-14 rounded-full object-cover shadow-sm"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                  <span className="text-blue-600 font-bold text-xl">
                    {getInitials(application.applicant.fullName)}
                  </span>
                </div>
              )}
            </div>

            {/* Applicant Info */}
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-lg truncate">
                {application.applicant.fullName}
              </h3>
              <p className="text-gray-500 text-sm truncate">
                {application.applicant.email}
              </p>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Applied {moment(application.createdAt)?.format("Do MMM, YYYY")}</span>
                  </div>
                  
                  {application.matchScore > 0 ? (
                      <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 w-fit px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                          <span>⭐</span> Score: {application.matchScore} 
                          <span className="font-medium opacity-80 ml-1">({application.matchReason})</span>
                      </div>
                  ) : (
                      <div className="text-[11px] text-gray-500 font-medium bg-gray-100 border border-gray-200 w-fit px-2.5 py-0.5 rounded-full inline-flex items-center">
                          General Match
                      </div>
                  )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-5 md:m-0 pl-16 md:pl-0">
            <StatusBadge status={application.status} />
            <button
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
              onClick={() => handleDownloadResume(application.applicant.resume)}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Resume</span>
            </button>

            <button
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors shadow-sm hover:shadow cursor-pointer"
              onClick={() => setSelectedApplicant(application)}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
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
