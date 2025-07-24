const mongoose = require("mongoose");
const { Schema } = mongoose;

const SubjectSchema = new Schema({
  name: { type: String, required: true }, // e.g., "Mathematics"
  code: { type: String, required: true, unique: true }, // e.g., "math"
  shortName: { type: String }, // Optional: "Math"
  description: { type: String }, // Optional details
  classLevels: [{ type: Number }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Subject", SubjectSchema);
