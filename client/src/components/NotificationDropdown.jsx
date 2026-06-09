import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, MessageSquare, Briefcase, Info, User } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATH } from "../utils/apiPath";
import { useAuth } from "../context/AuthContext";
import moment from "moment";
import NotificationListSkeleton from "../pages/Graduates/Jobseeker/components/skeletons/NotificationListSkeleton";

const NotificationDropdown = ({ onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndMarkRead = async () => {
            try {
                // Fetch notifications
                const response = await axiosInstance.get(API_PATH.NOTIFICATIONS.GET_ALL);
                setNotifications(response.data);
                
                // If there are unread notifications, mark them all as read in the backend silently
                const hasUnread = response.data.some(n => !n.isRead);
                if (hasUnread) {
                    await axiosInstance.put(API_PATH.NOTIFICATIONS.MARK_ALL_READ);
                    window.dispatchEvent(new CustomEvent('notificationReadAll'));
                }
            } catch (error) {
                console.error("Error with notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAndMarkRead();
    }, []);

    const handleNotificationClick = async (notification) => {

        if (notification.type === "MESSAGE") {
            if (user?.role === "employer") {
                navigate("/employer-messages");
            } else {
                navigate("/messages"); 
            }
        } else if (notification.type === "MATCH") {
            // Navigate to job details (for job seekers)
            navigate(`job/${notification.relatedId}`);
        } else if (notification.type === "APPLICATION") {
            if (user?.role === "employer") {
                navigate("/applicants", { state: { applicationId: notification.relatedId } });
            } else {
                navigate("/my-applications");
            }
        }

        onClose();
    };

    const filteredNotifications = notifications.filter((n) => n.type !== "MESSAGE");

    const unreadCount = notifications.filter((n) => !n.isRead && n.type !== "MESSAGE").length;

    return (
        <div className="w-full max-w-sm sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                    <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                        {unreadCount} New
                    </span>
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

                            {/* Removed individual mark as read button */}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
