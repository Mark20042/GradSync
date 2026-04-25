const express = require("express");
const router = express.Router();
const connectionController = require("../controllers/connectionController");
const { protect } = require("../middlewares/authMiddleware");

// All routes are protected
router.use(protect);

// Connection actions
router.post("/request", connectionController.sendRequest);
router.post("/accept", connectionController.acceptRequest);
router.post("/reject", connectionController.rejectRequest);

// Lists
router.get("/", connectionController.getConnections); // My connections
router.get("/pending", connectionController.getPendingRequests); // Requests received
router.get("/sent", connectionController.getSentRequests); // Requests sent
router.get("/recommendations", connectionController.getRecommendations); // People to connect with
router.get("/graduates", connectionController.getAllGraduates); // All graduates directory
router.get("/companies", connectionController.getCompanies); // Companies list

module.exports = router;
