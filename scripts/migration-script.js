const AWS = require("aws-sdk");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
console.log(
  "AWS_ACCESS_KEY_ID:",
  process.env.AWS_ACCESS_KEY_ID ? "Found" : "Missing"
);
console.log(
  "AWS_SECRET_ACCESS_KEY:",
  process.env.AWS_SECRET_ACCESS_KEY ? "Found" : "Missing"
);
console.log("AWS_REGION:", process.env.AWS_REGION);
// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// MongoDB Connection
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/olympiadDB";

// Question Schema (adjust if your schema is different)
const questionSchema = new mongoose.Schema(
  {
    imagePath: String,
    // Add other fields as needed
  },
  { strict: false }
); // Allow additional fields

const Question = mongoose.model("Question", questionSchema, "questions");

// Configuration
const CONFIG = {
  LOCAL_IMAGES_PATH: path.join(__dirname, "..", "uploads", "questions"),
  S3_BUCKET: process.env.S3_BUCKET_NAME || "olympiad-practice-images",
  S3_FOLDER: "questions",
  BATCH_SIZE: 10, // Process 10 images at a time
};

// Migration Statistics
let migrationStats = {
  totalImages: 0,
  uploadedToS3: 0,
  updatedInMongoDB: 0,
  errors: [],
  skipped: [],
  startTime: null,
  endTime: null,
};

// Utility Functions
function log(message, type = "info") {
  const timestamp = new Date().toISOString();
  const colors = {
    info: "\x1b[36m", // Cyan
    success: "\x1b[32m", // Green
    warning: "\x1b[33m", // Yellow
    error: "\x1b[31m", // Red
    reset: "\x1b[0m", // Reset
  };

  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Check if file exists
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

// Upload single image to S3
async function uploadImageToS3(localFilePath, s3Key) {
  try {
    const fileContent = fs.readFileSync(localFilePath);
    const fileStats = fs.statSync(localFilePath);

    const uploadParams = {
      Bucket: CONFIG.S3_BUCKET,
      Key: s3Key,
      Body: fileContent,
      ContentType: "image/jpeg", // Assuming all are JPG
      ContentDisposition: "inline",
      Metadata: {
        "original-path": localFilePath,
        "uploaded-by": "migration-script",
        "upload-date": new Date().toISOString(),
      },
    };

    const result = await s3.upload(uploadParams).promise();

    log(
      `✅ Uploaded: ${path.basename(localFilePath)} (${formatBytes(
        fileStats.size
      )})`,
      "success"
    );
    return result.Location;
  } catch (error) {
    log(`❌ Upload failed for ${localFilePath}: ${error.message}`, "error");
    migrationStats.errors.push({
      file: localFilePath,
      operation: "S3 Upload",
      error: error.message,
    });
    throw error;
  }
}

// Update MongoDB document
async function updateQuestionImagePath(questionId, newImagePath) {
  try {
    const result = await Question.findByIdAndUpdate(
      questionId,
      { imagePath: newImagePath },
      { new: true }
    );

    if (!result) {
      throw new Error(`Question with ID ${questionId} not found`);
    }

    log(`✅ Updated MongoDB: ${questionId} -> ${newImagePath}`, "success");
    migrationStats.updatedInMongoDB++;
    return result;
  } catch (error) {
    log(
      `❌ MongoDB update failed for ${questionId}: ${error.message}`,
      "error"
    );
    migrationStats.errors.push({
      questionId,
      operation: "MongoDB Update",
      error: error.message,
    });
    throw error;
  }
}

// Get all local images
function getLocalImages() {
  try {
    if (!fs.existsSync(CONFIG.LOCAL_IMAGES_PATH)) {
      throw new Error(`Directory not found: ${CONFIG.LOCAL_IMAGES_PATH}`);
    }

    const files = fs.readdirSync(CONFIG.LOCAL_IMAGES_PATH);
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
    });

    log(
      `📁 Found ${imageFiles.length} images in ${CONFIG.LOCAL_IMAGES_PATH}`,
      "info"
    );
    return imageFiles;
  } catch (error) {
    log(`❌ Error reading local images: ${error.message}`, "error");
    throw error;
  }
}

// Verify S3 upload
async function verifyS3Upload(s3Key) {
  try {
    await s3
      .headObject({
        Bucket: CONFIG.S3_BUCKET,
        Key: s3Key,
      })
      .promise();
    return true;
  } catch (error) {
    return false;
  }
}

// Main migration function
async function migrateImages() {
  try {
    migrationStats.startTime = new Date();
    log("🚀 Starting image migration from local storage to S3...", "info");

    // Connect to MongoDB
    log("📡 Connecting to MongoDB...", "info");
    await mongoose.connect(MONGO_URI);
    log("✅ Connected to MongoDB", "success");

    // Get local images
    const localImages = getLocalImages();
    migrationStats.totalImages = localImages.length;

    if (localImages.length === 0) {
      log("⚠️ No images found to migrate!", "warning");
      return;
    }

    // Process images in batches
    for (let i = 0; i < localImages.length; i += CONFIG.BATCH_SIZE) {
      const batch = localImages.slice(i, i + CONFIG.BATCH_SIZE);
      log(
        `📦 Processing batch ${Math.ceil(
          (i + 1) / CONFIG.BATCH_SIZE
        )} of ${Math.ceil(localImages.length / CONFIG.BATCH_SIZE)}`,
        "info"
      );

      await Promise.all(
        batch.map(async (imageFile) => {
          try {
            const questionId = path.basename(
              imageFile,
              path.extname(imageFile)
            );
            const localFilePath = path.join(
              CONFIG.LOCAL_IMAGES_PATH,
              imageFile
            );
            const s3Key = `${CONFIG.S3_FOLDER}/${imageFile}`;

            // Check if file exists locally
            if (!fileExists(localFilePath)) {
              log(`⚠️ File not found: ${localFilePath}`, "warning");
              migrationStats.skipped.push({
                file: imageFile,
                reason: "File not found",
              });
              return;
            }

            // Check if already uploaded to S3
            const alreadyExists = await verifyS3Upload(s3Key);
            if (alreadyExists) {
              log(`⏭️ Already exists in S3: ${imageFile}`, "warning");
              migrationStats.skipped.push({
                file: imageFile,
                reason: "Already exists in S3",
              });
            } else {
              // Upload to S3
              const s3Url = await uploadImageToS3(localFilePath, s3Key);
              migrationStats.uploadedToS3++;
            }

            // Generate S3 URL
            const s3Url = `https://${CONFIG.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

            // Update MongoDB
            await updateQuestionImagePath(questionId, s3Url);
          } catch (error) {
            log(`❌ Failed to process ${imageFile}: ${error.message}`, "error");
          }
        })
      );

      // Small delay between batches
      if (i + CONFIG.BATCH_SIZE < localImages.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    migrationStats.endTime = new Date();
    await printMigrationSummary();
  } catch (error) {
    log(`💥 Migration failed: ${error.message}`, "error");
    throw error;
  } finally {
    await mongoose.connection.close();
    log("📡 Disconnected from MongoDB", "info");
  }
}

// Print migration summary
async function printMigrationSummary() {
  const duration = (migrationStats.endTime - migrationStats.startTime) / 1000;

  console.log("\n" + "=".repeat(60));
  log("📊 MIGRATION SUMMARY", "info");
  console.log("=".repeat(60));

  log(`📁 Total Images Found: ${migrationStats.totalImages}`, "info");
  log(`⬆️ Uploaded to S3: ${migrationStats.uploadedToS3}`, "success");
  log(`🔄 Updated in MongoDB: ${migrationStats.updatedInMongoDB}`, "success");
  log(`⏭️ Skipped: ${migrationStats.skipped.length}`, "warning");
  log(`❌ Errors: ${migrationStats.errors.length}`, "error");
  log(`⏱️ Duration: ${duration.toFixed(2)} seconds`, "info");

  // Show skipped files
  if (migrationStats.skipped.length > 0) {
    console.log("\n📋 SKIPPED FILES:");
    migrationStats.skipped.forEach((item) => {
      log(`  • ${item.file} - ${item.reason}`, "warning");
    });
  }

  // Show errors
  if (migrationStats.errors.length > 0) {
    console.log("\n🚨 ERRORS:");
    migrationStats.errors.forEach((error) => {
      log(
        `  • ${error.file || error.questionId} (${error.operation}): ${
          error.error
        }`,
        "error"
      );
    });
  }

  // Success message
  if (migrationStats.errors.length === 0) {
    log("🎉 Migration completed successfully!", "success");
    log("🔗 Your images are now accessible via S3 URLs", "success");
    log("🗂️ You can safely keep local files as backup", "info");
  } else {
    log(
      "⚠️ Migration completed with some errors. Please review above.",
      "warning"
    );
  }

  console.log("=".repeat(60) + "\n");
}

// Verification function
async function verifyMigration() {
  try {
    log("🔍 Verifying migration...", "info");

    await mongoose.connect(MONGO_URI);

    const questions = await Question.find({
      imagePath: { $exists: true, $ne: null },
    });
    const s3Questions = questions.filter((q) => q.imagePath.includes("s3."));
    const localQuestions = questions.filter((q) =>
      q.imagePath.includes("/uploads/")
    );

    log(`📊 Verification Results:`, "info");
    log(`  • Total questions with images: ${questions.length}`, "info");
    log(`  • Using S3 URLs: ${s3Questions.length}`, "success");
    log(
      `  • Still using local paths: ${localQuestions.length}`,
      localQuestions.length > 0 ? "warning" : "success"
    );

    if (localQuestions.length > 0) {
      log("📋 Questions still using local paths:", "warning");
      localQuestions.forEach((q) => {
        log(`  • ${q._id}: ${q.imagePath}`, "warning");
      });
    }
  } catch (error) {
    log(`❌ Verification failed: ${error.message}`, "error");
  } finally {
    await mongoose.connection.close();
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case "migrate":
        await migrateImages();
        break;

      case "verify":
        await verifyMigration();
        break;

      case "test-connection":
        log("🧪 Testing connections...", "info");

        // Test MongoDB
        await mongoose.connect(MONGO_URI);
        log("✅ MongoDB connection successful", "success");
        await mongoose.connection.close();

        // Test S3
        await s3
          .listObjects({ Bucket: CONFIG.S3_BUCKET, MaxKeys: 1 })
          .promise();
        log("✅ S3 connection successful", "success");

        log("🎉 All connections working!", "success");
        break;

      default:
        console.log(`
🖼️ Olympiad S3 Migration Tool

Usage:
  node migration-script.js migrate         - Start the migration
  node migration-script.js verify          - Verify migration results  
  node migration-script.js test-connection - Test MongoDB and S3 connections

Configuration:
  Local Images: ${CONFIG.LOCAL_IMAGES_PATH}
  S3 Bucket: ${CONFIG.S3_BUCKET}
  S3 Folder: ${CONFIG.S3_FOLDER}
  MongoDB: ${MONGO_URI}
                `);
    }
  } catch (error) {
    log(`💥 Command failed: ${error.message}`, "error");
    process.exit(1);
  }
}

// Handle uncaught errors
process.on("unhandledRejection", (error) => {
  log(`💥 Unhandled rejection: ${error.message}`, "error");
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  migrateImages,
  verifyMigration,
  CONFIG,
};
