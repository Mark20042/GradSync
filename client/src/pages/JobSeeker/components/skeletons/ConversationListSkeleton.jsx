import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Navbar from "../Navbar"; // Adjust import path: src/pages/JobSeeker/components/skeletons/ -> src/pages/JobSeeker/components/Navbar.jsx is ONE level up

const ConversationListSkeleton = () => {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar />
            <div className="container mx-auto pt-24 px-4 pb-12 max-w-4xl">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Skeleton width={180} height={32} className="mb-2" />
                        <Skeleton width={280} height={20} />
                    </div>
                    <Skeleton width={140} height={40} borderRadius={12} />
                </div>

                {/* Content Card Skeleton */}
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden min-h-[500px]">
                    <div className="divide-y divide-gray-50">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-5">
                                <div className="flex items-start gap-4">
                                    {/* Avatar Skeleton */}
                                    <Skeleton width={56} height={56} borderRadius={16} />

                                    {/* Content Skeleton */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <Skeleton width={150} height={20} />
                                            <Skeleton width={80} height={16} />
                                        </div>

                                        <Skeleton width={120} height={16} className="mb-2" />
                                        <Skeleton width="90%" height={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationListSkeleton;
