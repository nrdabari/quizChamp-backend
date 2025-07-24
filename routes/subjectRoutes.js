const express = require("express");
const { getSubjectList } = require("../controllers/subjectController");

const router = express.Router();

// Get all subjects
router.get("/", getSubjectList);

// router.get("/:id", getChaptersList);

module.exports = router;
