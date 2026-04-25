import React, { useState, useEffect } from "react";
import ScheduleSelector from "react-schedule-selector";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import toast from "react-hot-toast";
import { startOfWeek, addDays, format, getHours, setHours, setMinutes, startOfDay } from "date-fns";

const AvailabilityScheduler = () => {
    const [schedule, setSchedule] = useState([]);
    const [autoReplyMessage, setAutoReplyMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState("");
    const [jobAutoReplyMessage, setJobAutoReplyMessage] = useState("");

    // Use a fixed reference week for consistency (e.g., first week of 2024 which starts on a Monday)
    // Jan 1, 2024 was a Monday.
    const REFERENCE_START_DATE = new Date("2024-01-01T00:00:00");

    useEffect(() => {
        fetchSettings();
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axiosInstance.get(API_PATH.JOBS.GET_JOBS_EMPLOYER);
            setJobs(res.data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const handleJobSelect = (jobId) => {
        setSelectedJobId(jobId);
        if (jobId) {
            const job = jobs.find(j => j._id === jobId);
            setJobAutoReplyMessage(job?.autoReplyMessage || "");
        }
    };

    const handleSaveJobReply = async () => {
        if (!selectedJobId) return;
        try {
            // We need an endpoint to update just the job's autoReplyMessage. 
            // Re-using UPDATE_JOB might require sending all fields if the backend isn't partial-update friendly.
            // Assuming standard PUT/PATCH behavior or we fetch-modify-save.
            // Let's assume we can send partial update or we have the full job object.

            const job = jobs.find(j => j._id === selectedJobId);
            if (!job) return;

            const payload = { ...job, autoReplyMessage: jobAutoReplyMessage };
            // Remove populated fields if any to avoid errors (like company object vs ID)
            if (payload.company && typeof payload.company === 'object') payload.company = payload.company._id;

            await axiosInstance.put(API_PATH.JOBS.UPDATE_JOB(selectedJobId), payload);

            // Update local state
            setJobs(jobs.map(j => j._id === selectedJobId ? { ...j, autoReplyMessage: jobAutoReplyMessage } : j));
            toast.success("Job auto-reply saved");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save job reply");
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await axiosInstance.get(API_PATH.EMPLOYER.SETTINGS);
            const { businessHours, autoReplyMessage } = res.data;

            setAutoReplyMessage(autoReplyMessage || "");
            if (businessHours) {
                setSchedule(convertBusinessHoursToSchedule(businessHours));
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

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

                // Create date objects for each hour block
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

        // Group hours by day
        const hoursByDay = {};

        currentSchedule.forEach(date => {
            // Calculate day index relative to reference start date
            // This is safer than getDay() because of timezone potential issues if not careful,
            // but since we use the same reference, getDay() on the date object should work relative to local time if consistent.
            // Actually, let's just use getDay() but map 0 (Sunday) to 6, 1 (Monday) to 0 etc if needed.
            // But wait, Jan 1 2024 is Monday.
            // date.getDay() -> 1 (Monday).
            // Our daysMap array is 0=Monday? No, usually 0=Sunday.
            // Let's rely on the difference in days.

            const diffTime = Math.abs(date - REFERENCE_START_DATE);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            // This diffDays should be 0 for Monday, 1 for Tuesday...

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
                // End time is max hour + 1 (e.g. 16:00 slot ends at 17:00)

                businessHours[dayName] = {
                    isOpen: true,
                    start: `${min.toString().padStart(2, '0')}:00`,
                    end: `${(max + 1).toString().padStart(2, '0')}:00`
                };
            }
        });

        return businessHours;
    };

    const handleSave = async () => {
        try {
            const businessHours = convertScheduleToBusinessHours(schedule);

            await axiosInstance.put(API_PATH.EMPLOYER.SETTINGS, {
                autoReplyMessage,
                businessHours
            });
            toast.success("Settings saved");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Auto-Reply Message</h3>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Context</label>
                    <select
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedJobId}
                        onChange={(e) => handleJobSelect(e.target.value)}
                    >
                        <option value="">Default (Global)</option>
                        {jobs.map(job => (
                            <option key={job._id} value={job._id}>{job.title}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        {selectedJobId
                            ? "Set a specific auto-reply for this job. If empty, the default message will be used."
                            : "This message will be sent if no specific job message is set."}
                    </p>
                </div>

                <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="4"
                    value={selectedJobId ? jobAutoReplyMessage : autoReplyMessage}
                    onChange={(e) => {
                        if (selectedJobId) {
                            setJobAutoReplyMessage(e.target.value);
                        } else {
                            setAutoReplyMessage(e.target.value);
                        }
                    }}
                    placeholder={selectedJobId ? "Enter specific auto-reply for this job..." : "Enter the message to send when you are offline..."}
                />

                {selectedJobId && (
                    <div className="mt-2 flex justify-end">
                        <button
                            onClick={handleSaveJobReply}
                            className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Save Job Reply
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Weekly Availability</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Drag to select your online hours. Unselected hours are considered "Offline".
                </p>
                <div className="overflow-auto">
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
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityScheduler;
