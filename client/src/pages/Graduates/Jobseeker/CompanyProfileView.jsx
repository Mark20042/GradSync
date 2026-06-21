import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Building2,
    MapPin,
    Globe,
    Mail,
    Phone,
    ArrowLeft,
    Loader,
    Briefcase,
    ExternalLink,
    CheckCircle,
    Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CompanyProfileSkeleton from "./components/skeletons/CompanyProfileSkeleton";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATH } from "../../../utils/apiPath";
import Navbar from "./components/Navbar";
import JobCard from "../../../components/Cards/JobCard";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import LocationMap from "../../../components/Map/LocationMap";
import StarRating from "../../../components/ratings/StarRating";
import ReviewsSection from "../../../components/ratings/ReviewsSection";

const CompanyProfileView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (reviews && reviews.length > 0) {
            const interval = setInterval(() => {
                setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [reviews]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch company profile
                const companyRes = await axiosInstance.get(API_PATH.USERS.GET_PUBLIC_PROFILE(id));
                setCompany(companyRes.data);

                // Fetch company's open jobs
                const params = { company: id };
                if (user) {
                    params.userId = user._id;
                }

                const jobsRes = await axiosInstance.get(API_PATH.JOBS.GET_ALL_JOBS, { params });
                setJobs(jobsRes.data);

                // Fetch company reviews for the marquee
                try {
                    const reviewsRes = await axiosInstance.get(API_PATH.TERMINATION_REVIEWS.COMPANY_REVIEWS(id), { params: { limit: 15 } });
                    setReviews(reviewsRes.data.reviews || []);
                } catch (e) {
                    console.error("Failed to fetch company reviews", e);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load company profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, user]);

    const toggleSaveJob = async (jobId, isSaved) => {
        try {
            if (isSaved) {
                await axiosInstance.delete(API_PATH.JOBS.UNSAVE_JOB(jobId));
                toast.success("Job removed from saved");
            } else {
                await axiosInstance.post(API_PATH.JOBS.SAVE_JOB(jobId));
                toast.success("Job saved successfully");
            }
            // Update local state instead of refetching everything
            setJobs((prevJobs) => prevJobs.map((j) => (j._id === jobId ? { ...j, isSaved: !isSaved } : j)));
        } catch (err) {
            console.error("Error:", err);
            toast.error("Something went wrong! Try again later");
        }
    };

    const applyToJob = async (jobId) => {
        try {
            await axiosInstance.post(API_PATH.APPLICATIONS.APPLY_TO_JOB(jobId));
            toast.success("Applied to job successfully");
            // Update local state to reflect applied status
            setJobs((prevJobs) => prevJobs.map((j) => (j._id === jobId ? { ...j, applicationStatus: "In Review" } : j)));
        } catch (err) {
            console.error("Error:", err);
            const errorMsg = err?.response?.data?.message;
            toast.error(errorMsg || "Something went wrong! Try again later");
        }
    };    if (loading) {
        return <CompanyProfileSkeleton />;
    }

    if (error || !company) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="bg-red-50 p-4 rounded-full mb-4">
                        <Building2 className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || "The company profile you're looking for doesn't exist."}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-6 md:py-8 pb-28 md:pb-8 mt-16">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back</span>
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Hero / Cover */}
                    <div className="h-48 md:h-72 bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    </div>

                    <div className="px-6 md:px-10 pb-12">
                        <div className="relative flex flex-col md:flex-row items-start gap-6 md:gap-8">
                            {/* Logo */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative shrink-0 -mt-16 md:-mt-24"
                            >
                                {company.companyLogo ? (
                                    <img
                                        src={company.companyLogo}
                                        alt={company.companyName}
                                        className="w-36 h-36 md:w-44 md:h-44 rounded-3xl border-4 md:border-[6px] border-white shadow-xl object-cover bg-white"
                                    />
                                ) : (
                                    <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl border-4 md:border-[6px] border-white shadow-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                        <Building2 className="w-16 h-16 md:w-20 md:h-20" />
                                    </div>
                                )}
                                {/* Verified Badge */}
                                <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 bg-blue-500 text-white p-2 rounded-full border-4 border-white shadow-sm" title="Verified Company">
                                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                            </motion.div>

                            {/* Basic Info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex-1 pt-4 md:pt-6 w-full"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                                        {company.companyName || company.fullName}
                                    </h1>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 md:gap-8 text-gray-600 font-medium">
                                    {company.address && (
                                        <div className="flex items-center gap-2.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                            <MapPin className="w-4 h-4 text-blue-500" />
                                            {company.address}
                                        </div>
                                    )}
                                    {company.website && (
                                        <a
                                            href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors group"
                                        >
                                            <Globe className="w-4 h-4" />
                                            Visit Website
                                            <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 px-6 md:px-10 pb-10">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-10">
                                {/* About */}
                                <section>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        About Us
                                    </h2>
                                    <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                        {company.companyDescription ? (
                                            <p className="whitespace-pre-line">{company.companyDescription}</p>
                                        ) : (
                                            <p className="italic text-gray-400">No description provided.</p>
                                        )}
                                    </div>
                                </section>

                                {/* Open Jobs */}
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                            Open Positions
                                            <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                                                {jobs.length}
                                            </span>
                                        </h2>
                                    </div>

                                    {jobs.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {jobs.map((job) => (
                                                <JobCard
                                                    key={job._id}
                                                    job={job}
                                                    onClick={() => navigate(`/job/${job._id}`)}
                                                    onToggleSave={() => toggleSaveJob(job._id, job.isSaved)}
                                                    saved={job.isSaved}
                                                    onApply={() => applyToJob(job._id)}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">No open positions at the moment.</p>
                                        </div>
                                    )}
                                </section>

                                {/* Company Reviews Section */}
                                <ReviewsSection
                                    mode="company"
                                    entityId={id}
                                    summary={{
                                        averageRating: company?.companyAverageRating || 0,
                                        ratingCount: company?.companyRatingCount || 0,
                                    }}
                                />
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Overall Ratings Card */}
                                {company.companyAverageRating > 0 && (
                                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                                        <h3 className="font-bold text-gray-900 mb-2">Overall Rating</h3>
                                        <div className="text-5xl font-extrabold text-amber-500 mb-2">
                                            {company.companyAverageRating.toFixed(1)}
                                        </div>
                                        <div className="flex justify-center mb-2">
                                            <StarRating value={Math.round(company.companyAverageRating)} size="md" readOnly />
                                        </div>
                                        <p className="text-sm text-gray-500">Based on {company.companyRatingCount} reviews</p>
                                    </div>
                                )}

                                {/* Location Map */}
                                {company.latitude && company.longitude && (
                                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                        <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-red-500" />
                                            Company Location
                                        </h3>
                                        <LocationMap lat={company.latitude} lng={company.longitude} />
                                    </div>
                                )}

                                {/* Flashing Reviews Card */}
                                {reviews && reviews.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[260px] flex flex-col relative">
                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-100">
                                            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                                                <Star className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                                                Recent Employee Feedback
                                            </h3>
                                        </div>
                                        <div className="p-5 flex-1 relative flex items-center justify-center">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={currentReviewIndex}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="w-full absolute inset-0 p-5 flex flex-col justify-center"
                                                >
                                                    {(() => {
                                                        const review = reviews[currentReviewIndex];
                                                        return (
                                                            <div className="flex flex-col h-full w-full">
                                                                <div className="flex items-start gap-3 mb-3">
                                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                                                                        {review.reviewerRole === 'graduate' ? 'G' : review.reviewerRole === 'jobseeker' ? 'J' : 'A'}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <h4 className="font-bold text-gray-900 text-sm truncate">
                                                                            Anonymous {review.reviewerRole === 'graduate' ? 'Graduate' : review.reviewerRole === 'jobseeker' ? 'Jobseeker' : 'Employee'}
                                                                        </h4>
                                                                        <div className="flex items-center gap-1 mt-0.5">
                                                                            <StarRating value={review.rating} size="sm" readOnly />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {review.feedback && (
                                                                    <p className="text-sm text-gray-700 leading-relaxed italic line-clamp-4 relative flex-1">
                                                                        <span className="text-gray-300 font-serif text-2xl absolute -top-1.5 -left-1">"</span>
                                                                        <span className="pl-3">{review.feedback}</span>
                                                                        <span className="text-gray-300 font-serif text-2xl leading-none">"</span>
                                                                    </p>
                                                                )}
                                                                <p className="text-[11px] text-indigo-600 font-semibold truncate flex items-center gap-1 mt-4">
                                                                    <Briefcase className="w-3 h-3" />
                                                                    {review.jobTitle || "Previous Employee"}
                                                                </p>
                                                            </div>
                                                        );
                                                    })()}
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {/* Contact Information */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
                                    <h3 className="font-bold text-gray-900 mb-6 text-lg">Contact Information</h3>
                                    <div className="space-y-5">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-blue-50 p-2.5 rounded-xl">
                                                <Mail className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                                                <p className="text-sm text-gray-700 font-medium break-all">{company.email}</p>
                                            </div>
                                        </div>

                                        {company.phone && (
                                            <div className="flex items-start gap-4">
                                                <div className="bg-purple-50 p-2.5 rounded-xl">
                                                    <Phone className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                                                    <p className="text-sm text-gray-700 font-medium">{company.phone}</p>
                                                </div>
                                            </div>
                                        )}

                                        {company.website && (
                                            <div className="flex items-start gap-4">
                                                <div className="bg-green-50 p-2.5 rounded-xl">
                                                    <Globe className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Website</p>
                                                    <a
                                                        href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 font-medium hover:underline truncate block max-w-[200px]"
                                                    >
                                                        {company.website}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default CompanyProfileView;
