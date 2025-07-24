const mongoose = require("mongoose");
const Question = require("../models/Question");
const { deleteImageFile } = require("../utils/fileHelper");
const Submission = require("../models/Submission");

exports.createQuestions = async (req, res) => {
  try {
    const { exerciseId, questions } = req.body;

    if (!exerciseId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const formatted = questions.map((q) => ({
      exerciseId,
      id: q.id,
      question: q.question || "",
      options: q.options || [],
      subQuestion: q.subQuestion || "",
      correctAnswer: q.correctAnswer || "",
    }));

    const result = await Question.insertMany(formatted);
    res
      .status(200)
      .json({ message: "Inserted successfully", count: result.length });
  } catch (err) {
    console.error("❌ Bulk insert error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.countQuestions = async (req, res) => {
  try {
    const { exerciseId } = req.params;

    // Convert string to ObjectId
    const objectId = new mongoose.Types.ObjectId(exerciseId);

    const count = await Question.countDocuments({ exerciseId: objectId });
    res.json({ count });
  } catch (err) {
    console.error("❌ count questions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const exerciseId = req.params.exerciseId;
    const questions = await Question.find({ exerciseId }).sort({ id: 1 });
    if (!questions) return res.status(404).json({ message: "Not found" });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching Question List" });
  }
};

exports.uploadQuestionImage = async (req, res) => {
  try {
    const { questionId } = req.params;
    const filePath = `/uploads/questions/${questionId}.jpg`;

    const updated = await Question.findByIdAndUpdate(
      questionId,
      {
        imagePath: filePath,
      },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Question not found" });

    res.json({ message: "✅ Image uploaded successfully", question: updated });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "❌ Failed to upload image" });
  }
};

exports.deleteQuestionImage = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.imagePath) {
      deleteImageFile(question.imagePath); // Pass relative path from DB
      question.imagePath = null;
      await question.save();
    }

    res.json({ message: "🗑️ Image deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting image:", err);
    res.status(500).json({ message: "Server error while deleting image" });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const {
      question,
      subQuestion,
      optionType,
      options,
      gridOptions,
      correctAnswer,
    } = req.body;

    if (
      !Array.isArray(options) || // still ensure options is an array
      !correctAnswer
    ) {
      return res.status(400).json({ message: "Invalid question data" });
    }

    const updated = await Question.findByIdAndUpdate(
      questionId,
      {
        question,
        optionType,
        options: optionType === "normal" ? options : [],
        gridOptions: optionType === "grid" ? gridOptions : [],
        subQuestion,
        correctAnswer,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating question:", err);
    res.status(500).json({ message: "Failed to update question" });
  }
};

exports.getFirstQuestion = async (req, res) => {
  console.log("get first question");

  const { exerciseId, id } = req.params;
  const question = await Question.findOne({
    exerciseId: exerciseId,
    id: parseInt(id),
  }).sort({ id: 1 });
  if (!question) return res.status(404).json({ message: "No questions found" });
  res.json(question);
};

exports.getQuestionWithAnswer = async (req, res) => {
  try {
    const { submissionId, exerciseId, id } = req.params;

    // Fetch question
    const question = await Question.findOne(
      {
        exerciseId,
        id: Number(id),
      },
      "-correctAnswer -createdAt -updatedAt"
    );
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    // Fetch submission and check answer
    const submission = await Submission.findById(submissionId);
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    const existing = submission.answers.find(
      (a) => String(a.questionId) === String(question._id)
    );

    return res.json({
      question,
      userAnswer: existing ? existing.userAnswer : null,
    });
  } catch (err) {
    console.error("❌ Error in getQuestionWithAnswer:", err);
    res.status(500).json({ message: "Internal error" });
  }
};
