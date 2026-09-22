const User = require("../models/User");

// GET ALL DOCTORS
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: "DOCTOR",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Get All Doctors Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
};

// GET ALL REPRESENTATIVES
const getAllRepresentatives = async (req, res) => {
  try {
    const representatives = await User.find({
      role: "REPRESENTATIVE",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: representatives.length,
      representatives,
    });
  } catch (error) {
    console.error(
      "Get All Representatives Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch representatives",
    });
  }
};

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// GET USER BY ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

// ACTIVATE / DEACTIVATE USER
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent an admin from accidentally
    // deactivating an admin account.
    if (
      user.role === "ADMIN" &&
      user._id.equals(req.user._id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot deactivate your own admin account",
      });
    }

    user.isActive = isActive;

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(
      "Update User Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

module.exports = {
  getAllDoctors,
  getAllRepresentatives,
  getAllUsers,
  getUserById,
  updateUserStatus,
};