const express = require("express");
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleCloseJob,
  getJobsEmployer,
} = require("../controllers/jobController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").post(protect, createJob).get(getJobs);
router.route("/get-jobs-employer").get(protect, getJobsEmployer);
router
  .route("/:id")
  .get(getJobById)
  .put(protect, updateJob)
  .delete(protect, deleteJob);
router.route("/:id/toggle-close").put(protect, toggleCloseJob);

module.exports = router;
