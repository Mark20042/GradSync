import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ArrowLeft } from "lucide-react";

const ResumeBuilderSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            {/* Toolbar Skeleton */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center px-4">
                <div className="flex items-center gap-2 text-gray-400">
                    <ArrowLeft className="w-5 h-5" />
                    <Skeleton width={100} />
                </div>
                <div className="flex gap-4">
                    {/* Buttons */}
                    <Skeleton width={140} height={40} borderRadius={8} />
                    <Skeleton width={180} height={40} borderRadius={8} />
                </div>
            </div>

            {/* Resume Page Skeleton */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-xl min-h-[297mm] p-[15mm] md:p-[20mm]">
                {/* Header */}
                <header className="border-b-2 border-gray-100 pb-6 mb-8">
                    <Skeleton height={40} width="60%" className="mb-4" />
                    <div className="flex flex-wrap gap-6">
                        <Skeleton width={150} />
                        <Skeleton width={150} />
                        <Skeleton width={150} />
                        <Skeleton width={150} />
                    </div>
                </header>

                {/* Summary */}
                <section className="mb-8">
                    <Skeleton width={200} height={24} className="mb-3" />
                    <Skeleton count={3} />
                </section>

                {/* Experience */}
                <section className="mb-8">
                    <Skeleton width={180} height={24} className="mb-4" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="mb-6">
                            <div className="flex justify-between mb-2">
                                <Skeleton width={250} height={20} />
                                <Skeleton width={120} />
                            </div>
                            <div className="flex justify-between mb-2">
                                <Skeleton width={150} />
                                <Skeleton width={100} />
                            </div>
                            <Skeleton count={2} />
                        </div>
                    ))}
                </section>

                {/* Education */}
                <section className="mb-8">
                    <Skeleton width={150} height={24} className="mb-4" />
                    <div className="mb-4">
                        <div className="flex justify-between mb-2">
                            <Skeleton width={200} height={20} />
                            <Skeleton width={100} />
                        </div>
                        <Skeleton width={180} />
                    </div>
                </section>

                {/* Skills */}
                <section className="mb-8">
                    <Skeleton width={120} height={24} className="mb-3" />
                    <div className="flex flex-wrap gap-2">
                        <Skeleton width={80} />
                        <Skeleton width={100} />
                        <Skeleton width={60} />
                        <Skeleton width={90} />
                        <Skeleton width={70} />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ResumeBuilderSkeleton;
