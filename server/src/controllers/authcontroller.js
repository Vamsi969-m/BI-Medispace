const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      specialization,
    } = req.body;

    // 1. Check required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "DOCTOR",
      phone: phone || "",
      specialization: specialization || "",
    });

    // 5. Generate JWT
    const token = generateToken(user._id);

    // 6. Send response
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        specialization: user.specialization,
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Check account status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // 4. Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 5. Generate JWT
    const token = generateToken(user._id);

    // 6. Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        specialization: user.specialization,
        avatar: user.avatar,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        specialization: req.user.specialization,
        avatar: req.user.avatar,
        organizationId: req.user.organizationId,
      },
    });
  } catch (error) {
    console.error("Get Me Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateMe = async (req, res) => {
  try {
    const { fullName, email, phone, specialization, avatar } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "That email address is already in use",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || "",
        specialization: specialization?.trim() || "",
        avatar: avatar?.trim() || "",
      },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        specialization: user.specialization,
        avatar: user.avatar,
        organizationId: user.organizationId,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
  ,updateMe
};