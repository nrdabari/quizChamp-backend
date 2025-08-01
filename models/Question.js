const mongoose = require("mongoose");
const { Schema } = mongoose;

const QuestionSchema = new Schema(
  {
    id: { type: Number, required: true },
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    question: { type: String },
    optionType: { type: String, enum: ["normal", "grid"], default: "normal" },
    options: [String], // Used for normal
    gridOptions: [[String]], // Used for grid format
    subQuestion: { type: String },
    correctAnswer: { type: String },
    imagePath: { type: String }, // image path or URL
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);
