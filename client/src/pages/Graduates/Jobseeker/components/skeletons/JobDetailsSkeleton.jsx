import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Navbar from "../Navbar"; // Adjust import: src/pages/JobSeeker/components/skeletons/ -> src/pages/JobSeeker/components/Navbar.jsx

const JobDetailsSkeleton = () => (
    <div className="bg-gray-50 min-h-screen font-sans">
        <Navbar />
        {/* Hero Skeleton */}
        <div className="bg-white border-b border-gray-200 pt-24 pb-8">
            <div className="container mx-auto px-4">
                <Skeleton width={100} height={20} className="mb-6" />

                <div className="flex flex-col md:flex-row items-start gap-6">
                    <Skeleton width={96} height={96} borderRadius={16} />
                    <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="space-y-3 w-full max-w-lg">
                                <Skeleton width="60%" height={32} />
                                <div className="flex gap-4">
                                    <Skeleton width={80} height={24} />
                                    <Skeleton width={100} height={24} />
                                    <Skeleton width={120} height={24} />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Skeleton width={120} height={48} borderRadius={12} />
                                <Skeleton width={140} height={48} borderRadius={12} />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <Skeleton width={80} height={32} borderRadius={8} />
                            <Skeleton width={80} height={32} borderRadius={8} />
                            <Skeleton width={120} height={32} borderRadius={8} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column Skeleton */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Bar Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Skeleton height={80} borderRadius={16} />
                        <Skeleton height={80} borderRadius={16} />
                        <Skeleton height={80} borderRadius={16} />
                    </div>

                    <Skeleton height={200} borderRadius={16} />
                    <Skeleton height={200} borderRadius={16} />
                </div>

                {/* Right Column Skeleton */}
                <div className="space-y-6">
                    <Skeleton height={200} borderRadius={16} />
                    <Skeleton height={150} borderRadius={16} />
                </div>
            </div>
        </div>
    </div>
);

export default JobDetailsSkeleton;
