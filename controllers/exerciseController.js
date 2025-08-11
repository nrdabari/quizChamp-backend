const { default: mongoose } = require("mongoose");
const Exercise = require("../models/Exercise");
const Question = require("../models/Question");
const path = require("path");
const s3 = require("../config/aws"); // Make sure to import S3
const User = require("../models/User");

exports.updateExercise = async (req, res) => {
  try {
    console.log("📥 Received data:", req.body);

    const { _id, ...exerciseData } = req.body;

    if (_id) {
      // Update existing
      const exercise = await Exercise.findByIdAndUpdate(_id, exerciseData, {
        new: true,
        runValidators: true,
      });
      return res.status(200).json(exercise);
    } else {
      // Insert new
      const exercise = await Exercise.create(exerciseData);
      return res.status(201).json(exercise);
    }
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getExercise = async (req, res) => {
  try {
    const authenticatedUserData = req.user;

    // Handle user role validation and access control
    if (authenticatedUserData.role === "user") {
      const userDetails = await User.findById(authenticatedUserData.id);

      // Check if user exists
      if (!userDetails) {
        return res.status(404).json({ message: "User not found" });
      }

      // Validate user access permissions
      if (!userDetails.subjectsAccess || !userDetails.sourceAccess) {
        return res.status(403).json({
          message:
            "Access denied: Missing subject or source access permissions",
        });
      }

      // Use user's grade level if no classLevel is specified
      const { classLevel = userDetails.grade } = req.query;

      // Create filter based on class level
      const filter = {};
      if (classLevel) {
        filter.class = parseInt(classLevel);
      }

      // Add additional filters based on user's access permissions
      // You might want to filter by subjects the user has access to
      if (userDetails.subjectsAccess && userDetails.subjectsAccess.length > 0) {
        filter.subjectId = { $in: userDetails.subjectsAccess };
      }

      if (userDetails.sourceAccess && userDetails.sourceAccess.length > 0) {
        filter.source = { $in: userDetails.sourceAccess };
      }

      filter.isActive = true;

      const list = await Exercise.find(filter)
        .sort({ createdAt: -1 })
        .populate("subjectId", "name")
        .populate("chapterId", "name");

      const exercisesWithCount = await Promise.all(
        list.map(async (ex) => {
          const count = await Question.countDocuments({ exerciseId: ex._id });
          return {
            ...ex.toObject(),
            questionCount: count,
          };
        })
      );

      return res.json(exercisesWithCount);
    }

    // Handle other roles (admin, teacher, etc.)
    const { classLevel } = req.query;

    const filter = {};
    if (classLevel) {
      filter.class = parseInt(classLevel);
    }

    const list = await Exercise.find(filter)
      .sort({ createdAt: -1 })
      .populate("subjectId", "name")
      .populate("chapterId", "name");

    const exercisesWithCount = await Promise.all(
      list.map(async (ex) => {
        const count = await Question.countDocuments({ exerciseId: ex._id });
        return {
          ...ex.toObject(),
          questionCount: count,
        };
      })
    );

    res.json(exercisesWithCount);
  } catch (err) {
    console.error("❌ Error fetching exercises:", err);
    res.status(500).json({ message: "Failed to fetch exercises" });
  }
};

exports.getExerciseData = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id).lean();
    if (!exercise) return res.status(404).json({ message: "Not found" });
    const count = await Question.countDocuments({ exerciseId: req.params.id });
    res.json({
      ...exercise,
      questionCount: count,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching exercise" });
  }
};

exports.getChapterAssignData = async (req, res) => {
  try {
    const { exerciseId } = req.params;

    // Validate exerciseId format
    if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exercise ID format",
      });
    }

    const exerciseObjectId = new mongoose.Types.ObjectId(exerciseId);

    // Single aggregation pipeline that gets all data in one query
    const result = await Exercise.aggregate([
      // Match the specific exercise
      { $match: { _id: exerciseObjectId } },

      // Project only required fields from exercise
      {
        $project: {
          _id: 1,
          subjectId: 1,
          name: 1,
          class: 1,
          subject: 1,
          source: 1,
        },
      },

      // Lookup chapters for this subject
      {
        $lookup: {
          from: "chapters",
          let: { subjectId: "$subjectId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$subjectId", "$$subjectId"] } } },
            { $project: { _id: 1, name: 1, chapterNumber: 1, code: 1 } },
            { $sort: { chapterNumber: 1 } },
          ],
          as: "chapters",
        },
      },

      // Lookup questions for this exercise
      {
        $lookup: {
          from: "questions",
          let: { exerciseId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$exerciseId", "$$exerciseId"] } } },
            { $project: { _id: 1, id: 1 } },
            { $sort: { id: 1 } },
          ],
          as: "questions",
        },
      },

      // Add metadata
      {
        $addFields: {
          metadata: {
            totalChapters: { $size: "$chapters" },
            totalQuestions: { $size: "$questions" },
          },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Exercise not found",
      });
    }

    const data = result[0];

    res.status(200).json({
      success: true,
      data: {
        exercise: {
          _id: data._id,
          subjectId: data.subjectId,
          name: data.name,
          class: data.class,
          subject: data.subject,
          source: data.source,
        },
        chapters: data.chapters,
        questions: data.questions,
        metadata: data.metadata,
      },
    });
  } catch (error) {
    console.error("Error fetching chapter assignment data:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid exercise ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// exports.uploadDirectionImage = async (req, res) => {
//   try {
//     const { exerciseId } = req.params;
//     const { directionIndex } = req.body;

//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const exercise = await Exercise.findById(exerciseId);
//     if (!exercise) {
//       return res.status(404).json({ error: "Exercise not found" });
//     }

//     const index = parseInt(directionIndex, 10);
//     if (
//       isNaN(index) ||
//       index < 0 ||
//       !exercise.directions ||
//       index >= exercise.directions.length
//     ) {
//       return res.status(400).json({ error: "Invalid direction index" });
//     }

//     const imagePath = `/uploads/directions/${req.file.filename}`;
//     exercise.directions[index].imagePath = imagePath;
//     await exercise.save();

//     res.status(200).json({
//       message: "Direction image uploaded successfully",
//       imagePath,
//       exercise,
//     });
//   } catch (error) {
//     console.error("Error uploading direction image:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// exports.deleteDirectionImage = async (req, res) => {
//   try {
//     const { id, directionIndex } = req.params;

//     // Find the exercise
//     const exercise = await Exercise.findById(id);
//     if (!exercise) {
//       return res.status(404).json({ error: "Exercise not found" });
//     }

//     // Get the image path before removing it
//     const direction = exercise.directions[directionIndex];
//     if (!direction || !direction.imagePath) {
//       return res.status(404).json({ error: "Image not found" });
//     }

//     const imagePath = direction.imagePath;
//     const fullPath = path.join(__dirname, "..", imagePath); // Adjust path as needed

//     // Remove image path from database
//     exercise.directions[directionIndex].imagePath = "";
//     await exercise.save();

//     // Delete the actual file
//     const fs = require("fs").promises;
//     try {
//       await fs.unlink(fullPath);
//       console.log(`Deleted image file: ${fullPath}`);
//     } catch (fileError) {
//       console.warn(`Could not delete file ${fullPath}:`, fileError.message);
//       // Continue even if file deletion fails (file might not exist)
//     }

//     res.json({
//       message: "Image removed successfully",
//       imagePath: imagePath,
//     });
//   } catch (error) {
//     console.error("Error removing image:", error);
//     res.status(500).json({ error: "Failed to remove image" });
//   }
// };

const deleteDirectionImageFromS3 = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes("s3.")) {
      console.log("⏭️ No S3 URL to delete or local path detected");
      return true;
    }

    // Extract S3 key from URL
    // URL: https://olympiad-practice-images.s3.ap-south-1.amazonaws.com/directions/exerciseId-timestamp.jpg
    // Key: directions/exerciseId-timestamp.jpg
    const urlParts = imageUrl.split("/");
    const key = urlParts.slice(-2).join("/");

    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(deleteParams).promise();
    console.log(`🗑️ Deleted direction image from S3: ${key}`);
    return true;
  } catch (error) {
    console.error("❌ Error deleting direction image from S3:", error);
    return false;
  }
};

exports.deleteDirectionImage = async (req, res) => {
  try {
    const { id: exerciseId, directionIndex } = req.params;

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    const index = parseInt(directionIndex, 10);
    if (
      isNaN(index) ||
      index < 0 ||
      !exercise.directions ||
      index >= exercise.directions.length
    ) {
      return res.status(400).json({ error: "Invalid direction index" });
    }

    const existingImagePath = exercise.directions[index].imagePath;
    if (!existingImagePath) {
      return res.status(400).json({ error: "No image to delete" });
    }

    // Delete from S3 first
    const s3DeleteSuccess = await deleteDirectionImageFromS3(existingImagePath);

    if (!s3DeleteSuccess) {
      return res.status(500).json({ error: "Failed to delete image from S3" });
    }

    // Update database
    exercise.directions[index].imagePath = null;
    await exercise.save();

    res.json({
      message: "🗑️ Direction image deleted successfully",
      directionIndex: index,
    });
  } catch (err) {
    console.error("❌ Error deleting direction image:", err);
    res
      .status(500)
      .json({ error: "Server error while deleting direction image" });
  }
};

exports.uploadDirectionImage = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { directionIndex } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    const index = parseInt(directionIndex, 10);
    if (
      isNaN(index) ||
      index < 0 ||
      !exercise.directions ||
      index >= exercise.directions.length
    ) {
      return res.status(400).json({ error: "Invalid direction index" });
    }

    // If there's an existing S3 image for this direction, delete it first
    const existingImagePath = exercise.directions[index].imagePath;
    if (existingImagePath && existingImagePath.includes("s3.")) {
      await deleteDirectionImageFromS3(existingImagePath);
    }

    // Get S3 URL from multer-s3 (automatically uploaded)
    const s3ImageUrl = req.file.location;

    // Update the specific direction's imagePath
    exercise.directions[index].imagePath = s3ImageUrl;
    await exercise.save();

    res.status(200).json({
      message: "✅ Direction image uploaded successfully to S3",
      imagePath: s3ImageUrl,
      directionIndex: index,
      exercise: exercise,
    });
  } catch (error) {
    console.error("❌ Error uploading direction image to S3:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
