// ============================================================================
// TASK ROUTES (routes/taskRoutes.js)
// ============================================================================

const express = require("express");
const router = express.Router();

// Import Controllers (adjust path according to your project structure)
const {
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
} = require("../controllers/taskController");

// const { getAllTasks, getTaskStats } = require("../controllers/adminController"); // Or wherever your admin controllers are

// Import Middleware (adjust path according to your project structure)
const { protect } = require("../middleware/auth"); // Your existing auth middleware

// ============================================================================
// STUDENT ROUTES
// ============================================================================

// @desc    Get student dashboard data (today's tasks, carryovers, favorites, revisions, stats)
// @route   GET /api/tasks/dashboard/:studentId
// @access  Private
router.get("/dashboard/:studentId", protect, getDashboard);

// @desc    Create new task and auto-assign to student
// @route   POST /api/tasks
// @access  Private
router.post("/", protect, createTask);

// @desc    Start timer for a task
// @route   POST /api/tasks/:taskId/start
// @access  Private
router.post("/:taskId/start", protect, startTimer);

// @desc    Pause timer for a task
// @route   POST /api/tasks/:taskId/pause
// @access  Private
router.post("/:taskId/pause", protect, pauseTimer);

// @desc    Stop timer for a task (reset to original time)
// @route   POST /api/tasks/:taskId/stop
// @access  Private
router.post("/:taskId/stop", protect, stopTimer);

// @desc    Update timer (tick every second)
// @route   PUT /api/tasks/:taskId/timer
// @access  Private
router.put("/:taskId/timer", protect, updateTimer);

// @desc    Mark task as completed and create revision schedule
// @route   PUT /api/tasks/:taskId/complete
// @access  Private
router.put("/:taskId/complete", protect, completeTask);

// @desc    Add task to favorites or increment practice count
// @route   POST /api/tasks/:taskId/favorite
// @access  Private
router.post("/:taskId/favorite", protect, addToFavorites);

// @desc    Remove task from favorites
// @route   DELETE /api/tasks/:taskId/favorite
// @access  Private
router.delete("/:taskId/favorite", protect, removeFavorite);

// @desc    Delete task (removes StudentTask record)
// @route   DELETE /api/tasks/:taskId
// @access  Private
router.delete("/:taskId", protect, deleteTask);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// // @desc    Get all tasks for admin monitoring (with filters)
// // @route   GET /api/admin/tasks
// // @access  Private (Admin only)
// router.get("/admin/tasks", protect, authorize("admin"), getAllTasks);

// // @desc    Get system-wide task statistics for admin dashboard
// // @route   GET /api/admin/tasks/stats
// // @access  Private (Admin only)
// router.get("/admin/tasks/stats", protect, authorize("admin"), getTaskStats);

module.exports = router;
