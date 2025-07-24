const express = require("express");
const { getUsers, getUserData } = require("../controllers/userController");
const router = express.Router();

// Get all users
router.get("/", getUsers);

router.get("/:id", getUserData);

module.exports = router;
