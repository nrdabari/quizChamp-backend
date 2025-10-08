const { default: mongoose } = require("mongoose");
const Question = require("../models/Question");
const Submission = require("../models/Submission");
const User = require("../models/User");

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
    console.log("authenticated user", req.user);
    const filter = {
      status: { $in: ["completed", "paused"] },
    };
    const authenticatedUserId = req.user.id;
    const authenticatedUserRole = req.user.role;
    if (authenticatedUserRole === "user") {
      if (authenticatedUserId) filter.userId = authenticatedUserId;
    } else {
      if (userId) filter.userId = userId;
    }

    if (exerciseId) filter.exerciseId = exerciseId;

    const submissions = await Submission.find(filter)
      .sort({ updatedAt: -1 })
      .limit(20)
      .populate("userId", "name email")
      .populate("exerciseId", "subject chapter source name")
      .populate("chapterId", "name");

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

    // Determine if this is a chapter test or exercise test
    const isChapterTest = submission.chapterId && !submission.exerciseId;
    const isExerciseTest = submission.exerciseId && !submission.chapterId;

    if (isChapterTest) {
      // For chapter tests: return questionIds (_id format)
      const attemptsQId = submission.answers
        .filter((ans) => ans.userAnswer && ans.userAnswer.trim() !== "")
        .map((ans) => ans.questionId);

      // Fetch only the _id field from Questions collection
      const questions = await Question.find(
        { _id: { $in: attemptsQId } },
        { _id: 1 } // projection: only _id
      );

      // Send questionIds as ObjectId array
      const attempts = questions.map((q) => q._id);

      res.json({
        attempts,
        testType: "chapter",
      });
    } else if (isExerciseTest) {
      // For exercise tests: return question.id (number format)
      const attemptsQId = submission.answers
        .filter((ans) => ans.userAnswer && ans.userAnswer.trim() !== "")
        .map((ans) => ans.questionId);

      // Fetch the id field from Questions collection
      const questions = await Question.find(
        { _id: { $in: attemptsQId } },
        { id: 1 } // projection: only id field (number)
      );

      // Send question.id as number array
      const attempts = questions.map((q) => q.id);

      res.json({
        attempts,
        testType: "exercise",
      });
    } else {
      // Invalid submission state
      return res.status(400).json({
        message: "Invalid submission: must have either exerciseId or chapterId",
      });
    }
  } catch (err) {
    console.error("Error in attempted fetch:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSubmissionReport = async (req, res) => {
  const { submissionId } = req.params;

  try {
    // 1) Fetch minimal submission to determine test type (lean + projections)
    const baseSubmission = await Submission.findById(
      submissionId,
      "userId startedAt endedAt totalTimeTaken score status totalTime answers questionCount exerciseId chapterId"
    )
      .populate("userId", "name email")
      .populate("exerciseId", "source name directions headers") // only used if exercise test
      .populate("chapterId", "name") // only used if chapter test
      .populate({
        path: "answers.questionId",
        select:
          "id question subQuestion options gridOptions correctAnswer imagePath optionType exerciseId", // NOTE: include exerciseId but don't deep-populate yet
      })
      .lean();

    if (!baseSubmission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const isChapterTest = !!(
      baseSubmission.chapterId && !baseSubmission.exerciseId
    );
    const isExerciseTest = !!(
      baseSubmission.exerciseId && !baseSubmission.chapterId
    );

    // 2) Conditionally deep-populate ONLY when chapter test (saves time for exercise tests)
    let submission = baseSubmission;
    if (isChapterTest) {
      submission = await Submission.populate(baseSubmission, {
        path: "answers.questionId.exerciseId",
        select: "name source directions headers sections",
      });
    }

    // Helpers
    const filterByRange = (items, qNum) =>
      Array.isArray(items)
        ? items.filter((x) => x?.start <= qNum && qNum <= x?.end)
        : [];

    // 3) Build per-question report. Include exerciseData ONLY for chapter tests.
    const questions = (submission.answers || []).map((ans) => {
      const q = ans.questionId || {};
      const qNum = q.id;

      const out = {
        questionId: q._id,
        id: qNum,
        question: q.question,
        subQuestion: q.subQuestion,
        options: q.options,
        gridOptions: q.gridOptions,
        correctAnswer: q.correctAnswer,
        userAnswer: ans.userAnswer,
        isCorrect: ans.isCorrect,
        timeTaken: ans.timeTaken,
        imagePath: q.imagePath || null,
        optionType: q.optionType,
        exerciseId: q.exerciseId?._id || q.exerciseId || null,
      };

      if (isChapterTest && q.exerciseId && typeof q.exerciseId === "object") {
        const ex = q.exerciseId;
        out.exerciseData = {
          name: ex.name,
          source: ex.source,
          directions: filterByRange(ex.directions, qNum),
          headers: filterByRange(ex.headers, qNum),
          sections: filterByRange(ex.sections, qNum),
        };
      }
      return out;
    });

    // 4) Submission details
    let submissionDetails = {
      userId: submission.userId,
      startedAt: submission.startedAt,
      endedAt: submission.endedAt,
      totalTimeTaken: submission.totalTimeTaken,
      score: submission.score,
      status: submission.status,
      totalTime: submission.totalTime,
      testType: isChapterTest ? "chapter" : "exercise",
    };

    if (isChapterTest) {
      // Use distinct to avoid pulling full docs
      const chapterId = submission.chapterId?._id || submission.chapterId;
      const questionIds = await Question.find({ chapterId }).distinct("_id");
      submissionDetails = {
        ...submissionDetails,
        chapterId: submission.chapterId,
        chapterName: submission.chapterId?.name,
        source: "Previous Years Paper",
        questionIds,
        totalQuestions: questionIds.length,
      };
    } else if (isExerciseTest) {
      submissionDetails = {
        ...submissionDetails,
        exerciseId: submission.exerciseId,
        exerciseName: submission.exerciseId?.name,
        source: submission.exerciseId?.source,
        directions: submission.exerciseId?.directions,
        headers: submission.exerciseId?.headers,
      };
    }

    return res.json({
      submissionDetails,
      questions,
      isChapterTest,
      isExerciseTest,
    });
  } catch (err) {
    console.error("Error fetching submission report:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.startChapterTest = async (req, res) => {
  try {
    const { chapterId, subjectId, totalTime } = req.body;

    const userId = req.user.id || req.user._id; // Get from JWT middleware
    console.log("user jwt", userId);

    // Validation
    if (!chapterId) {
      return res.status(400).json({
        message: "chapterId is required",
      });
    }

    // Fetch user with access permissions
    const user = await User.findById(userId).select(
      "subjectsAccess sourceAccess isActive"
    );
    if (!user || !user.isActive) {
      return res.status(404).json({ message: "User not found or inactive" });
    }
    // Check if user has access to this subject
    if (
      !user.subjectsAccess ||
      !user.subjectsAccess.includes(subjectId.toString())
    ) {
      return res.status(403).json({
        message: "You do not have access to this subject",
      });
    }

    // Check if user has access to "Previous Years Paper" source
    if (
      !user.sourceAccess ||
      !user.sourceAccess.includes("Previous Years Paper")
    ) {
      return res.status(403).json({
        message: "You do not have access to Previous Years Paper",
      });
    }

    // Create new submission for chapter test
    const newSubmission = new Submission({
      userId,
      exerciseId: null, // null for chapter tests
      chapterId,
      startedAt: new Date(),
      status: "inProgress",
      answers: [],
      score: 0,
      totalTimeTaken: 0,
      totalTime: totalTime,
    });

    const savedSubmission = await newSubmission.save();

    // Fetch questions for this chapter from previous year papers
    const questions = await Question.find({
      chapterId,
    }).select("_id");

    if (questions.length === 0) {
      // Delete the created submission if no questions found
      await Submission.findByIdAndDelete(savedSubmission._id);
      return res.status(404).json({
        message: "No previous year questions found for this chapter",
      });
    }

    const questionIds = questions.map((q) => q._id);

    // Return submission data with question IDs
    res.status(201).json({
      _id: savedSubmission._id,
      userId: savedSubmission.userId,
      chapterId: savedSubmission.chapterId,
      startedAt: savedSubmission.startedAt,
      status: savedSubmission.status,
      totalTime: savedSubmission.totalTime,
      questionIds,
      totalQuestions: questionIds.length,
      message: "Chapter test started successfully",
    });
  } catch (error) {
    console.error("Error starting chapter test:", error);
    res.status(500).json({
      message: "Failed to start chapter test",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};
exports.getChapterTestQuestion = async (req, res) => {
  try {
    const { submissionId, questionId } = req.params;

    // Validate ObjectId format
    if (
      !mongoose.Types.ObjectId.isValid(questionId) ||
      !mongoose.Types.ObjectId.isValid(submissionId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Parallel queries for better performance
    const [question, submission] = await Promise.all([
      Question.findOne(
        { _id: questionId },
        "-correctAnswer -createdAt -updatedAt"
      )
        .populate({
          path: "exerciseId",
          select: "name source directions headers sections",
        })
        .lean(), // Use lean() for better performance since we're not modifying

      Submission.findById(submissionId, "answers").lean(), // Only fetch answers field
    ]);

    if (!question) {
      return res.status(404).json({ message: "No question found" });
    }
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Check for existing answer
    const existing = submission.answers.find(
      (a) => String(a.questionId) === String(question._id)
    );

    // Handle case where exerciseId might be null
    if (!question.exerciseId) {
      return res.json({
        question: {
          ...question,
          exerciseData: {
            name: "Unknown Exercise",
            source: "Previous Years Paper",
            directions: [],
            headers: [],
            sections: [],
          },
        },
        userAnswer: existing ? existing.userAnswer : null,
      });
    }

    // Optimized filter function - created once
    const questionIdNum = question.id;
    const filterByRange = (items) => {
      if (!Array.isArray(items)) return [];
      return items.filter((item) => {
        return item.start <= questionIdNum && questionIdNum <= item.end;
      });
    };

    // Build response object
    const questionWithExerciseData = {
      ...question,
      exerciseData: {
        name: question.exerciseId.name,
        source: question.exerciseId.source,
        directions: filterByRange(question.exerciseId.directions),
        headers: filterByRange(question.exerciseId.headers),
        sections: filterByRange(question.exerciseId.sections),
      },
    };

    // Remove exerciseId reference
    delete questionWithExerciseData.exerciseId;

    return res.json({
      question: questionWithExerciseData,
      userAnswer: existing ? existing.userAnswer : null,
    });
  } catch (error) {
    console.error("Error getting chapter test question:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSubmissionChapterReport = async (req, res) => {
  const { submissionId } = req.params;
  try {
    const submission = await Submission.findById(submissionId)
      .populate("answers.questionId")
      .populate("chapterId", "name "); // For chapter tests

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Determine test type
    const isChapterTest = submission.chapterId && !submission.exerciseId;
    const isExerciseTest = submission.exerciseId && !submission.chapterId;

    // Build common submission details
    let submissionDetails = {
      startedAt: submission.startedAt,
      endedAt: submission.endedAt,
      totalTimeTaken: submission.totalTimeTaken,
      score: submission.score,
      status: submission.status,
      totalTime: submission.totalTime,
      testType: isChapterTest ? "chapter" : "exercise",
    };

    const chapterId = submission.chapterId;

    // Add specific details
    if (isChapterTest) {
      const questions = await Question.find({ chapterId }).select("_id");

      const questionIds = questions.map((q) => q._id);
      submissionDetails = {
        ...submissionDetails,
        chapterId: submission.chapterId?._id,
        chapterName: submission.chapterId?.name,
        source: "Previous Years Paper", // Chapter tests are always from previous years
        questionIds,
        totalQuestions: questionIds.length,
      };

      // ❌ Don’t generate reportData for chapter test
      return res.json({
        submissionDetails,
        isChapterTest,
        isExerciseTest,
      });
    }
  } catch (error) {
    console.error("Error fetching submission report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
