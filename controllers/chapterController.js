const Chapter = require("../models/Chapter");

// GET /api/chapters?subjectId=xxx&classLevel=5
exports.getChaptersList = async (req, res) => {
  const { subjectId, classLevel } = req.query;

  try {
    const filter = {
      subjectId,
      classLevel: parseInt(classLevel),
    };

    const chapters = await Chapter.find(filter).select(
      "name code subjectId classLevel chapterNumber description"
    );
    res.json(chapters);
  } catch (err) {
    console.error("Error fetching chapters:", err);
    res.status(500).json({ message: "Failed to fetch chapters" });
  }
};
