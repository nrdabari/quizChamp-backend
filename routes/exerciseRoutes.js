const express = require("express");
const router = express.Router();
const {
  updateExercise,
  getExercise,
  getExerciseData,
} = require("../controllers/exerciseController");

router.post("/exercise", updateExercise);

// Get all exercises
router.get("/", getExercise);

router.get("/:id", getExerciseData);

module.exports = router;
