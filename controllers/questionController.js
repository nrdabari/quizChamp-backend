const mongoose = require("mongoose");
const Question = require("../models/Question");
const { deleteImageFromS3 } = require("../utils/fileHelper");
const Submission = require("../models/Submission");
const Exercise = require("../models/Exercise");
const s3 = require("../config/aws");

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

    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    // Get the existing question to check for old image
    const existingQuestion = await Question.findById(questionId);
    if (!existingQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    // If there's an existing image, delete it from S3 first
    if (
      existingQuestion.imagePath &&
      existingQuestion.imagePath.includes("s3.")
    ) {
      await deleteImageFromS3(existingQuestion.imagePath);
    }

    // S3 URL is available in req.file.location
    const s3ImageUrl = req.file.location;

    const updated = await Question.findByIdAndUpdate(
      questionId,
      {
        imagePath: s3ImageUrl, // Store full S3 URL
      },
      { new: true }
    );

    res.json({
      message: "✅ Image uploaded successfully to S3",
      question: updated,
      imageUrl: s3ImageUrl,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "❌ Failed to upload image to S3" });
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
      // Delete from S3 first
      const deleteSuccess = await deleteImageFromS3(question.imagePath);

      if (deleteSuccess) {
        question.imagePath = null;
        await question.save();
        res.json({
          message: "🗑️ Image deleted successfully from S3 and database",
        });
      } else {
        res.status(500).json({ message: "Failed to delete image from S3" });
      }
    } else {
      res.json({ message: "No image found to delete" });
    }
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
// Route 2: Save chapter assignments
exports.updateAssignChapters = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const assignments = req.body;

    // Validation
    if (
      !assignments ||
      !Array.isArray(assignments) ||
      assignments.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignments data",
      });
    }

    // Extract all IDs for validation
    const chapterIds = [...new Set(assignments.map((a) => a.chapterId))]; // Remove duplicates
    const allQuestionIds = [
      ...new Set(assignments.flatMap((a) => a.questionIds)),
    ]; // Remove duplicates

    // Check for duplicate questions across assignments (client-side logic)
    const questionIdCounts = {};
    assignments
      .flatMap((a) => a.questionIds)
      .forEach((id) => {
        questionIdCounts[id] = (questionIdCounts[id] || 0) + 1;
      });
    const duplicateQuestions = Object.keys(questionIdCounts).filter(
      (id) => questionIdCounts[id] > 1
    );

    if (duplicateQuestions.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Duplicate questions found in assignments",
        duplicateQuestions,
      });
    }

    // OPTIMIZATION 1: Combined validation query using aggregation
    const validationResult = await Exercise.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(exerciseId) },
      },
      {
        $lookup: {
          from: "chapters",
          let: { subjectId: "$subjectId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$subjectId", "$$subjectId"] },
                    {
                      $in: [
                        "$_id",
                        chapterIds.map((id) => new mongoose.Types.ObjectId(id)),
                      ],
                    },
                  ],
                },
              },
            },
            { $project: { _id: 1, name: 1 } },
          ],
          as: "validChapters",
        },
      },
      {
        $lookup: {
          from: "questions",
          let: { exerciseId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$exerciseId", "$$exerciseId"] },
                    {
                      $in: [
                        "$_id",
                        allQuestionIds.map(
                          (id) => new mongoose.Types.ObjectId(id)
                        ),
                      ],
                    },
                  ],
                },
              },
            },
            { $project: { _id: 1 } },
          ],
          as: "validQuestions",
        },
      },
      {
        $project: {
          _id: 1,
          source: 1,
          subjectId: 1,
          validChapters: 1,
          validQuestions: 1,
          chapterCount: { $size: "$validChapters" },
          questionCount: { $size: "$validQuestions" },
        },
      },
    ]);

    if (validationResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    const exercise = validationResult[0];

    // Validate exercise source
    if (exercise.source !== "Previous Years Paper") {
      return res.status(400).json({
        success: false,
        message:
          "Chapter assignment only allowed for Previous Years Paper exercises",
      });
    }

    // Validate chapters
    if (exercise.chapterCount !== chapterIds.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid chapters for this subject",
      });
    }

    // Validate questions
    if (exercise.questionCount !== allQuestionIds.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid questions for this exercise",
      });
    }

    // OPTIMIZATION 2: More efficient bulk update
    const bulkOps = assignments.flatMap((assignment) =>
      assignment.questionIds.map((questionId) => ({
        updateOne: {
          filter: {
            _id: new mongoose.Types.ObjectId(questionId),
            exerciseId: new mongoose.Types.ObjectId(exerciseId),
          },
          update: {
            $set: {
              chapterId: new mongoose.Types.ObjectId(assignment.chapterId),
              updatedAt: new Date(),
            },
          },
        },
      }))
    );

    // Execute bulk update with ordered: false for better performance
    const result = await Question.bulkWrite(bulkOps, { ordered: false });

    // Create response summary
    const assignmentsSummary = assignments.map((assignment) => {
      const chapter = exercise.validChapters.find(
        (c) => c._id.toString() === assignment.chapterId
      );
      return {
        chapterId: assignment.chapterId,
        chapterName: chapter ? chapter.name : "Unknown",
        questionsAssigned: assignment.questionIds.length,
      };
    });

    res.json({
      success: true,
      message: "Chapter assignments saved successfully",
      data: {
        totalQuestionsUpdated: result.modifiedCount,
        assignmentsSummary,
      },
    });
  } catch (error) {
    console.error("Error saving chapter assignments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
