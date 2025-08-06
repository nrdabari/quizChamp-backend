const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Destination folder
const uploadDir = path.join(__dirname, "../uploads/questions");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const { questionId } = req.params;
    cb(null, `${questionId}.jpg`);
  },
});

const upload = multer({ storage });

module.exports = upload;
