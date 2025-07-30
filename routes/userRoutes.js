const express = require("express");
const {
  getUsers,
  getUserData,
  createStudent,
} = require("../controllers/userController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const router = express.Router();

// Get all users
router.get("/", getUsers);

router.get("/:id", getUserData);

router.post(
  "/students",
  protect,
  restrictTo("admin", "superadmin"),
  createStudent
);
// router.get("/students", protect, restrictTo("admin", "superadmin"), getAllStudents);

module.exports = router;
