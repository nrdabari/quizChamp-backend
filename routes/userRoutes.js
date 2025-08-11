// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changePassword,
  toggleUserStatus,
  deleteUser,
  getUserStatistics,
} = require("../controllers/userController");

// Middleware imports
const { protect, adminOnly } = require("../middleware/auth");
const {
  validateUser,
  validatePasswordChange,
} = require("../middleware/validation");

// @route   GET /api/users/statistics
// @desc    Get user statistics
// @access  Private/Admin
router.get("/statistics", protect, adminOnly, getUserStatistics);

// @route   GET /api/users
// @desc    Get all users with filtering and pagination
// @access  Private/Admin
router.get("/", protect, adminOnly, getAllUsers);

// @route   POST /api/users
// @desc    Create new user
// @access  Private/Admin
router.post("/", protect, adminOnly, validateUser, createUser);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin or own profile)
router.get("/:id", protect, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin or own profile with restrictions)
router.put("/:id", protect, updateUser);

// @route   PUT /api/users/:id/password
// @desc    Change user password
// @access  Private (Admin or own profile)
router.put("/:id/password", protect, validatePasswordChange, changePassword);

// @route   PUT /api/users/:id/toggle-status
// @desc    Toggle user active status
// @access  Private/Admin
router.put("/:id/toggle-status", protect, adminOnly, toggleUserStatus);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;
