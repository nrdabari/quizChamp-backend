// ============================================================================
// FILE 1: server/routes/userRoutes.js
// ============================================================================

const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// GET all users
router.get("/", getAllUsers);

// GET user by ID
router.get("/:id", getUserById);

// POST create user
router.post("/", createUser);

// PUT update user
router.put("/:id", updateUser);

// DELETE user
router.delete("/:id", deleteUser);

module.exports = router;
