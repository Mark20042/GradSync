import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Navbar from "../Navbar"; // Adjust import: src/pages/JobSeeker/components/skeletons/ -> src/pages/JobSeeker/components/Navbar.jsx

const CompanyProfileSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <div className="container mx-auto px-4 py-8 mt-16">
                <Skeleton width={80} height={24} className="mb-6" />

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Cover Skeleton */}
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                        <Skeleton height="100%" className="opacity-50" />
                    </div>

                    <div className="px-8 pb-12">
                        <div className="relative flex flex-col md:flex-row items-start md:items-end -mt-16 mb-8 gap-6">
                            {/* Logo Skeleton */}
                            <div className="relative">
                                <Skeleton width={128} height={128} borderRadius={16} className="border-4 border-white shadow-lg" />
                            </div>

                            {/* Basic Info Skeleton */}
                            <div className="flex-1 pt-2 md:pt-0 w-full">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                                    <Skeleton width={300} height={40} />
                                </div>
                                <div className="flex flex-wrap items-center gap-6">
                                    <Skeleton width={150} height={20} />
                                    <Skeleton width={150} height={20} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Main Content Skeleton */}
                            <div className="lg:col-span-2 space-y-10">
                                {/* About Skeleton */}
                                <section>
                                    <Skeleton width={120} height={32} className="mb-4" />
                                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                        <Skeleton count={4} />
                                    </div>
                                </section>

                                {/* Open Jobs Skeleton */}
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <Skeleton width={180} height={32} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex gap-4">
                                                        <Skeleton width={48} height={48} borderRadius={12} />
                                                        <div>
                                                            <Skeleton width={120} height={20} className="mb-1" />
                                                            <Skeleton width={80} height={16} />
                                                        </div>
                                                    </div>
                                                    <Skeleton width={24} height={24} />
                                                </div>
                                                <Skeleton width="100%" height={16} className="mb-2" />
                                                <div className="space-y-2 mt-4">
                                                    <Skeleton width={100} height={20} borderRadius={20} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Sidebar Skeleton */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
                                    <Skeleton width={160} height={24} className="mb-6" />
                                    <div className="space-y-5">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-start gap-4">
                                                <Skeleton width={40} height={40} borderRadius={12} />
                                                <div className="flex-1">
                                                    <Skeleton width={60} height={12} className="mb-1" />
                                                    <Skeleton width="90%" height={16} />
                                                </div>
                                            </div>
                                        ))}
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

export default CompanyProfileSkeleton;
