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
  startChapterTest,
  getChapterTestQuestion,
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

// Add this route for chapter tests
router.post("/chapter-test", protect, startChapterTest);

router.get(
  "/:submissionId/chapter-question/:questionId",
  getChapterTestQuestion
);

module.exports = router;
