const mongoose = require("mongoose");

const studentTaskSchema = new mongoose.Schema(
  {
    // Basic assignment info
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    // Assignment details
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: Date.now,
    },
    customDuration: Number, // Override task's defaultDuration

    // Status & priority
    status: {
      type: String,
      enum: ["assigned", "in_progress", "completed", "skipped", "carried_over"],
      default: "assigned",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    source: {
      type: String,
      enum: ["self_created", "revision", "carryover", "favorite_practice"],
      default: "self_created",
    },

    // TIMER & PROGRESS (Combined from StudentTaskProgress)
    timer: {
      state: {
        type: String,
        enum: ["stopped", "running", "paused"],
        default: "stopped",
      },
      timeRemaining: Number, // minutes
      totalTimeSpent: {
        type: Number,
        default: 0,
      },
      startedAt: Date,
      lastUpdated: Date,
      sessions: [
        {
          startTime: Date,
          endTime: Date,
          duration: Number, // minutes
        },
      ],
    },

    // COMPLETION DATA
    completedAt: Date,
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    studentNotes: String,
    difficulty: {
      type: String,
      enum: ["too_easy", "just_right", "too_hard"],
    },

    // REVISION SYSTEM (Combined from TaskRevision)
    revision: {
      isRevision: {
        type: Boolean,
        default: false,
      },
      originalTaskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentTask",
      },
      originalCompletionDate: Date,
      revisionNumber: {
        type: Number,
        default: 0, // 0 = original, 1 = first revision, etc.
      },
      scheduledRevisions: [
        {
          revisionNumber: Number, // 1, 2, 3
          scheduledDate: Date,
          type: {
            type: String,
            enum: ["short_term", "medium_term", "long_term"],
          },
          completed: {
            type: Boolean,
            default: false,
          },
          completedAt: Date,
        },
      ],
      nextRevisionDate: Date,
    },

    // FAVORITE STATUS (Combined from StudentFavorite)
    favorite: {
      isFavorite: {
        type: Boolean,
        default: false,
      },
      addedToFavoritesAt: Date,
      practiceCount: {
        type: Number,
        default: 0,
      },
      lastPracticed: Date,
      personalDifficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
      },
      personalNotes: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
studentTaskSchema.index({ studentId: 1, assignedDate: 1 });
studentTaskSchema.index({ studentId: 1, status: 1 });
studentTaskSchema.index({ studentId: 1, "favorite.isFavorite": 1 });
studentTaskSchema.index({ studentId: 1, "revision.nextRevisionDate": 1 });
studentTaskSchema.index({ "timer.state": 1 });

module.exports = mongoose.model("StudentTask", studentTaskSchema);
