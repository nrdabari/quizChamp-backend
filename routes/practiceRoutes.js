const express = require("express");
const {
  getFailedQExercise,
  getFailedQById,
  getFailedQResult,
} = require("../controllers/practiceController");
const router = express.Router();

// 1. Get all unique failed questions for an exercise (randomized)
router.get("/exercises/:exerciseId/failed-questions", getFailedQExercise);

// 2. Get individual question by ID
router.get("/questions/:questionId", getFailedQById);

// 3. Check answer and provide immediate feedback
router.post("/questions/:questionId/check-answer", getFailedQResult);

module.exports = router;
