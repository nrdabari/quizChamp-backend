// server/server.js
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Vite default port
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(cookieParser());

// Apply rate limiting to auth routes
// app.use("/api/auth", authLimiter);

// ============================================================================
// STATIC FILE SERVING
// ============================================================================

// ✅ THIS LINE IS CRITICAL
app.use("/data", express.static(path.join(__dirname, "data")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const dataDir = path.join(__dirname, "data");

// ============================================================================
// ROUTES SETUP
// ============================================================================

// Authentication routes (NEW)
try {
  console.log("1. Loading auth routes...");
  const authRoutes = require("./routes/authRoutes");
  app.use("/api/auth", authRoutes);
  console.log("✅ Auth routes loaded successfully");
} catch (error) {
  console.log("❌ Error loading auth routes:", error.message);
}

// Admin routes (NEW)
// const adminRoutes = require("./routes/adminRoutes");
// app.use("/api/admin", adminRoutes);

// TEST 1: Subject routes
try {
  console.log("1. Loading subject routes...");
  const subjectRoutes = require("./routes/subjectRoutes");
  app.use("/api/subjects", subjectRoutes);
  console.log("✅ Subject routes loaded successfully");
} catch (error) {
  console.log("❌ Error loading subject routes:", error.message);
}

// TEST 2: Chapter routes
try {
  console.log("2. Loading chapter routes...");
  const chapterRoutes = require("./routes/chapterRoutes");
  app.use("/api/chapters", chapterRoutes);
  console.log("✅ Chapter routes loaded successfully");
} catch (error) {
  console.log("❌ Error loading chapter routes:", error.message);
}

// TEST 3: Exercise routes
try {
  console.log("3. Loading exercise routes...");
  const exerciseRoutes = require("./routes/exerciseRoutes");
  app.use("/api/exercises", exerciseRoutes);
  console.log("✅ Exercise routes loaded successfully");
} catch (error) {
  console.log("❌ Error loading exercise routes:", error.message);
}

// TEST 4: Question routes
try {
  console.log("4. Loading question routes...");
  const questionRoutes = require("./routes/questionRoutes");
  app.use("/api/questions", questionRoutes);
  console.log("✅ Question routes loaded successfully");
} catch (error) {
  console.log("❌ Error loading question routes:", error.message);
}

// TEST 5: User routes
try {
  console.log("5. Loading user routes...");
  const userRoutes = require("./routes/userRoutes");
  app.use("/api/users", userRoutes);
  console.log("✅ User routes loaded successfully");
} catch (error) {
  console.log("❌ Error loading user routes:", error.message);
}

// TEST 6: Submission routes
try {
  console.log("6. Loading submission routes...");
  const submissionRoutes = require("./routes/submissionRoutes");
  app.use("/api/submissions", submissionRoutes);
  console.log("✅ Submission routes loaded successfully");
} catch (error) {
  console.log("❌ Error loading submission routes:", error.message);
}

// TEST 7: Practice routes
try {
  console.log("7. Loading practice routes...");
  const practiceRoutes = require("./routes/practiceRoutes");
  app.use("/api/practices", practiceRoutes);
  console.log("✅ Practice routes loaded successfully");
} catch (error) {
  console.log("❌ Error loading practice routes:", error.message);
}

// Remove duplicate routes (these were conflicting)
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/users", require("./routes/userRoutes"));

// ============================================================================
// FILE MANAGEMENT ENDPOINTS
// ============================================================================

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error("Global error handler:", err.stack);
//   res.status(500).json({
//     success: false,
//     message: "Something went wrong!",
//   });
// });

// // 404 handler
// app.use("*", (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//   });
// });
console.log("🔥 Reached end of route loading — no crash yet.");
// ============================================================================
// DATABASE CONNECTION AND SERVER START
// ============================================================================

mongoose
  .connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `🔐 Auth endpoints available at http://localhost:${PORT}/api/auth`
      );
      console.log(
        `👤 Admin endpoints available at http://localhost:${PORT}/api/admin`
      );
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
