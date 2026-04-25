const Notification = require("../models/Notification");

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Ensure user owns the notification
        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json(notification);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Failed to update notification" });
    }
};

// Helper to create notification (internal use)
exports.createNotification = async (recipientId, type, title, message, relatedId = null) => {
    try {
        await Notification.create({
            recipient: recipientId,
            type,
            title,
            message,
            relatedId,
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};
