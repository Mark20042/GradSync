import React, { useState, useEffect } from "react";
import ScheduleSelector from "react-schedule-selector";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATH } from "../../../utils/apiPath";
import toast from "react-hot-toast";
import { startOfWeek, addDays, format, getHours, setHours, setMinutes, startOfDay } from "date-fns";

const AvailabilityScheduler = () => {
    const [schedule, setSchedule] = useState([]);
    const [autoReplyMessage, setAutoReplyMessage] = useState("");
    const [loading, setLoading] = useState(true);


    // Use a fixed reference week for consistency (e.g., first week of 2024 which starts on a Monday)
    // Jan 1, 2024 was a Monday.
    const REFERENCE_START_DATE = new Date("2024-01-01T00:00:00");

    useEffect(() => {
        fetchSettings();
    }, []);


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
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Auto-Reply Message</h3>

                <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="4"
                    value={autoReplyMessage}
                    onChange={(e) => setAutoReplyMessage(e.target.value)}
                    placeholder="Enter the message to send when you are offline..."
                />
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Weekly Availability</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Drag to select your online hours. Unselected hours are considered "Offline".
                </p>
                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
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
