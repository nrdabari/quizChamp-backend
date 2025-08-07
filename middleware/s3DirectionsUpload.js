const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/aws");

const s3DirectionsUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: function (req, file, cb) {
      // Minimal safe metadata only
      cb(null, {
        uploadedAt: new Date().toISOString(),
        contentType: "direction-image",
      });
    },
    key: function (req, file, cb) {
      const { exerciseId } = req.params;
      const timestamp = Date.now();
      cb(null, `directions/${exerciseId}-${timestamp}.jpg`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    contentDisposition: "inline",
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
module.exports = s3DirectionsUpload;
