const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderTracking,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("DOCTOR"),
  createOrder
);

router.get(
  "/my",
  protect,
  authorizeRoles("DOCTOR"),
  getMyOrders
);

router.get(
  "/all",
  protect,
  authorizeRoles("ADMIN", "REPRESENTATIVE"),
  getAllOrders
);

router.get(
  "/:id",
  protect,
  getOrderById
);

router.put(
  "/:id/status",
  protect,
  authorizeRoles("ADMIN", "REPRESENTATIVE"),
  updateOrderStatus
);

router.put(
  "/:id/tracking",
  protect,
  authorizeRoles("ADMIN", "REPRESENTATIVE"),
  updateOrderTracking
);

module.exports = router;