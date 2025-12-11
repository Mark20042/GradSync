import { useState, useEffect } from "react";
import { Search, Filter, Grid, List, X, Sparkles, Briefcase, MapPin, DollarSign, Clock } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import FilterContent from "./components/FilterContent";
import SearchHeader from "./components/SearchHeader";
import Navbar from "./components/Navbar";
import JobCard from "../../components/Cards/JobCard";
import { motion, AnimatePresence } from "framer-motion";

const JobSeekerDashboard = () => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  //Filter states
  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    category: "",
    type: "",
    minSalary: "",
    maxSalary: "",
  });

  //Sidebar collapse states
  const [expandedSections, setExpandedSections] = useState({
    jobType: true,
    salary: true,
    categories: true,
  });

  // Function to fetch jobs from the API
  const fetchJobs = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      //Build query paramemeters
      const params = new URLSearchParams();

      if (filterParams.keyword) params.append("keyword", filterParams.keyword);
      if (filterParams.location)
        params.append("location", filterParams.location);
      if (filterParams.category)
        params.append("category", filterParams.category);
      if (filterParams.type) params.append("type", filterParams.type);
      if (filterParams.minSalary != null)
        params.append("minSalary", filterParams.minSalary);
      if (filterParams.maxSalary != null)
        params.append("maxSalary", filterParams.maxSalary);
      if (user) params.append("userId", user?._id);

      const response = await axiosInstance.get(
        `${API_PATH.JOBS.GET_ALL_JOBS}?${params.toString()}`
      );

      const jobsData = Array.isArray(response.data) ? response.data : [];

      setJobs(jobsData);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to fetch jobs. Please try again.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  //fetch jobs when filter change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const apiFilters = {
        keyword: filters.keyword,
        location: filters.location,
        minSalary: filters.minSalary,
        maxSalary: filters.maxSalary,
        category: filters.category,
        type: filters.type,
        experience: filters.experience,
        remoteOnly: filters.remoteOnly,
      };

      //Only call API if there are meaningful filters
      const hasFilters = Object.values(apiFilters).some(
        (value) =>
          value !== "" &&
          value !== false &&
          value !== null &&
          value !== undefined
      );

      if (hasFilters) {
        fetchJobs(apiFilters);
      } else {
        fetchJobs(); //fetch all jobs if no filters
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, user]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      keyword: "",
      location: "",
      category: "",
      type: "",
      minSalary: "",
      maxSalary: "",
    });
  };

  const MobileFilterOverlay = () => (
    <AnimatePresence>
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMobileFilter(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-xs bg-white/90 backdrop-blur-xl shadow-2xl border-l border-white/20"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Filters
              </h3>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="p-2 hover:bg-gray-100/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
              <FilterContent
                toggleSection={toggleSection}
                clearAllFilters={clearAllFilters}
                expandedSections={expandedSections}
                filters={filters}
                handleFilterChange={handleFilterChange}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const toggleSaveJob = async (jobId, isSaved) => {
    try {
      if (isSaved) {
        await axiosInstance.delete(API_PATH.JOBS.UNSAVE_JOB(jobId));
        toast.success("Job removed from saved");
      } else {
        await axiosInstance.post(API_PATH.JOBS.SAVE_JOB(jobId));
        toast.success("Job saved successfully");
      }
      fetchJobs(filters);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong! Try again later");
    }
  };
  const applyToJob = async (jobId) => {
    try {
      if (jobId) {
        await axiosInstance.post(API_PATH.APPLICATIONS.APPLY_TO_JOB(jobId));
        toast.success("Applied to job successfully");
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMsg = err?.response?.data?.message;
      toast.error(errorMsg || "Something went wrong! Try again later");
    }
  };

  if (jobs.length == 0 && loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans relative overflow-x-hidden">
      <Navbar />

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-300/30 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] bg-indigo-300/30 rounded-full blur-[100px] animate-pulse delay-2000" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Dream Job</span> Today
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Explore thousands of opportunities tailored just for you. Your next career move starts here.
            </p>
          </motion.div>

          {/* Floating Glass Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className=" backdrop-blur-xl  rounded-2xl shadow-2xl max-w-4xl mx-auto relative z-20"
          >
            <SearchHeader
              filters={filters}
              handleFilterChange={handleFilterChange}
              onSearch={() => fetchJobs(filters)}
            />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Glass Sidebar Filters */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-6 sticky top-24"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Filters
                </h3>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all"
                >
                  Reset
                </button>
              </div>
              <FilterContent
                toggleSection={toggleSection}
                clearAllFilters={clearAllFilters}
                expandedSections={expandedSections}
                filters={filters}
                handleFilterChange={handleFilterChange}
              />
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm border border-white/50 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <p className="text-gray-600 font-medium">
                Showing <span className="text-gray-900 font-bold">{jobs.length}</span> jobs
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  className="lg:hidden flex items-center gap-2 bg-white/80 px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-white transition-all shadow-sm"
                  onClick={() => setShowMobileFilter(true)}
                >
                  <Filter className="w-4 h-4" /> Filters
                </button>

                <div className="flex bg-gray-100/50 p-1 rounded-lg backdrop-blur-sm">
                  <button
                    className={`p-2 rounded-md transition-all ${viewMode === "grid"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all ${viewMode === "list"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Job Grid */}
            {jobs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm"
              >
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <Search className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  We couldn't find any jobs matching your search. Try adjusting your filters or search for something else.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                    : "space-y-4"
                }
              >
                {jobs.map((job, index) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="h-full"
                  >
                    <JobCard
                      job={job}
                      onClick={() => navigate(`/job/${job._id}`)}
                      onToggleSave={() => toggleSaveJob(job._id, job.isSaved)}
                      onApply={() => applyToJob(job._id)}
                      className="h-full bg-white/70 backdrop-blur-sm border border-white/60 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 rounded-2xl"
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter */}
      <MobileFilterOverlay />
    </div>
  );
};

export default JobSeekerDashboard;
