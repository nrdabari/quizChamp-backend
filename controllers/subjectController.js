const Subject = require("../models/Subject");

exports.getSubjectList = async (req, res) => {
  try {
    const classLevel = parseInt(req.query.classLevel); // Get classLevel from query

    const filter = classLevel
      ? { classLevels: classLevel } // Match subjects that include this classLevel
      : {};

    const subjects = await Subject.find(filter, "_id name classLevels");

    res.status(200).json(subjects);
  } catch (err) {
    console.error("Failed to fetch subjects:", err);
    res.status(500).json({ message: "Failed to get subject list" });
  }
};
