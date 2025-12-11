import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, ArrowLeft } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import JobCard from "../../components/Cards/JobCard";
import LoadingSpinner from "../../components/LoadingSpinner";

import Navbar from "./components/Navbar";

const SavedJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await axiosInstance.get(API_PATH.JOBS.GET_SAVED_JOBS);
      // The backend returns an array of SavedJob objects { _id, job: { ... }, graduate: ... }
      // We need to extract the job details and add the savedJobId if needed, 
      // but JobCard expects a 'job' object. 
      // Let's map it to the format JobCard expects.
      const formattedJobs = response.data
        .filter((item) => item.job) // Filter out null jobs (deleted jobs)
        .map((item) => ({
          ...item.job,
          savedJobId: item._id, // Keep track of the saved record ID
          isSaved: true, // It's in the saved list, so it's saved
        }));
      setJobs(formattedJobs);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    try {
      await axiosInstance.delete(API_PATH.JOBS.UNSAVE_JOB(jobId));
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (error) {
      console.error("Error unsaving job:", error);
    }
  };

  const handleJobClick = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-blue-600" />
            Saved Jobs
          </h1>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No saved jobs yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Jobs you save will appear here. Browse jobs and click the bookmark icon to save them for later.
            </p>
            <button
              onClick={() => navigate("/find-jobs")}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onClick={() => handleJobClick(job._id)}
                onToggleSave={() => handleUnsave(job._id)}
                saved={true}
                hideApply={false} // Or true if you want to hide apply button here
                onApply={() => navigate(`/job/${job._id}`)} // Redirect to details to apply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
