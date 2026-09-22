const express = require("express");

const {
  createAssignment,
  getAllAssignments,
  getMyAssignedDoctors,
  getRepresentativeAssignments,
  removeAssignment,
} = require("../controllers/assignmentController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ADMIN
router.post(
  "/",
  protect,
  authorizeRoles("ADMIN"),
  createAssignment
);

router.get(
  "/",
  protect,
  authorizeRoles("ADMIN"),
  getAllAssignments
);

// REPRESENTATIVE
router.get(
  "/my-doctors",
  protect,
  authorizeRoles("REPRESENTATIVE"),
  getMyAssignedDoctors
);

// ADMIN
router.get(
  "/representative/:representativeId",
  protect,
  authorizeRoles("ADMIN"),
  getRepresentativeAssignments
);

router.put(
  "/:id/remove",
  protect,
  authorizeRoles("ADMIN"),
  removeAssignment
);

module.exports = router;