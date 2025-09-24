const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answerSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    userAnswer: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    timeTaken: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const submissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: false, // Changed from true to false
      default: null,
    },
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: "Chapter",
      required: false,
      default: null,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    totalTimeTaken: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    answers: [answerSchema],
    status: {
      type: String,
      enum: ["inProgress", "paused", "completed"],
      default: "inProgress",
    },
    timeLeft: { type: Number, default: null },
    totalTime: { type: Number, default: 30 },
  },
  {
    timestamps: true,
  }
);

// Add validation to ensure either exerciseId or chapterId is present, but not both
submissionSchema.pre("validate", function (next) {
  const hasExerciseId = this.exerciseId != null;
  const hasChapterId = this.chapterId != null;

  if (!hasExerciseId && !hasChapterId) {
    next(new Error("Either exerciseId or chapterId must be provided"));
  } else if (hasExerciseId && hasChapterId) {
    next(
      new Error("Cannot have both exerciseId and chapterId at the same time")
    );
  } else {
    next();
  }
});

module.exports = mongoose.model("Submission", submissionSchema);
