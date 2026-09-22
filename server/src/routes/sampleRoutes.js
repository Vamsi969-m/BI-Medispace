const express = require("express");

const {
  requestSample,
  getMySamples,
  getSampleById,
  getAllSamples,
  updateSampleStatus,
  updateTrackingNumber,
} = require("../controllers/sampleController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("DOCTOR"),
  requestSample
);

router.get(
  "/my",
  protect,
  authorizeRoles("DOCTOR"),
  getMySamples
);

router.get(
  "/all",
  protect,
  authorizeRoles("ADMIN", "REPRESENTATIVE"),
  getAllSamples
);

router.get(
  "/:id",
  protect,
  getSampleById
);

router.put(
  "/:id/status",
  protect,
  authorizeRoles("ADMIN", "REPRESENTATIVE"),
  updateSampleStatus
);

router.put(
  "/:id/tracking",
  protect,
  authorizeRoles("ADMIN", "REPRESENTATIVE"),
  updateTrackingNumber
);

module.exports = router;