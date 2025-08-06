const multer = require("multer");
const path = require("path");
const fs = require("fs");

const directionDir = path.join(__dirname, "../uploads/directions");
if (!fs.existsSync(directionDir)) {
  fs.mkdirSync(directionDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, directionDir);
  },
  filename: (req, file, cb) => {
    const { exerciseId } = req.params;
    cb(null, `${exerciseId}-${Date.now()}.jpg`);
  },
});

const uploadDirectionImage = multer({ storage });
module.exports = uploadDirectionImage;
