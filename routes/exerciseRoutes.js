const express = require("express");
const router = express.Router();
const {
  updateExercise,
  getExercise,
  getExerciseData,
  getChapterAssignData,
  uploadDirectionImage,
  deleteDirectionImage,
} = require("../controllers/exerciseController");
const upload = require("../middlewares/uploadDirectionImage");

router.post("/exercise", updateExercise);

// Get all exercises
router.get("/", getExercise);

router.get("/:id", getExerciseData);

router.get("/:exerciseId/chapter-assignment-data", getChapterAssignData);

// POST /api/exercises/:exerciseId/directions/image
router.post(
  "/:exerciseId/directions/image",
  upload.single("image"),
  uploadDirectionImage
);

// Add this route to your exercise routes file
router.delete("/:id/directions/:directionIndex/image", deleteDirectionImage);
module.exports = router;
