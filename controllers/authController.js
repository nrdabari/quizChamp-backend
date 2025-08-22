const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  generateTokens,
  verifyRefreshToken,
  verifyAccessToken,
} = require("../utils/jwt");
const { getMilliseconds } = require("../utils/fileHelper");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    const { accessToken, refreshToken } = generateTokens({ id: user._id });

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
        maxAge: 30 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({ user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    const user = await User.findOne({ email });
    console.log(user);

    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({
        msg: "Account is deactivated. Please contact administrator.",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
        maxAge: getMilliseconds(process.env.JWT_ACCESS_EXPIRE),
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
        maxAge: getMilliseconds(process.env.JWT_REFRESH_EXPIRE),
      })
      .json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          grade: user.grade,
        },
      });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

const logout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ msg: "Logged out successfully" });
};

const getMe = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ msg: "Not authenticated" });

    const decoded = verifyAccessToken(token);
    const { id, role } = decoded;
    console.log(id, role);

    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ user }); // now returns both user and role
  } catch (err) {
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

const refreshToken = (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ msg: "No token" });

    const user = verifyRefreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      id: user.id,
    });

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
        maxAge: 30 * 60 * 1000,
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ msg: "Token refreshed" });
  } catch (err) {
    res.status(401).json({ msg: "Invalid refresh token" });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  refreshToken,
};
