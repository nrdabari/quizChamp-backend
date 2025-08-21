// controllers/taskController.js
const Task = require("../models/Task");
const StudentTask = require("../models/StudentTask");
const TaskStats = require("../models/TaskStats");

// Get student dashboard data
const getDashboard = async (req, res) => {
  try {
    const { studentId } = req.params;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Get today's tasks
    const todayTasks = await StudentTask.find({
      studentId,
      assignedDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $ne: "carried_over" },
    })
      .populate("taskId")
      .sort({ priority: -1, createdAt: 1 });

    // Get carryover tasks (from previous days)
    const carryoverTasks = await StudentTask.find({
      studentId,
      assignedDate: { $lt: startOfDay },
      status: { $in: ["assigned", "in_progress"] },
    }).populate("taskId");

    // Get favorite tasks
    const favoriteTasks = await StudentTask.find({
      studentId,
      "favorite.isFavorite": true,
    })
      .populate("taskId")
      .sort({ "favorite.lastPracticed": -1 });

    // Get due revisions
    const dueRevisions = await StudentTask.find({
      studentId,
      "revision.nextRevisionDate": {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      "revision.isRevision": false, // Original tasks that need revision
    }).populate("taskId");

    // Get or create stats
    let stats = await TaskStats.findOne({ studentId });
    if (!stats) {
      stats = await TaskStats.create({ studentId });
    }

    res.json({
      success: true,
      data: {
        todayTasks,
        carryoverTasks,
        favoriteTasks,
        dueRevisions,
        stats,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, subject, timeAllocated } = req.body;
    console.log(req.user);
    const createdBy = req.user.id;

    // Create task template
    const task = await Task.create({
      title,
      description,
      subject,
      defaultDuration: timeAllocated,
      createdBy,
    });

    // Create student task (assignment + progress combined)
    const studentTask = await StudentTask.create({
      studentId: createdBy,
      taskId: task._id,
      assignedDate: new Date(),
      dueDate: new Date(),
      customDuration: timeAllocated,
      source: "self_created",
      timer: {
        state: "stopped",
        timeRemaining: timeAllocated,
        totalTimeSpent: 0,
        lastUpdated: new Date(),
      },
    });

    // Update stats
    await TaskStats.findOneAndUpdate(
      { studentId: createdBy },
      {
        $inc: { totalTasksCreated: 1 },
        $set: { lastCalculated: new Date() },
      },
      { upsert: true }
    );

    res.status(201).json({
      success: true,
      data: { task, studentTask },
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

// Start timer
const startTimer = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Check if any other timer is running
    const runningTimer = await StudentTask.findOne({
      studentId: userId,
      "timer.state": "running",
    });

    if (runningTimer && runningTimer._id.toString() !== taskId) {
      return res.status(400).json({
        success: false,
        message: "Only one timer can run at a time",
      });
    }

    // Start the timer
    const studentTask = await StudentTask.findByIdAndUpdate(
      taskId,
      {
        status: "in_progress",
        "timer.state": "running",
        "timer.startedAt": new Date(),
        "timer.lastUpdated": new Date(),
      },
      { new: true }
    );

    res.json({
      success: true,
      data: studentTask,
    });
  } catch (error) {
    console.error("Start timer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start timer",
      error: error.message,
    });
  }
};

// Update timer (tick every second)
const updateTimer = async (req, res) => {
  try {
    const { taskId } = req.params;

    const studentTask = await StudentTask.findById(taskId);
    if (!studentTask || studentTask.timer.state !== "running") {
      return res.json({ success: true, data: studentTask });
    }

    // Calculate elapsed time
    const now = new Date();
    const elapsed = (now - studentTask.timer.startedAt) / (1000 * 60); // minutes
    const newTimeRemaining = Math.max(
      0,
      studentTask.timer.timeRemaining - elapsed
    );
    const completed = newTimeRemaining <= 0;

    // Update timer
    const updated = await StudentTask.findByIdAndUpdate(
      taskId,
      {
        "timer.timeRemaining": newTimeRemaining,
        "timer.totalTimeSpent": studentTask.timer.totalTimeSpent + elapsed,
        "timer.lastUpdated": now,
        "timer.state": completed ? "stopped" : "running",
      },
      { new: true }
    );

    res.json({
      success: true,
      data: updated,
      completed,
    });
  } catch (error) {
    console.error("Update timer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update timer",
      error: error.message,
    });
  }
};

// Complete task
const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const currentTask = await StudentTask.findById(taskId);

    if (!currentTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const isCompleted = currentTask.status === "completed";

    let updateData;

    if (isCompleted) {
      // Uncomplete the task
      updateData = {
        status: "assigned",
        completedAt: null,
        completionPercentage: 0,
        "timer.state": "stopped",
        "revision.scheduledRevisions": [],
        "revision.nextRevisionDate": null,
      };
    } else {
      // Complete the task
      updateData = {
        status: "completed",
        completedAt: new Date(),
        completionPercentage: 100,
        "timer.state": "stopped",
      };

      // Create revision schedule if original task
      if (!currentTask.revision.isRevision) {
        const revisionDates = [
          { days: 3, type: "short_term", revisionNumber: 1 },
          { days: 7, type: "medium_term", revisionNumber: 2 },
          { days: 30, type: "long_term", revisionNumber: 3 },
        ];

        const scheduledRevisions = revisionDates.map((rev) => ({
          revisionNumber: rev.revisionNumber,
          scheduledDate: new Date(Date.now() + rev.days * 24 * 60 * 60 * 1000),
          type: rev.type,
          completed: false,
        }));

        updateData["revision.scheduledRevisions"] = scheduledRevisions;
        updateData["revision.nextRevisionDate"] =
          scheduledRevisions[0].scheduledDate;
      }
    }

    const studentTask = await StudentTask.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true }
    );

    // Update stats
    await updateStudentStats(studentTask.studentId);

    res.json({
      success: true,
      data: studentTask,
      action: isCompleted ? "uncompleted" : "completed",
    });
  } catch (error) {
    console.error("Toggle task completion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle task completion",
      error: error.message,
    });
  }
};

// Add to favorites
const addToFavorites = async (req, res) => {
  try {
    const { taskId } = req.params;

    const studentTask = await StudentTask.findByIdAndUpdate(
      taskId,
      {
        "favorite.isFavorite": true,
        "favorite.addedToFavoritesAt": new Date(),
        $inc: { "favorite.practiceCount": 1 },
        "favorite.lastPracticed": new Date(),
      },
      { new: true }
    );

    // Update stats
    await updateStudentStats(studentTask.studentId);

    res.json({ success: true, data: studentTask });
  } catch (error) {
    console.error("Add to favorites error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add to favorites",
      error: error.message,
    });
  }
};

// Helper function to update student statistics
const updateStudentStats = async (studentId) => {
  try {
    // Calculate stats from StudentTask collection
    const completedTasks = await StudentTask.countDocuments({
      studentId,
      status: "completed",
    });

    const totalTimeResult = await StudentTask.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          status: "completed",
        },
      },
      { $group: { _id: null, totalTime: { $sum: "$timer.totalTimeSpent" } } },
    ]);

    const favoritesCount = await StudentTask.countDocuments({
      studentId,
      "favorite.isFavorite": true,
    });

    const totalTime = totalTimeResult[0]?.totalTime || 0;

    // Update stats record
    await TaskStats.findOneAndUpdate(
      { studentId },
      {
        totalTasksCompleted: completedTasks,
        totalTimeStudied: totalTime,
        "favoriteStats.totalFavorites": favoritesCount,
        lastCalculated: new Date(),
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Update stats error:", error);
  }
};

// Pause timer
const pauseTimer = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updated = await StudentTask.findByIdAndUpdate(
      taskId,
      {
        "timer.state": "paused",
        "timer.lastUpdated": new Date(),
      },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to pause timer",
      error: error.message,
    });
  }
};

// Stop timer (reset)
const stopTimer = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updated = await StudentTask.findByIdAndUpdate(
      taskId,
      {
        "timer.state": "stopped",
        "timer.timeRemaining": 0,
      },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to stop timer",
      error: error.message,
    });
  }
};

// Remove favorite
const removeFavorite = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updated = await StudentTask.findByIdAndUpdate(
      taskId,
      { "favorite.isFavorite": false },
      { new: true }
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove favorite",
      error: error.message,
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    await StudentTask.findByIdAndDelete(taskId);
    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
  createTask,
  startTimer,
  pauseTimer,
  stopTimer,
  updateTimer,
  completeTask,
  addToFavorites,
  removeFavorite,
  deleteTask,
  updateStudentStats,
};
