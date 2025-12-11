const Connection = require("../models/Connection");
const User = require("../models/User");

// Send a connection request
exports.sendRequest = async (req, res) => {
    try {
        const { recipientId } = req.body;
        const requesterId = req.user.id;

        if (requesterId === recipientId) {
            return res.status(400).json({ message: "You cannot connect with yourself" });
        }

        const existingConnection = await Connection.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId },
            ],
        });

        if (existingConnection) {
            return res.status(400).json({ message: "Connection request already exists" });
        }

        const newConnection = new Connection({
            requester: requesterId,
            recipient: recipientId,
            status: "pending",
        });

        await newConnection.save();
        res.status(201).json({ message: "Connection request sent", connection: newConnection });
    } catch (error) {
        res.status(500).json({ message: "Error sending request", error: error.message });
    }
};

// Accept a connection request
exports.acceptRequest = async (req, res) => {
    try {
        const { connectionId } = req.body;
        const userId = req.user.id;

        const connection = await Connection.findById(connectionId);

        if (!connection) {
            return res.status(404).json({ message: "Connection request not found" });
        }

        if (connection.recipient.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized to accept this request" });
        }

        connection.status = "accepted";
        await connection.save();

        res.status(200).json({ message: "Connection accepted", connection });
    } catch (error) {
        res.status(500).json({ message: "Error accepting request", error: error.message });
    }
};

// Reject a connection request
exports.rejectRequest = async (req, res) => {
    try {
        const { connectionId } = req.body;
        const userId = req.user.id;

        const connection = await Connection.findById(connectionId);

        if (!connection) {
            return res.status(404).json({ message: "Connection request not found" });
        }

        if (connection.recipient.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized to reject this request" });
        }

        connection.status = "rejected";
        await connection.save();

        res.status(200).json({ message: "Connection rejected", connection });
    } catch (error) {
        res.status(500).json({ message: "Error rejecting request", error: error.message });
    }
};

// Get all connections (accepted)
exports.getConnections = async (req, res) => {
    try {
        const userId = req.user.id;

        const connections = await Connection.find({
            $or: [{ requester: userId }, { recipient: userId }],
            status: "accepted",
        })
            .populate("requester", "fullName avatar degree major role")
            .populate("recipient", "fullName avatar degree major role");

        const formattedConnections = connections.map((conn) => {
            const isRequester = conn.requester._id.toString() === userId;
            return isRequester ? conn.recipient : conn.requester;
        });

        res.status(200).json(formattedConnections);
    } catch (error) {
        res.status(500).json({ message: "Error fetching connections", error: error.message });
    }
};

// Get pending requests (received)
exports.getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await Connection.find({
            recipient: userId,
            status: "pending",
        }).populate("requester", "fullName avatar degree major role");

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pending requests", error: error.message });
    }
};

// Get sent requests (pending)
exports.getSentRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await Connection.find({
            requester: userId,
            status: "pending",
        }).populate("recipient", "fullName avatar degree major role");

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching sent requests", error: error.message });
    }
};

// Get recommendations (users not connected with)
exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get IDs of users already connected or pending
        const existingConnections = await Connection.find({
            $or: [{ requester: userId }, { recipient: userId }],
        });

        const connectedUserIds = existingConnections.map((conn) =>
            conn.requester.toString() === userId
                ? conn.recipient.toString()
                : conn.requester.toString()
        );

        // Add self to exclusion list
        connectedUserIds.push(userId);

        // Find users NOT in the connected list
        // Prioritize graduates, but can also show companies
        const recommendations = await User.find({
            _id: { $nin: connectedUserIds },
            role: "graduate", // Focus on graduates for now, or remove to include companies
            isProfileComplete: true, // Only show complete profiles
        })
            .select("fullName avatar degree major role")
            .limit(20);

        res.status(200).json(recommendations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching recommendations", error: error.message });
    }
};

// Get all companies
exports.getCompanies = async (req, res) => {
    try {
        const companies = await User.find({ role: "employer" })
            .select("companyName companyLogo companyDescription address website")
            .limit(50);

        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ message: "Error fetching companies", error: error.message });
    }
};

// Get all graduates (Directory)
exports.getAllGraduates = async (req, res) => {
    try {
        const userId = req.user.id;

        const graduates = await User.find({
            _id: { $ne: userId }, // Exclude self
            role: "graduate",
            isProfileComplete: true,
        })
            .select("fullName avatar degree major role")
            .limit(50); // Limit for performance, maybe implement pagination later

        res.status(200).json(graduates);
    } catch (error) {
        res.status(500).json({ message: "Error fetching graduates", error: error.message });
    }
};
