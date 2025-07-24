const express = require("express");
const router = express.Router();
const {
  createQuestions,
  countQuestions,
  getQuestions,
  uploadQuestionImage,
  deleteQuestionImage,
  updateQuestion,
  getFirstQuestion,
  getQuestionWithAnswer,
} = require("../controllers/questionController");
const upload = require("../middlewares/upload");

// Create all bulk questions
router.post("/bulk", createQuestions);

// Count all questions for an exercise
router.get("/count/:exerciseId", countQuestions);

// Get all questions for an exercise
router.get("/edit/:exerciseId", getQuestions);

// Upload image to question
router.post("/upload/:questionId", upload.single("image"), uploadQuestionImage);

// Delete a question
router.delete("/delete-image/:questionId", deleteQuestionImage);

// Update a question
router.put("/:questionId", updateQuestion);

router.get("/single/:exerciseId/:id", getFirstQuestion);

router.get("/exam/:submissionId/:exerciseId/:id", getQuestionWithAnswer);

module.exports = router;
