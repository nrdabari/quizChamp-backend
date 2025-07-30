const User = require("../models/User");

exports.getUsers = async (req, res) => {
  try {
    const list = await User.find({ role: "student" }).sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch exercises" });
  }
};

exports.getUserData = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await User.findOne({ _id: id });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch exercises" });
  }
};

// Admin can add student
exports.createStudent = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({ name, email, password, role: "student" });
    res.status(201).json({ message: "Student created", user });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating student", error: err.message });
  }
};
