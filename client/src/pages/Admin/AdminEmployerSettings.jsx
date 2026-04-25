import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Search, Settings, Building2, Eye, Plus } from "lucide-react";
import toast from "react-hot-toast";
import AdminModal from "../../components/Admin/AdminModal";
import ScheduleSelector from "react-schedule-selector";
import { startOfWeek, addDays, format, getHours, setHours, setMinutes, startOfDay } from "date-fns";

const AdminEmployerSettings = () => {
    const [settingsList, setSettingsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingSettings, setEditingSettings] = useState(null);
    const [viewingSettings, setViewingSettings] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [employers, setEmployers] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const REFERENCE_START_DATE = new Date("2024-01-01T00:00:00");

    const convertBusinessHoursToSchedule = (businessHours) => {
        const newSchedule = [];
        const daysMap = {
            monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6
        };

        Object.entries(businessHours).forEach(([dayName, hours]) => {
            if (hours.isOpen && daysMap[dayName] !== undefined) {
                const dayIndex = daysMap[dayName];
                const startHour = parseInt(hours.start.split(":")[0]);
                const endHour = parseInt(hours.end.split(":")[0]);
                const dayDate = addDays(REFERENCE_START_DATE, dayIndex);

                for (let h = startHour; h < endHour; h++) {
                    const slot = setHours(startOfDay(dayDate), h);
                    newSchedule.push(slot);
                }
            }
        });
        return newSchedule;
    };

    const convertScheduleToBusinessHours = (currentSchedule) => {
        const businessHours = {
            monday: { isOpen: false, start: "09:00", end: "17:00" },
            tuesday: { isOpen: false, start: "09:00", end: "17:00" },
            wednesday: { isOpen: false, start: "09:00", end: "17:00" },
            thursday: { isOpen: false, start: "09:00", end: "17:00" },
            friday: { isOpen: false, start: "09:00", end: "17:00" },
            saturday: { isOpen: false, start: "09:00", end: "17:00" },
            sunday: { isOpen: false, start: "09:00", end: "17:00" },
        };
        const daysMap = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        const hoursByDay = {};

        currentSchedule.forEach(date => {
            const diffTime = Math.abs(date - REFERENCE_START_DATE);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 6) {
                const dayName = daysMap[diffDays];
                if (!hoursByDay[dayName]) hoursByDay[dayName] = [];
                hoursByDay[dayName].push(getHours(date));
            }
        });

        Object.entries(hoursByDay).forEach(([dayName, hours]) => {
            if (hours.length > 0) {
                const min = Math.min(...hours);
                const max = Math.max(...hours);
                businessHours[dayName] = {
                    isOpen: true,
                    start: `${min.toString().padStart(2, '0')}:00`,
                    end: `${(max + 1).toString().padStart(2, '0')}:00`
                };
            }
        });
        return businessHours;
    };



    useEffect(() => {
        fetchSettings();
        fetchEmployers();
    }, []);

    const fetchEmployers = async () => {
        try {
            const response = await axiosInstance.get(API_PATH.ADMIN.USERS);
            // Filter only employers who don't have settings yet? 
            // Or just list all employers. For now, list all employers.
            // Ideally backend should filter, but let's filter client side for now if needed.
            const allEmployers = response.data.filter(u => u.role === 'employer');
            setEmployers(allEmployers);
        } catch (error) {
            console.error("Error fetching employers:", error);
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await axiosInstance.get(API_PATH.ADMIN.EMPLOYER_SETTINGS);
            setSettingsList(response.data);
        } catch (error) {
            console.error("Error fetching employer settings:", error);
            toast.error("Failed to fetch employer settings");
        } finally {
            setLoading(false);
        }
    };

    const handleView = (settings) => {
        setViewingSettings(settings);
        setShowViewModal(true);
    };

    const handleEdit = (settings) => {
        setEditingSettings({ ...settings });
        if (settings.businessHours) {
            setSchedule(convertBusinessHoursToSchedule(settings.businessHours));
        } else {
            setSchedule([]);
        }
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingSettings({
            user: "", // To be selected
            timezone: "UTC",
            businessHours: {}, // Will be set from schedule on submit
            autoReplyMessage: ""
        });
        setSchedule([]);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const businessHours = convertScheduleToBusinessHours(schedule);
            const payload = { ...editingSettings, businessHours };

            if (editingSettings._id) {
                const response = await axiosInstance.put(API_PATH.ADMIN.UPDATE_EMPLOYER_SETTINGS(editingSettings._id), payload);
                setSettingsList(settingsList.map((s) => (s._id === editingSettings._id ? response.data : s)));
                toast.success("Settings updated successfully");
            } else {
                const response = await axiosInstance.post(API_PATH.ADMIN.CREATE_EMPLOYER_SETTINGS, payload);
                setSettingsList([...settingsList, response.data]);
                toast.success("Settings created successfully");
            }
            setShowModal(false);
            setEditingSettings(null);
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error(error.response?.data?.message || "Failed to save settings");
        }
    };

    const filteredSettings = settingsList.filter(
        (s) =>
            s.user?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <DashboardLayout activeMenu="admin-employer-settings">
                <LoadingSpinner />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeMenu="admin-employer-settings">
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Employer Settings</h1>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search employers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </div>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="w-5 h-5" />
                            Add Settings
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider pl-8">Company</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Timezone</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Business Hours</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Auto-Reply</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider text-center pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredSettings.map((settings) => (
                                <tr key={settings._id} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                                    <td className="px-6 py-5 pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                                <Building2 className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {settings.user?.companyName || "Unknown"}
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium">{settings.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-gray-600 font-medium">
                                        {settings.timezone}
                                    </td>
                                    <td className="px-6 py-5 text-gray-600 text-sm">
                                        {settings.businessHours?.monday?.start} - {settings.businessHours?.monday?.end}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold inline-block shadow-sm ${settings.autoReplyMessage
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                : "bg-gray-50 text-gray-500 border border-gray-100"
                                                }`}
                                        >
                                            {settings.autoReplyMessage ? "Enabled" : "Disabled"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleView(settings)}
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:scale-110"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(settings)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                                                title="Edit Settings"
                                            >
                                                <Settings className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSettings.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                        <div className="flex flex-col items-center gap-3">
                                            <Building2 className="w-12 h-12 text-gray-300" />
                                            <p>No employer settings found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit/Add Settings Modal */}
            <AdminModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingSettings?._id ? "Edit Employer Settings" : "Add Employer Settings"}
            >
                {editingSettings && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!editingSettings._id && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employer</label>
                                <select
                                    value={editingSettings.user}
                                    onChange={(e) => setEditingSettings({ ...editingSettings, user: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select Employer</option>
                                    {employers.map(emp => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.companyName} ({emp.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                            <input
                                type="text"
                                value={editingSettings.timezone}
                                onChange={(e) => setEditingSettings({ ...editingSettings, timezone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Availability</label>
                            <div className="border border-gray-200 rounded-lg p-4 overflow-auto">
                                <ScheduleSelector
                                    selection={schedule}
                                    numDays={7}
                                    minTime={0}
                                    maxTime={23}
                                    startDate={REFERENCE_START_DATE}
                                    dateFormat="ddd"
                                    hourlyChunkSize={60}
                                    onChange={setSchedule}
                                    selectedColor="#3b82f6"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Reply Message</label>
                            <textarea
                                value={editingSettings.autoReplyMessage || ""}
                                onChange={(e) => setEditingSettings({ ...editingSettings, autoReplyMessage: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 resize-none"
                                placeholder="Leave empty to disable"
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-200"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </AdminModal>

            {/* View Settings Modal */}
            <AdminModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                title="Employer Settings Details"
            >
                {viewingSettings && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{viewingSettings.user?.companyName}</h3>
                                <p className="text-sm text-gray-600">{viewingSettings.user?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Timezone</h3>
                                <p className="text-gray-900 font-medium">{viewingSettings.timezone}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Business Hours</h3>
                            <div className="space-y-2">
                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                                    const dayData = viewingSettings.businessHours?.[day];
                                    const isOpen = dayData?.isOpen;
                                    return (
                                        <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <span className="font-medium text-gray-700 capitalize w-24">{day}</span>
                                            {isOpen && dayData?.start && dayData?.end ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Open</span>
                                                    <span className="text-gray-900 font-mono">{dayData.start}</span>
                                                    <span className="text-gray-400">-</span>
                                                    <span className="text-gray-900 font-mono">{dayData.end}</span>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">Closed</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Auto-Reply Message</h3>
                            <div className="p-4 bg-white border border-gray-200 rounded-xl">
                                {viewingSettings.autoReplyMessage ? (
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{viewingSettings.autoReplyMessage}</p>
                                ) : (
                                    <span className="text-gray-400 italic flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                        Auto-reply is disabled
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>Last Updated</span>
                                <span className="font-medium text-gray-900">{new Date(viewingSettings.updatedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}
            </AdminModal>
        </DashboardLayout>
    );
};

export default AdminEmployerSettings;
