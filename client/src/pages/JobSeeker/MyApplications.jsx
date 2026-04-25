import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Briefcase,
    Calendar,
    MapPin,
    Building2,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader,
    Search,
    Filter,
    ArrowLeft
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import Navbar from "./components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import MyApplicationsSkeleton from "./components/skeletons/MyApplicationsSkeleton";

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(API_PATH.APPLICATIONS.GET_MY_APPLICATIONS);
            setApplications(response.data);
        } catch (err) {
            console.error("Error fetching applications:", err);
            setError("Failed to load applications.");
        } finally {
            setLoading(false);
        }
    };

    // Group applications by status
    const columns = {
        Applied: applications.filter((app) => app.status === "Applied"),
        "In Review": applications.filter((app) => app.status === "In Review"),
        Accepted: applications.filter((app) => app.status === "Accepted"),
        Rejected: applications.filter((app) => app.status === "Rejected"),
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Applied":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "In Review":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "Accepted":
                return "bg-green-100 text-green-700 border-green-200";
            case "Rejected":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Applied":
                return <Clock className="w-4 h-4" />;
            case "In Review":
                return <Search className="w-4 h-4" />;
            case "Accepted":
                return <CheckCircle className="w-4 h-4" />;
            case "Rejected":
                return <XCircle className="w-4 h-4" />;
            default:
                return <Briefcase className="w-4 h-4" />;
        }
    };


    if (loading) {
        return <MyApplicationsSkeleton />;
    }

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <Navbar />

            <div className="flex-1 flex flex-col mt-16 overflow-hidden">
                <div className="flex-1 overflow-x-auto">
                    <div className="container mx-auto px-4 py-8 h-full flex flex-col min-w-[1024px]">
                        <div className="mb-6 flex-shrink-0 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
                                <p className="text-gray-600">Track the status of your job applications</p>
                            </div>
                            <button
                                onClick={() => navigate("/find-jobs")}
                                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Jobs
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 flex-shrink-0">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-4 gap-6 flex-1 min-h-0">
                            {Object.entries(columns).map(([status, apps]) => (
                                <div key={status} className="flex flex-col h-full max-h-full">
                                    {/* Column Header */}
                                    <div className={`flex items-center justify-between p-4 rounded-t-xl border-b-2 bg-white shadow-sm flex-shrink-0 ${status === "Applied" ? "border-blue-500" :
                                        status === "In Review" ? "border-yellow-500" :
                                            status === "Accepted" ? "border-green-500" :
                                                "border-red-500"
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg ${getStatusColor(status)} bg-opacity-20`}>
                                                {getStatusIcon(status)}
                                            </div>
                                            <h3 className="font-semibold text-gray-900">{status}</h3>
                                        </div>
                                        <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                            {apps.length}
                                        </span>
                                    </div>

                                    {/* Column Content */}
                                    <div className="flex-1 bg-gray-100/50 p-4 rounded-b-xl overflow-y-auto space-y-4 border border-t-0 border-gray-200 min-h-0">
                                        {apps.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400 text-sm">
                                                No applications
                                            </div>
                                        ) : (
                                            apps.map((app) => (
                                                <motion.div
                                                    key={app._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                                                    onClick={() => app.job && navigate(`/job/${app.job._id}`)}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                            {app.job?.company?.companyName || app.job?.company?.fullName || "Company"}
                                                        </div>
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(app.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                        {app.job?.title || "Deleted Job"}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                                                        {app.job?.company?.companyName || app.job?.company?.fullName || "Company"}
                                                    </p>

                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <MapPin className="w-3 h-3" />
                                                        <span className="line-clamp-1">{app.job?.location || "Unknown Location"}</span>
                                                    </div>

                                                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                                                        {app.job?.type && (
                                                            <span className={`text-xs px-2 py-1 rounded-md font-medium ${getStatusColor(status)} bg-opacity-10`}>
                                                                {app.job.type}
                                                            </span>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyApplications;
