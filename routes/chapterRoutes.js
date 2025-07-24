const express = require("express");
const { getChaptersList } = require("../controllers/chapterController");
const router = express.Router();

// Get all exercises
// router.get("/", getSubjectList);

router.get("/", getChaptersList);

module.exports = router;
