import React from "react";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import JobCard, { JobCardSkeleton } from "../../../components/Cards/JobCard";
import { useNavigate } from "react-router-dom";

const RecommendedJobs = ({
  recommendedJobs,
  loading,
  toggleSaveJob,
  applyToJob,
}) => {
  const navigate = useNavigate();

  if (!loading && (!recommendedJobs || recommendedJobs.length === 0)) return null;

  return (
    <div className="w-full xl:w-1/3 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 sticky top-28 h-[calc(100vh-140px)] overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-purple-200 bg-purple-50 rounded-lg">
            <Briefcase className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Recommended For You
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar pb-10">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <JobCardSkeleton key={i} />
          ))
        ) : (
          recommendedJobs.map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <div className="absolute -top-3 -right-3 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white">
                {job.matchReason || "Recommended"}
              </div>
              <JobCard
                job={job}
                onClick={() => navigate(`/job/${job._id}`)}
                onToggleSave={() => toggleSaveJob(job._id, job.isSaved)}
                onApply={() => applyToJob(job._id)}
                className="h-full border-purple-100 hover:border-purple-300 ring-2 ring-transparent hover:ring-purple-100 transition-all"
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecommendedJobs;
