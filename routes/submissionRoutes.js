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
} = require("../controllers/submissionController");

router.get("/", getAllSubmissions);

router.put("/start", startSubmission);

router.patch("/answer/:submissionId", saveAnswer);

// Pause and resume routes
router.patch("/pause/:submissionId", pauseSubmission);

router.post("/complete/:submissionId", completeSubmission);

router.get("/attempted/:submissionId", getSubmissionAnswers);

module.exports = router;
