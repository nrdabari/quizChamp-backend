const fs = require("fs");
const path = require("path");
const s3 = require("../config/aws"); // Your existing S3 config

exports.deleteImageFromS3 = async (imageUrl) => {
  try {
    // Handle both S3 URLs and local paths during transition
    if (!imageUrl.includes("s3.")) {
      // If it's still a local path, use old deletion method
      return deleteImageFile(imageUrl);
    }

    // Extract S3 key from full URL
    // URL format: https://olympiad-practice-images.s3.ap-south-1.amazonaws.com/questions/filename.jpg
    const urlParts = imageUrl.split("/");
    const key = urlParts.slice(-2).join("/"); // Gets "questions/filename.jpg"

    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(deleteParams).promise();
    console.log(`🗑️ Deleted from S3: ${key}`);
    return true;
  } catch (error) {
    console.error("❌ Error deleting from S3:", error);
    return false;
  }
};

exports.deleteImageFile = (relativePath) => {
  const fullPath = path.join(__dirname, "..", relativePath);

  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`🗑️ Deleted file: ${relativePath}`);
      return true;
    } catch (err) {
      console.error("❌ Error deleting file:", err);
      return false;
    }
  } else {
    console.warn("⚠️ File not found:", fullPath);
    return false;
  }
};
