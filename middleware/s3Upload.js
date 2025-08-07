const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/aws");

const s3Upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        uploadedAt: new Date().toISOString(),
        questionId: req.params.questionId,
      });
    },
    key: function (req, file, cb) {
      const { questionId } = req.params;
      // Same naming pattern: questions/questionId.jpg
      cb(null, `questions/${questionId}.jpg`);
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
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = s3Upload;
