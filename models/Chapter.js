const mongoose = require("mongoose");
const { Schema } = mongoose;

const ChapterSchema = new Schema({
  name: { type: String, required: true }, // e.g., "Fractions"
  code: { type: String }, // Optional: "fractions"
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  classLevel: { type: Number, required: true }, // e.g., 5
  chapterNumber: { type: Number }, // e.g., 3
  description: { type: String }, // Optional: syllabus text
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Chapter", ChapterSchema);
