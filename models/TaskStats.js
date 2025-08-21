const mongoose = require("mongoose");

const taskStatsSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One stats record per student
    },

    // Overall statistics
    totalTasksCreated: {
      type: Number,
      default: 0,
    },
    totalTasksCompleted: {
      type: Number,
      default: 0,
    },
    totalTimeStudied: {
      type: Number,
      default: 0, // minutes
    },

    // Subject-wise breakdown
    subjectStats: [
      {
        subject: String,
        tasksCompleted: Number,
        timeSpent: Number,
        averageCompletionTime: Number,
      },
    ],

    // Revision statistics
    revisionStats: {
      totalRevisionsCycle: {
        type: Number,
        default: 0,
      },
      revisionsCompleted: {
        type: Number,
        default: 0,
      },
      revisionSuccessRate: {
        type: Number,
        default: 0, // percentage
      },
    },

    // Favorite statistics
    favoriteStats: {
      totalFavorites: {
        type: Number,
        default: 0,
      },
      totalFavoritePractices: {
        type: Number,
        default: 0,
      },
    },

    // Streaks and achievements
    streaks: {
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      lastCompletionDate: Date,
    },

    // Weekly/Monthly data for charts
    weeklyData: [
      {
        weekStart: Date,
        tasksCompleted: Number,
        timeSpent: Number,
      },
    ],

    // Last updated
    lastCalculated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
taskStatsSchema.index({ studentId: 1 }, { unique: true });

module.exports = mongoose.model("TaskStats", taskStatsSchema);
