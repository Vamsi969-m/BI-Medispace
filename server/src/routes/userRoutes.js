const express = require("express");

const {
  getAllDoctors,
  getAllRepresentatives,
  getAllUsers,
  getUserById,
  updateUserStatus,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// All users
router.get(
  "/",
  protect,
  authorizeRoles("ADMIN"),
  getAllUsers
);

// Doctors
router.get(
  "/doctors",
  protect,
  authorizeRoles("ADMIN"),
  getAllDoctors
);

// Representatives
router.get(
  "/representatives",
  protect,
  authorizeRoles("ADMIN"),
  getAllRepresentatives
);

// Single user
router.get(
  "/:id",
  protect,
  authorizeRoles("ADMIN"),
  getUserById
);

// Activate / deactivate
router.put(
  "/:id/status",
  protect,
  authorizeRoles("ADMIN"),
  updateUserStatus
);

module.exports = router;