const { default: mongoose } = require("mongoose");
const Submission = require("../models/Submission");
const Question = require("../models/Question");

// 1. Get all unique failed questions for an exercise (randomized)
exports.getFailedQExercise = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // MongoDB Aggregation to get unique failed question IDs
    const failedQuestions = await Submission.aggregate([
      // Match submissions for this user and exercise
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          exerciseId: new mongoose.Types.ObjectId(exerciseId),
        },
      },
      // Unwind answers array
      { $unwind: "$answers" },
      // Filter only incorrect answers
      { $match: { "answers.isCorrect": false } },
      // Group to get unique question IDs
      {
        $group: {
          _id: "$answers.questionId",
        },
      },
      // Convert to simple array of IDs
      {
        $group: {
          _id: null,
          questionIds: { $push: "$_id" },
        },
      },
    ]);

    if (!failedQuestions.length || !failedQuestions[0].questionIds.length) {
      return res.json({
        questionIds: [],
        totalCount: 0,
        message: "No failed questions found for practice",
      });
    }

    // Randomize the order
    const questionIds = failedQuestions[0].questionIds;
    const shuffledIds = questionIds.sort(() => Math.random() - 0.5);

    res.json({
      questionIds: shuffledIds,
      totalCount: shuffledIds.length,
    });
  } catch (error) {
    console.error("Error fetching failed questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 2. Get individual question by ID
exports.getFailedQById = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId).populate(
      "exerciseId",
      "name class subject chapter directions headers sections"
    );

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 3. Check answer and provide immediate feedback
exports.getFailedQResult = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { userAnswer } = req.body;

    if (!userAnswer) {
      return res.status(400).json({ error: "userAnswer is required" });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Check if answer is correct
    const isCorrect =
      question.correctAnswer.toLowerCase().trim() ===
      userAnswer.toLowerCase().trim();

    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      userAnswer,
      questionId,
    });
  } catch (error) {
    console.error("Error checking answer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
