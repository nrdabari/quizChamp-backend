const Chapter = require("../models/Chapter");
const Exercise = require("../models/Exercise");
const Question = require("../models/Question");
const Subject = require("../models/Subject");

exports.createExercise = async (req, res) => {
  try {
    console.log("📥 Received data:", req.body); // ✅ Debug log

    const exercise = new Exercise(req.body);
    await exercise.save();
    res
      .status(201)
      .json({ message: "Exercise created successfully", exercise });
  } catch (error) {
    console.error("Save failed:", error);
    res.status(500).json({ message: "Failed to save exercise", error });
  }
};

exports.getExercise = async (req, res) => {
  try {
    const { classLevel } = req.query;

    // Create filter if classLevel is passed
    const filter = {};
    if (classLevel) {
      filter.class = parseInt(classLevel); // assuming classLevel is stored as number
    }

    const list = await Exercise.find(filter)
      .sort({ createdAt: -1 })
      .populate("subjectId", "name") // populate only subject name
      .populate("chapterId", "name"); // populate only chapter name

    const exercisesWithCount = await Promise.all(
      list.map(async (ex) => {
        const count = await Question.countDocuments({ exerciseId: ex._id });
        return {
          ...ex.toObject(),
          questionCount: count,
        };
      })
    );

    res.json(exercisesWithCount);
  } catch (err) {
    console.error("❌ Error fetching exercises:", err);
    res.status(500).json({ message: "Failed to fetch exercises" });
  }
};

exports.getExerciseData = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id).lean();
    if (!exercise) return res.status(404).json({ message: "Not found" });
    const count = await Question.countDocuments({ exerciseId: req.params.id });
    res.json({
      ...exercise,
      questionCount: count,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching exercise" });
  }
};
