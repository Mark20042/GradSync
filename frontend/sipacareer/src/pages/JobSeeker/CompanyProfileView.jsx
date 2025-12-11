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

} from "lucide-react";
import { motion } from "framer-motion";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import Navbar from "./components/Navbar";
import JobCard from "../../components/Cards/JobCard";
import toast from "react-hot-toast";

const CompanyProfileView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch company profile
                const companyRes = await axiosInstance.get(API_PATH.USERS.GET_PUBLIC_PROFILE(id));
                setCompany(companyRes.data);

                // Fetch company's open jobs
                const jobsRes = await axiosInstance.get(API_PATH.JOBS.GET_ALL_JOBS, {
                    params: { company: id },
                });
                setJobs(jobsRes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load company profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);



    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </div>
        );
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

            <div className="container mx-auto px-4 py-8 mt-16">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back</span>
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Hero / Cover */}
                    <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    <div className="px-8 pb-12">
                        <div className="relative flex flex-col md:flex-row items-start md:items-end -mt-16 mb-8 gap-6">
                            {/* Logo */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative"
                            >
                                {company.companyLogo ? (
                                    <img
                                        src={company.companyLogo}
                                        alt={company.companyName}
                                        className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-white"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg bg-white flex items-center justify-center text-gray-400">
                                        <Building2 className="w-12 h-12" />
                                    </div>
                                )}
                                {/* Verified Badge (Optional - if you have verification logic) */}
                                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Verified Company">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                            </motion.div>

                            {/* Basic Info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex-1 pt-2 md:pt-0"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                                    <h1 className="text-4xl font-bold text-gray-900">
                                        {company.companyName || company.fullName}
                                    </h1>

                                </div>
                                <div className="flex flex-wrap items-center gap-6 text-gray-600">
                                    {company.address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            {company.address}
                                        </div>
                                    )}
                                    {company.website && (
                                        <a
                                            href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
                                        >
                                            <Globe className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                            Visit Website
                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    )}
                                </div>
                            </motion.div>

                            {/* Action Buttons (Optional) */}
                            <div className="flex gap-3 mt-4 md:mt-0">
                                {/* Add Follow or Message buttons here if needed */}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
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
                                                    onToggleSave={() => { }} // Implement save logic if needed, or pass dummy
                                                    saved={job.isSaved}
                                                    onApply={() => navigate(`/job/${job._id}`)}
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
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
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
        </div>
    );
};

export default CompanyProfileView;
