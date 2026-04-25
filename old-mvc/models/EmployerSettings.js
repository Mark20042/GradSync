const mongoose = require("mongoose");

const timeRangeSchema = new mongoose.Schema({
    start: { type: String, required: true }, // e.g., "09:00"
    end: { type: String, required: true },   // e.g., "17:00"
    isOpen: { type: Boolean, default: true },
});

const employerSettingsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    timezone: {
        type: String,
        default: "UTC",
    },
    businessHours: {
        monday: { type: timeRangeSchema, default: { start: "09:00", end: "17:00", isOpen: true } },
        tuesday: { type: timeRangeSchema, default: { start: "09:00", end: "17:00", isOpen: true } },
        wednesday: { type: timeRangeSchema, default: { start: "09:00", end: "17:00", isOpen: true } },
        thursday: { type: timeRangeSchema, default: { start: "09:00", end: "17:00", isOpen: true } },
        friday: { type: timeRangeSchema, default: { start: "09:00", end: "17:00", isOpen: true } },
        saturday: { type: timeRangeSchema, default: { start: "09:00", end: "17:00", isOpen: false } },
        sunday: { type: timeRangeSchema, default: { start: "09:00", end: "17:00", isOpen: false } },
    },
    autoReplyMessage: {
        type: String,
        default: "Thank you for your message. We are currently closed and will get back to you during our business hours.",
    },
}, { timestamps: true });

module.exports = mongoose.model("EmployerSettings", employerSettingsSchema);
