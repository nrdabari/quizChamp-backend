const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  refreshToken,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getMe);
router.post("/refresh", refreshToken); // optional

module.exports = router;
