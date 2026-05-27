import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const NotificationListSkeleton = () => {
    return (
        <div className="divide-y divide-gray-50">
            {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 flex gap-3">
                    <Skeleton circle width={40} height={40} className="flex-shrink-0" />
                    <div className="flex-1">
                        <Skeleton width="60%" height={16} className="mb-2" />
                        <Skeleton width="90%" height={12} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationListSkeleton;
