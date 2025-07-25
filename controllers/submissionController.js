const Question = require("../models/Question");
const Submission = require("../models/Submission");

exports.startSubmission = async (req, res) => {
  try {
    const { userId, exerciseId, totalTime } = req.body;

    if (!userId || !exerciseId) {
      return res
        .status(400)
        .json({ message: "userId and exerciseId are required" });
    }

    const newSubmission = new Submission({
      userId,
      exerciseId,
      startedAt: new Date(),
      answers: [], // Empty initially
      totalTime: totalTime,
    });

    const saved = await newSubmission.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error starting submission:", err);
    res.status(500).json({ message: "Failed to start submission" });
  }
};

// Save or update one answer
exports.saveAnswer = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { questionId, userAnswer, timeTaken } = req.body;
    const submission = await Submission.findById(submissionId);
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    const existing = submission.answers.find((a) =>
      a.questionId.equals(questionId)
    );
    console.log(existing);
    if (existing) {
      existing.userAnswer = userAnswer;
      existing.timeTaken = timeTaken;
    } else {
      submission.answers.push({ questionId, userAnswer, timeTaken });
    }

    await submission.save();
    res.json({ message: "Answer saved" });
  } catch (err) {
    console.error("Save answer error:", err);
    res.status(500).json({ message: "Could not save answer" });
  }
};

exports.completeSubmission = async (req, res) => {
  const { submissionId } = req.params;

  try {
    const submission = await Submission.findById(submissionId);
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    let score = 0;
    const updatedAnswers = [];

    for (const ans of submission.answers) {
      const question = await Question.findById(ans.questionId);
      if (!question) continue;

      const isCorrect = ans.userAnswer === question.correctAnswer;
      if (isCorrect) score++;

      updatedAnswers.push({
        ...ans.toObject(),
        isCorrect,
      });
    }

    const endedAt = new Date();
    const totalTimeTaken = Math.floor((endedAt - submission.startedAt) / 1000); // in seconds

    submission.answers = updatedAnswers;
    submission.endedAt = endedAt;
    submission.totalTimeTaken = totalTimeTaken;
    submission.score = score;
    submission.status = "completed";

    await submission.save();

    res.json({
      message: "✅ Exam completed",
      score,
      totalTimeTaken,
      totalQuestions: updatedAnswers.length,
    });
  } catch (err) {
    console.error("❌ Failed to complete exam:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllSubmissions = async (req, res) => {
  try {
    const { userId, exerciseId } = req.query;
    const filter = {
      status: { $in: ["completed", "paused"] },
    };
    if (userId) filter.userId = userId;
    if (exerciseId) filter.exerciseId = exerciseId;

    const submissions = await Submission.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .populate("exerciseId", "subject chapter source name");

    res.json(submissions);
  } catch (err) {
    console.error("❌ Error fetching submissions:", err);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
};

exports.pauseSubmission = async (req, res) => {
  try {
    const { timeLeft } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { timeLeft, status: "paused" },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json({ message: "Submission paused", submission });
  } catch (err) {
    console.error("Pause Error:", err);
    res.status(500).json({ message: "Failed to pause submission" });
  }
};

// PATCH /api/submissions/resume/:submissionId
exports.getSubmissionAnswers = async (req, res) => {
  const { submissionId } = req.params;

  try {
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const attempts = submission.answers
      .filter((ans) => ans.userAnswer && ans.userAnswer.trim() !== "")
      .map((ans) => ({ questionId: ans.questionId }));

    res.json({ attempts });
  } catch (err) {
    console.error("❌ Error in attempted fetch:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSubmissionReport = async (req, res) => {
  const { submissionId } = req.params;
  console.log(req.params);
  try {
    const submission = await Submission.findById(submissionId)
      .populate("answers.questionId")
      .populate("userId", "name email") // Optional: populate user info
      .populate("exerciseId", "source name");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const reportData = submission.answers.map((answer) => {
      const question = answer.questionId;

      return {
        questionId: question._id,
        question: question.question,
        subQuestion: question.subQuestion,
        options: question.options,
        gridOptions: question.gridOptions,
        correctAnswer: question.correctAnswer,
        userAnswer: answer.userAnswer,
        isCorrect: answer.isCorrect,
        timeTaken: answer.timeTaken,
        imagePath: question.imagePath || null,
        optionType: question.optionType,
      };
    });

    return res.json({
      submissionDetails: {
        userId: submission.userId,
        exerciseId: submission.exerciseId,
        startedAt: submission.startedAt,
        endedAt: submission.endedAt,
        totalTimeTaken: submission.totalTimeTaken,
        score: submission.score,
        status: submission.status,
        totalTime: submission.totalTime,
      },
      questions: reportData,
    });
  } catch (error) {
    console.error("Error fetching submission report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
