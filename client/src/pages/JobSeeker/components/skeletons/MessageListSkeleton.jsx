import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const MessageListSkeleton = () => {
    return (
        <div className="w-full flex flex-col space-y-6 pt-4">
            {/* Received Message Skeleton */}
            <div className="flex justify-start">
                <div className="flex items-end gap-3 max-w-[85%]">
                    <Skeleton circle width={32} height={32} />
                    <div className="bg-white p-4 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 min-w-[200px]">
                        <Skeleton width="100%" count={2} />
                        <Skeleton width="60%" className="mt-2" />
                    </div>
                </div>
            </div>

            {/* Sent Message Skeleton */}
            <div className="flex justify-end">
                <div className="flex items-end gap-3 max-w-[85%] flex-row-reverse">
                    <Skeleton circle width={32} height={32} />
                    <div className="bg-blue-600/5 p-4 rounded-2xl rounded-br-sm shadow-sm min-w-[180px]">
                        <Skeleton width="100%" />
                        <Skeleton width="40%" className="mt-2" />
                    </div>
                </div>
            </div>

            {/* Received Message Skeleton */}
            <div className="flex justify-start">
                <div className="flex items-end gap-3 max-w-[85%]">
                    <Skeleton circle width={32} height={32} />
                    <div className="bg-white p-4 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 min-w-[250px]">
                        <Skeleton width="100%" count={3} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageListSkeleton;
