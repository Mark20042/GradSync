import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PublicJobCard from "../../../components/Cards/PublicJobCard";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATH } from "../../../utils/apiPath";
import { useAuth } from "../../../context/AuthContext";

const PublicJobSection = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchPublicJobs();
    }, []);

    const fetchPublicJobs = async () => {
        try {
            setLoading(true);
            // Fetch jobs without userId to get public view
            const response = await axiosInstance.get(API_PATH.JOBS.GET_ALL_JOBS);
            const jobsData = Array.isArray(response.data) ? response.data : [];
            // Limit to 12 jobs for landing page
            setJobs(jobsData.slice(0, 12));
        } catch (error) {
            console.error("Error fetching jobs:", error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleJobClick = (jobId) => {
        if (isAuthenticated) {
            // If user is logged in, navigate to job details
            navigate(`/job/${jobId}`);
        } else {
            // If not logged in, redirect to login
            navigate("/login", { state: { from: `/job/${jobId}` } });
        }
    };

    const handleViewAllJobs = () => {
        if (isAuthenticated) {
            navigate("/find-jobs");
        } else {
            navigate("/login", { state: { from: "/find-jobs" } });
        }
    };

    return (
        <section id="jobs-section" className="relative bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-24">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-purple-200/20 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    {/* <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-purple-100 px-4 py-1.5 rounded-full mb-6 shadow-sm">
                        <Briefcase className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-900">Featured Opportunities</span>
                    </div> */}

                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Latest Jobs</span>
                    </h2>

                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Discover exciting career opportunities from top companies. Your dream job awaits!
                    </p>
                </motion.div>

                {/* Loading State */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, index) => (
                            <div
                                key={index}
                                className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 animate-pulse h-64"
                            >
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-center py-24 bg-white/60 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm max-w-3xl mx-auto"
                    >
                        <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Briefcase className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">No Jobs Available</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
                            We're currently updating our job listings. Check back soon for new opportunities!
                        </p>
                    </motion.div>
                ) : (
                    /* Jobs Grid */
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{ staggerChildren: 0.1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
                        >
                            {jobs.map((job, index) => (
                                <motion.div
                                    key={job._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.1 }}
                                    transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
                                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                    className="h-full"
                                >
                                    <PublicJobCard
                                        job={job}
                                        onClick={() => handleJobClick(job._id)}
                                        className="h-full bg-white/80 backdrop-blur-md border border-white/60 hover:border-blue-300/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 rounded-2xl group"
                                    />
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* View All Jobs Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleViewAllJobs}
                                className="group relative inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-gray-800 transition-all duration-300 font-bold text-lg overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative z-10 flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5" />
                                    View All Jobs
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </motion.button>

                            {!isAuthenticated && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="mt-6 text-gray-500"
                                >
                                    Already have an account? <button onClick={() => navigate("/login")} className="text-blue-600 hover:text-blue-700 font-bold hover:underline">Sign in</button> to apply
                                </motion.p>
                            )}
                        </motion.div>
                    </>
                )}
            </div>
        </section>
    );
};

export default PublicJobSection;
