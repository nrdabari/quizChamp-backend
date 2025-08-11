// middleware/validation.js
const { body, validationResult } = require("express-validator");

// Validation middleware for user creation/update
const validateUser = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("role")
    .optional()
    .isIn(["admin", "user"])
    .withMessage("Role must be either admin or user"),

  body("grade").optional().isString().withMessage("Grade must be a string"),

  body("subjectsAccess")
    .optional()
    .isArray()
    .withMessage("Subjects access must be an array"),

  body("sourceAccess")
    .optional()
    .isArray()
    .withMessage("Source access must be an array"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  // Check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }
    next();
  },
];

// Validation middleware for password change
const validatePasswordChange = [
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),

  body("currentPassword")
    .optional()
    .notEmpty()
    .withMessage("Current password is required"),

  // Check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = {
  validateUser,
  validatePasswordChange,
};
