import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Navbar from "../Navbar"; // Adjust import: src/pages/JobSeeker/components/skeletons/ -> src/pages/JobSeeker/components/Navbar.jsx

const SavedJobsSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 mt-16">
                <div className="flex items-center mb-8">
                    <Skeleton circle width={48} height={48} className="mr-4" />
                    <Skeleton width={200} height={32} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-full flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4">
                                    <Skeleton width={56} height={56} borderRadius={16} />
                                    <div>
                                        <Skeleton width={140} height={20} className="mb-1" />
                                        <Skeleton width={100} height={16} />
                                    </div>
                                </div>
                                <Skeleton width={24} height={24} />
                            </div>

                            <div className="mb-4 space-y-2">
                                <Skeleton width="90%" height={16} />
                                <Skeleton width="60%" height={16} />
                            </div>

                            <div className="flex flex-wrap gap-2 mt-auto mb-4">
                                <Skeleton width={80} height={24} borderRadius={20} />
                                <Skeleton width={80} height={24} borderRadius={20} />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-50">
                                <Skeleton width="100%" height={40} borderRadius={12} />
                                <Skeleton width="100%" height={40} borderRadius={12} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SavedJobsSkeleton;
