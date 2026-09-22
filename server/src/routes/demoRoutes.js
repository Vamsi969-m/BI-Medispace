const express = require("express");

const {
  bookDemo,
  getMyDemos,
  getDemoById,
  getAllDemos,
  approveDemo,
  addMeetingDetails,
  updateDemoStatus,
} = require("../controllers/demoController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// Doctor books a demo
router.post(
  "/",
  protect,
  authorizeRoles("DOCTOR"),
  bookDemo
);


// Logged-in doctor sees only their own demos
router.get(
  "/my",
  protect,
  authorizeRoles("DOCTOR"),
  getMyDemos
);


router.get(
  "/all",
  protect,
  authorizeRoles("ADMIN", "REPRESENTATIVE"),
  getAllDemos
);

// Specific demo/session
router.get(
  "/:id",
  protect,
  getDemoById
);


// Admin/Representative approves demo
router.put(
  "/:id/approve",
  protect,
  authorizeRoles("ADMIN", "REPRESENTATIVE"),
  approveDemo
);


// Admin/Representative adds meeting details
router.put(
  "/:id/meeting",
  protect,
  authorizeRoles("ADMIN", "REPRESENTATIVE"),
  addMeetingDetails
);


// Admin/Representative updates status
router.put(
  "/:id/status",
  protect,
  authorizeRoles("ADMIN", "REPRESENTATIVE"),
  updateDemoStatus
);


module.exports = router;