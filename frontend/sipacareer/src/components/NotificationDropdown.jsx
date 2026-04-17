import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, MessageSquare, Briefcase, Info, User } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATH } from "../utils/apiPath";
import { useAuth } from "../context/AuthContext";
import moment from "moment";
import NotificationListSkeleton from "../pages/JobSeeker/components/skeletons/NotificationListSkeleton";

const NotificationDropdown = ({ onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL"); // ALL, MESSAGE, MATCH, APPLICATION

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axiosInstance.get(API_PATH.NOTIFICATIONS.GET_ALL);
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await axiosInstance.put(API_PATH.NOTIFICATIONS.MARK_READ(id));
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await handleMarkAsRead(notification._id, { stopPropagation: () => { } });
        }

        if (notification.type === "MESSAGE") {
            // Navigate to chat based on user role
            const messagesRoute = user?.role === "employer" ? "/employer-messages" : "/messages";
            navigate(messagesRoute, { state: { conversationId: notification.relatedId } });
        } else if (notification.type === "MATCH") {
            // Navigate to job details (for job seekers)
            navigate(`job/${notification.relatedId}`);
        } else if (notification.type === "APPLICATION") {
            // Navigate to applicants page (for employers)
            navigate("/applicants", { state: { applicationId: notification.relatedId } });
        }

        onClose();
    };

    const filteredNotifications = notifications.filter((n) => {
        if (filter === "ALL") return true;
        return n.type === filter;
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                    <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                        {unreadCount} New
                    </span>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex p-2 gap-2 border-b border-gray-100">
                {user?.role === "employer" ? (
                    // Employer sees: All, Messages, Applicants
                    ["ALL", "MESSAGE", "APPLICATION"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === type
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            {type === "ALL" ? "All" : type === "MESSAGE" ? "Messages" : "Applicants"}
                        </button>
                    ))
                ) : (
                    // Job Seekers see: All, Messages, Jobs
                    ["ALL", "MESSAGE", "MATCH"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === type
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            {type === "ALL" ? "All" : type === "MESSAGE" ? "Messages" : "Jobs"}
                        </button>
                    ))
                )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                    <NotificationListSkeleton />
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                        <Bell className="w-8 h-8 text-gray-300 mb-2" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors relative group ${!notification.isRead ? "bg-blue-50/30" : ""
                                }`}
                        >
                            <div className="flex gap-3">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === "MESSAGE"
                                        ? "bg-green-100 text-green-600"
                                        : notification.type === "MATCH"
                                            ? "bg-purple-100 text-purple-600"
                                            : notification.type === "APPLICATION"
                                                ? "bg-blue-100 text-blue-600"
                                                : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {notification.type === "MESSAGE" ? (
                                        <MessageSquare className="w-5 h-5" />
                                    ) : notification.type === "MATCH" ? (
                                        <Briefcase className="w-5 h-5" />
                                    ) : notification.type === "APPLICATION" ? (
                                        <User className="w-5 h-5" />
                                    ) : (
                                        <Info className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4
                                            className={`text-sm font-semibold truncate pr-2 ${!notification.isRead ? "text-gray-900" : "text-gray-700"
                                                }`}
                                        >
                                            {notification.title}
                                        </h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {moment(notification.createdAt).fromNow(true)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2 leading-snug">
                                        {notification.message}
                                    </p>
                                </div>
                            </div>

                            {!notification.isRead && (
                                <button
                                    onClick={(e) => handleMarkAsRead(notification._id, e)}
                                    className="absolute right-2 bottom-2 p-1.5 text-blue-600 opacity-0 group-hover:opacity-100 hover:bg-blue-100 rounded-full transition-all"
                                    title="Mark as read"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
