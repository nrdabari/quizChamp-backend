// server/server.js
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// ✅ THIS LINE IS CRITICAL
app.use("/data", express.static(path.join(__dirname, "data")));

const dataDir = path.join(__dirname, "data");

const subjectRoutes = require("./routes/subjectRoutes");
app.use("/api/subjects", subjectRoutes);

const chapterRoutes = require("./routes/chapterRoutes");
app.use("/api/chapters", chapterRoutes);

const exerciseRoutes = require("./routes/exerciseRoutes");
app.use("/api/exercises", exerciseRoutes);

const questionRoutes = require("./routes/questionRoutes");
app.use("/api/questions", questionRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const submissionRoutes = require("./routes/submissionRoutes");
app.use("/api/submissions", submissionRoutes);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/list-json-files", (req, res) => {
  console.log("files");
  try {
    const files = fs
      .readdirSync(dataDir)
      .filter((file) => file.endsWith(".json"));
    console.log("files");
    res.json({ files });
  } catch (err) {
    console.log("err");
    res.status(500).json({ message: "Failed to list files" });
  }
});

app.post("/api/update-json", (req, res) => {
  const { filename, data } = req.body;
  if (!filename) {
    return res.status(400).json({ message: "Filename is required" });
  }

  const filePath = path.join(dataDir, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json({ message: "File updated successfully", path: filePath });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update file", error: err.message });
  }
});

// Save JSON API
app.post("/api/save-json", (req, res) => {
  const data = req.body;

  const folderPath = path.join(__dirname, "data");
  const filename = `${data.subject || "mcq"}_${data.chapter || "questions"}_${
    new Date().toISOString().split("T")[0]
  }.json`;
  const filePath = path.join(folderPath, filename);

  try {
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res
      .status(200)
      .json({ message: "File saved successfully", path: filePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save file" });
  }
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
// app.listen(PORT, () => {
//   console.log(`✅ Server running at http://localhost:${PORT}`);
// });
