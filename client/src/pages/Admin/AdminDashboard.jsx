import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Users, Briefcase, FileText, CheckCircle, XCircle, Clock, Send } from "lucide-react";

const AnimatedNumber = ({ value, duration = 2500 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value);
        if (start === end) return;

        const incrementTime = duration / end;
        const timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start >= end) clearInterval(timer);
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count}</span>;
};

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axiosInstance.get(API_PATH.ADMIN.ANALYTICS);
                setAnalytics(response.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <DashboardLayout activeMenu="admin-dashboard">
                <LoadingSpinner />
            </DashboardLayout>
        );
    }

    if (!analytics) return null;

    const { counts, jobCategories } = analytics;

    const mainStats = [
        {
            title: "Total Users",
            value: counts.totalUsers,
            icon: Users,
            color: "bg-blue-500",
            gradient: "from-blue-500 to-blue-600",
            subtext: `${counts.totalGraduates} Grads, ${counts.totalEmployers} Employers`,
        },
        {
            title: "Total Jobs",
            value: counts.totalJobs,
            icon: Briefcase,
            color: "bg-green-500",
            gradient: "from-green-500 to-green-600",
            subtext: `${counts.activeJobs} Active`,
        },
        {
            title: "Total Applications",
            value: counts.totalApplications,
            icon: FileText,
            color: "bg-purple-500",
            gradient: "from-purple-500 to-purple-600",
            subtext: "All submissions",
        },
    ];

    const applicationStats = [
        {
            title: "Hired",
            value: counts.hiredApplications || 0,
            icon: CheckCircle,
            color: "bg-emerald-500",
            gradient: "from-emerald-500 to-emerald-600",
            subtext: "Accepted applications",
        },
        {
            title: "Rejected",
            value: counts.firedApplications || 0,
            icon: XCircle,
            color: "bg-red-500",
            gradient: "from-red-500 to-red-600",
            subtext: "Rejected applications",
        },
        {
            title: "Pending",
            value: counts.pendingApplications || 0,
            icon: Clock,
            color: "bg-amber-500",
            gradient: "from-amber-500 to-amber-600",
            subtext: "In review",
        },
        {
            title: "Applied",
            value: counts.appliedApplications || 0,
            icon: Send,
            color: "bg-indigo-500",
            gradient: "from-indigo-500 to-indigo-600",
            subtext: "New applications",
        },
    ];

    const pieData = [
        { name: "Graduates", value: counts.totalGraduates },
        { name: "Employers", value: counts.totalEmployers },
    ];

    const COLORS = ["#3B82F6", "#10B981"];

    const StatCard = ({ stat }) => {
        const Icon = stat.icon;
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-gray-900 tracking-tight">
                        <AnimatedNumber value={stat.value} />
                    </span>
                </div>
                <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">{stat.title}</h3>
                <p className="text-sm text-gray-400 mt-1 font-medium">{stat.subtext}</p>
            </div>
        );
    };

    return (
        <DashboardLayout activeMenu="admin-dashboard">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Administrator Dashboard
                </h1>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {mainStats.map((stat, index) => (
                        <StatCard key={index} stat={stat} />
                    ))}
                </div>

                {/* Application Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {applicationStats.map((stat, index) => (
                        <StatCard key={index} stat={stat} />
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Job Categories Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-6">
                            Jobs by Category
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={jobCategories}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* User Distribution Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-6">
                            User Distribution
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Users Table */}
                <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        Recent Registrations
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wider w-1/4 pl-4">Name</th>
                                    <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wider w-1/3">Email</th>
                                    <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wider w-1/6">Role</th>
                                    <th className="pb-4 pt-2 font-semibold text-gray-400 text-xs uppercase tracking-wider w-1/4 text-right pr-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {analytics.recentUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50/80 transition-colors duration-200 group">
                                        <td className="py-4 pl-4 font-semibold text-gray-900 truncate max-w-xs pr-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${user.role === 'employer' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                                                    {user.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="truncate">{user.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-gray-500 truncate max-w-xs pr-4 text-sm font-medium">{user.email}</td>
                                        <td className="py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold inline-block shadow-sm ${user.role === "employer"
                                                    ? "bg-purple-50 text-purple-700 border border-purple-100"
                                                    : "bg-blue-50 text-blue-700 border border-blue-100"
                                                    }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 text-gray-400 text-right pr-4 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
