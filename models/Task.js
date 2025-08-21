const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // Basic task info
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      enum: [
        "Mathematics",
        "Science",
        "English",
        "Social Studies",
        "Abacus",
        "General Knowledge",
        "Hindi",
        "Computer Science",
      ],
    },
    category: {
      type: String,
      enum: ["SOF", "Abacus", "School", "Personal"],
      default: "Personal",
    },
    defaultDuration: {
      type: Number,
      default: 15, // minutes
    },

    // Ownership & sharing
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
taskSchema.index({ createdBy: 1 });
taskSchema.index({ subject: 1, category: 1 });

module.exports = mongoose.model("Task", taskSchema);
