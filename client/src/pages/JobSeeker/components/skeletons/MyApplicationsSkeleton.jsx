import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Navbar from "../Navbar"; // Adjust import path if needed, assuming relative to components folder

// Wait, the Navbar import in MyApplications.jsx is: import Navbar from "./components/Navbar";
// If I move this to src/pages/JobSeeker/components/skeletons/MyApplicationsSkeleton.jsx
// Navbar is in src/pages/JobSeeker/components/Navbar.jsx
// So import should be `import Navbar from "../Navbar";` (up one level to components)

const MyApplicationsSkeleton = () => {
    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden font-sans">
            <Navbar />

            <div className="flex-1 flex flex-col mt-16 overflow-hidden">
                <div className="flex-1 overflow-x-auto">
                    <div className="container mx-auto px-4 py-8 h-full flex flex-col min-w-[1024px]">
                        <div className="mb-6 flex-shrink-0 flex items-center justify-between">
                            <div>
                                <Skeleton width={200} height={32} className="mb-2" />
                                <Skeleton width={300} height={20} />
                            </div>
                            <Skeleton width={120} height={40} borderRadius={8} />
                        </div>

                        <div className="grid grid-cols-4 gap-6 flex-1 min-h-0">
                            {[1, 2, 3, 4].map((colIndex) => (
                                <div key={colIndex} className="flex flex-col h-full max-h-full">
                                    {/* Column Header Skeleton */}
                                    <div className="flex items-center justify-between p-4 rounded-t-xl border-b-2 border-gray-200 bg-white shadow-sm flex-shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Skeleton width={32} height={32} borderRadius={8} />
                                            <Skeleton width={80} height={24} />
                                        </div>
                                        <Skeleton width={24} height={24} circle />
                                    </div>

                                    {/* Column Content Skeleton */}
                                    <div className="flex-1 bg-gray-100/50 p-4 rounded-b-xl overflow-y-auto space-y-4 border border-t-0 border-gray-200 min-h-0">
                                        {[1, 2, 3].map((cardIndex) => (
                                            <div key={cardIndex} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                                <div className="flex items-start justify-between mb-3">
                                                    <Skeleton width={80} height={20} borderRadius={4} />
                                                    <Skeleton width={60} height={16} />
                                                </div>
                                                <Skeleton width="90%" height={20} className="mb-2" />
                                                <Skeleton width="60%" height={16} className="mb-3" />

                                                <div className="flex items-center gap-2 mb-3">
                                                    <Skeleton circle width={12} height={12} />
                                                    <Skeleton width={100} height={12} />
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-gray-50">
                                                    <Skeleton width={60} height={20} borderRadius={4} />
                                                </div>
                                            </div>
                                        ))}
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

export default MyApplicationsSkeleton;
