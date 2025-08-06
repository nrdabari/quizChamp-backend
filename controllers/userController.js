// ============================================================================
// FILE 2: server/controllers/userController.js
// ============================================================================

// For now, we'll create a simple controller without database operations
// Later you can add your User model and database logic

const getAllUsers = async (req, res) => {
  try {
    // TODO: Replace with actual database query
    // const users = await User.find({}).select('-password');

    const mockUsers = [
      {
        _id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: "student",
        grade: "10th Grade",
        isActive: true,
        createdAt: new Date(),
      },
      {
        _id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        role: "teacher",
        isActive: true,
        createdAt: new Date(),
      },
    ];

    res.json({
      success: true,
      count: mockUsers.length,
      users: mockUsers,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Replace with actual database query
    // const user = await User.findById(id).select('-password');
    // if (!user) {
    //   return res.status(404).json({ success: false, message: 'User not found' });
    // }

    const mockUser = {
      _id: id,
      name: "John Doe",
      email: "john@example.com",
      role: "student",
      grade: "10th Grade",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      user: mockUser,
      message: `User with ID ${id} retrieved successfully`,
    });
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user",
      error: error.message,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, grade } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // TODO: Replace with actual database operations
    // Check if user exists
    // const existingUser = await User.findOne({ email });
    // if (existingUser) {
    //   return res.status(400).json({ success: false, message: 'User already exists' });
    // }

    // Create new user
    // const newUser = new User({ name, email, password, role, grade });
    // await newUser.save();

    const mockNewUser = {
      _id: Date.now().toString(),
      name,
      email,
      role: role || "student",
      grade: role === "student" ? grade : undefined,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.status(201).json({
      success: true,
      user: mockNewUser,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error in createUser:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating user",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields from update
    delete updateData.password;
    delete updateData._id;

    // TODO: Replace with actual database operations
    // const user = await User.findByIdAndUpdate(
    //   id,
    //   updateData,
    //   { new: true, runValidators: true }
    // ).select('-password');

    // if (!user) {
    //   return res.status(404).json({ success: false, message: 'User not found' });
    // }

    const mockUpdatedUser = {
      _id: id,
      ...updateData,
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      user: mockUpdatedUser,
      message: `User with ID ${id} updated successfully`,
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Replace with actual database operations
    // const user = await User.findByIdAndDelete(id);
    // if (!user) {
    //   return res.status(404).json({ success: false, message: 'User not found' });
    // }

    res.json({
      success: true,
      message: `User with ID ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
      error: error.message,
    });
  }
};

// Export all functions
module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
