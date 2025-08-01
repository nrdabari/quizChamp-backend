const express = require("express");
const router = express.Router();
const {
  updateExercise,
  getExercise,
  getExerciseData,
  getChapterAssignData,
} = require("../controllers/exerciseController");

router.post("/exercise", updateExercise);

// Get all exercises
router.get("/", getExercise);

router.get("/:id", getExerciseData);

router.get("/:exerciseId/chapter-assignment-data", getChapterAssignData);

module.exports = router;
