import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const UserProfileSkeleton = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <Skeleton width={100} height={24} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Skeleton */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-6 text-center md:text-left">
                            <Skeleton circle width={128} height={128} className="shadow-xl mb-4 md:mb-0" />
                            <div className="space-y-3">
                                <Skeleton width={250} height={40} />
                                <Skeleton width={150} height={24} />
                                <div className="flex justify-center md:justify-start gap-3 mt-2">
                                    <Skeleton width={24} height={24} circle />
                                    <Skeleton width={24} height={24} circle />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 w-full lg:w-auto justify-center lg:justify-end">
                            <Skeleton width={160} height={48} borderRadius={12} />
                            <Skeleton width={160} height={48} borderRadius={12} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Sidebar Skeleton */}
                    <div className="xl:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8 border border-gray-100">
                            <Skeleton width={140} height={24} className="mb-6" />
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <Skeleton key={i} height={40} borderRadius={8} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Skeleton */}
                    <div className="xl:col-span-3 space-y-8">
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-6">
                                <Skeleton circle width={32} height={32} />
                                <Skeleton width={200} height={32} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <Skeleton circle width={24} height={24} />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton width={60} height={16} />
                                            <Skeleton width="80%" height={24} />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Skeleton circle width={24} height={24} />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton width={60} height={16} />
                                            <Skeleton width="80%" height={24} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <Skeleton circle width={24} height={24} />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton width={60} height={16} />
                                            <Skeleton width="80%" height={24} />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Skeleton circle width={24} height={24} />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton width={60} height={16} />
                                            <Skeleton width="80%" height={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resume Section Skeleton */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <Skeleton circle width={24} height={24} />
                                <Skeleton width={100} height={24} />
                            </div>
                            <Skeleton height={50} borderRadius={12} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileSkeleton;
