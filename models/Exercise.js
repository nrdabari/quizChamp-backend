const mongoose = require("mongoose");
const { Schema } = mongoose;

const RangeSchema = new Schema({
  text: { type: String, required: false },
  start: { type: Number, required: false },
  end: { type: Number, required: false },
  imagePath: { type: String, required: false },
});

const ExerciseSchema = new Schema(
  {
    name: { type: String, required: true },
    class: { type: Number, required: true },
    subject: { type: String },
    chapter: { type: String },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
    },
    source: {
      type: String,
      required: true,
      enum: [
        "Workbook",
        "Olympiad Guide",
        "Practice Set",
        "Textbook",
        "Previous Years Paper",
        "Power Math",
      ],
    },

    directions: [RangeSchema], // optional
    headers: [RangeSchema], // optional
    sections: [RangeSchema], // optional
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exercise", ExerciseSchema);
