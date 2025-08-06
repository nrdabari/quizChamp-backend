// Create: server/scripts/updateAdminPassword.js

const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const updateAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find the specific user
    const user = await User.findById("68760bb8a5220aa9e82df5b1");

    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }

    console.log("Found user:", user.name, "(" + user.email + ")");

    // Update password - the pre-save hook will hash it automatically
    user.password = "dabari11"; // Or whatever password you want
    user.isActive = true; // Make sure user is active

    await user.save();

    console.log("✅ Password updated successfully!");
    console.log("📧 Email:", user.email);
    console.log("🔑 New Password:", user.password);
    console.log("👤 Role:", user.role);
    console.log("🟢 Active:", user.isActive);
  } catch (error) {
    console.error("❌ Error updating password:", error);
  } finally {
    mongoose.disconnect();
  }
};

updateAdminPassword();

// ============================================================================
// HOW TO USE METHOD 1:
// ============================================================================

/*
1. Create the file: server/scripts/updateAdminPassword.js
2. Copy the code above into it
3. Run: node scripts/updateAdminPassword.js
4. Use the new password to login
*/
