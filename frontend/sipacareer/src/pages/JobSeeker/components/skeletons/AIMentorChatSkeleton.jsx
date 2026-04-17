import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Bot } from "lucide-react";

const AIMentorChatSkeleton = () => {
    return (
        <div className="flex justify-start">
            <div className="flex items-end gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 min-w-[200px]">
                    <Skeleton count={2.5} />
                </div>
            </div>
        </div>
    );
};

export default AIMentorChatSkeleton;
