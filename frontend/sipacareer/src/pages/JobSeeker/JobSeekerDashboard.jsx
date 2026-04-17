import { useState, useEffect, useRef } from "react";
import { Search, Filter, Grid, List, X, Briefcase, DollarSign, FolderOpen, ChevronDown } from "lucide-react";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import FilterContent from "./components/FilterContent";
import SearchHeader from "./components/SearchHeader";
import Navbar from "./components/Navbar";
import JobCard, { JobCardSkeleton } from "../../components/Cards/JobCard";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, JOB_TYPES } from "../../utils/data";
import SalaryRangeSlider from "../../components/Input/SalaryRangeSlider";

const FilterDropdown = ({ label, icon: Icon, active, children, isOpen, onToggle, onClose }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${active || isOpen
          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          }`}
      >
        <Icon className={`w-3.5 h-3.5 ${active || isOpen ? "text-white" : "text-gray-500 group-hover:text-gray-900"}`} />
        <span>{label}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${active || isOpen ? "text-white/80" : "text-gray-400"}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 z-50 p-2 overflow-hidden ring-1 ring-black/5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const JobSeekerDashboard = () => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Active dropdown state: 'jobType', 'category', 'salary', or null
  const [activeDropdown, setActiveDropdown] = useState(null);

  //Filter states
  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    category: "",
    type: "",
    minSalary: "",
    maxSalary: "",
  });

  //Sidebar collapse states (kept for mobile drawer reuse)
  const [expandedSections, setExpandedSections] = useState({
    jobType: true,
    salaryRange: true,
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

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
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
            className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Filters
              </h3>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterContent
                toggleSection={toggleSection}
                clearAllFilters={clearAllFilters}
                expandedSections={expandedSections}
                filters={filters}
                handleFilterChange={handleFilterChange}
              />
            </div>
            <div className="p-5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
              >
                Show Results
              </button>
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


  const activeFilterCount =
    (filters.type ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.minSalary || filters.maxSalary ? 1 : 0);


  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      {/* Simplified Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Abstract Background Patterns */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/20 rounded-full mix-blend-overlay filter blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-overlay filter blur-[100px] translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Build Your Professional Future
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Access exclusive opportunities from top companies worldwide and take the next step in your career.
            </p>
          </motion.div>

          {/* New Simplified Search Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SearchHeader
              filters={filters}
              handleFilterChange={handleFilterChange}
              onSearch={() => fetchJobs(filters)}
            />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12 relative z-20">

        {/* Unified Results & Filter Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 p-4 mb-6 transition-all duration-300">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

            {/* Left Side: Count & Filters */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <p className="text-gray-500 font-medium whitespace-nowrap text-sm pl-1">
                Showing <span className="text-gray-900 font-bold text-base">{jobs.length}</span> jobs
              </p>

              <div className="h-8 w-px bg-gray-200 hidden sm:block mx-2"></div>

              {/* Desktop Filters Toolbar */}
              <div className="hidden lg:flex items-center gap-2">
                {/* Job Type Dropdown */}
                <FilterDropdown
                  label={filters.type || "Job Type"}
                  icon={Briefcase}
                  active={!!filters.type}
                  isOpen={activeDropdown === 'jobType'}
                  onToggle={() => toggleDropdown('jobType')}
                  onClose={() => setActiveDropdown(null)}
                >
                  <div className="p-1">
                    {JOB_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          handleFilterChange("type", filters.type === type.value ? "" : type.value);
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${filters.type === type.value
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </FilterDropdown>

                {/* Category Dropdown */}
                <FilterDropdown
                  label={filters.category || "Category"}
                  icon={FolderOpen}
                  active={!!filters.category}
                  isOpen={activeDropdown === 'category'}
                  onToggle={() => toggleDropdown('category')}
                  onClose={() => setActiveDropdown(null)}
                >
                  <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => {
                          handleFilterChange("category", filters.category === cat.value ? "" : cat.value);
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${filters.category === cat.value
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </FilterDropdown>

                {/* Salary Dropdown */}
                <FilterDropdown
                  label={filters.minSalary || filters.maxSalary ? "Salary Set" : "Salary"}
                  icon={DollarSign}
                  active={!!filters.minSalary || !!filters.maxSalary}
                  isOpen={activeDropdown === 'salary'}
                  onToggle={() => toggleDropdown('salary')}
                  onClose={() => setActiveDropdown(null)}
                >
                  <div className="p-3">
                    <SalaryRangeSlider filters={filters} handleFilterChange={handleFilterChange} />
                    <div className="mt-4 flex justify-end pt-3 border-t border-gray-100">
                      <button
                        onClick={() => setActiveDropdown(null)}
                        className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 active:scale-95 transition-all shadow-lg shadow-gray-200"
                      >
                        Apply Filter
                      </button>
                    </div>
                  </div>
                </FilterDropdown>

                {/* Clear All Button */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="ml-2 text-xs text-red-500 font-semibold hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-full transition-all border border-transparent hover:border-red-100"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Right Side: View Mode & Mobile Controls */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              {/* Mobile Filter Button */}
              <button
                className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 px-4 py-2.5 rounded-full font-medium text-gray-700 transition-all text-sm shadow-sm"
                onClick={() => setShowMobileFilter(true)}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex bg-gray-100 p-1 rounded-lg">
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
          </div>
        </div>

        {/* Job Grid */}
        {loading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                : "space-y-4"
            }
          >
            {[...Array(6)].map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-2xl border border-gray-200"
          >
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
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
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
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
                // whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="h-full"
              >
                <JobCard
                  job={job}
                  onClick={() => navigate(`/job/${job._id}`)}
                  onToggleSave={() => toggleSaveJob(job._id, job.isSaved)}
                  onApply={() => applyToJob(job._id)}
                  className="h-full"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Mobile Filter */}
      <MobileFilterOverlay />
    </div>
  );
};

export default JobSeekerDashboard;
