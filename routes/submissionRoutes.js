const express = require("express");
const router = express.Router();
const {
  startSubmission,
  saveAnswer,
  completeSubmission,
  getAllSubmissions,
  pauseSubmission,
  resumeSubmission,
  getSubmissionAnswers,
  getSubmissionReport,
} = require("../controllers/submissionController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getAllSubmissions);

router.put("/start", startSubmission);

router.patch("/answer/:submissionId", saveAnswer);

// Pause and resume routes
router.patch("/pause/:submissionId", pauseSubmission);

router.post("/complete/:submissionId", completeSubmission);

router.get("/attempted/:submissionId", getSubmissionAnswers);

// GET /api/submissions/report/:submissionId
router.get("/report/:submissionId", getSubmissionReport);

module.exports = router;
