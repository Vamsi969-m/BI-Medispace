const express = require("express");

const {
  createProduct,
  getProducts,
  getAllProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  approveProduct,
  rejectProduct,
  deleteProduct,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// PRODUCT LIST
// ==========================================

// Approved active products
router.get(
  "/",
  protect,
  getProducts
);

// Admin: all products including pending/rejected
router.get(
  "/all",
  protect,
  authorizeRoles("ADMIN"),
  getAllProducts
);

// Representative: products created by them
router.get(
  "/my",
  protect,
  authorizeRoles("REPRESENTATIVE"),
  getMyProducts
);

// ==========================================
// CREATE
// ==========================================

router.post(
  "/",
  protect,
  authorizeRoles("ADMIN", "REPRESENTATIVE"),
  createProduct
);

// ==========================================
// ADMIN APPROVAL
// ==========================================

router.put(
  "/:id/approve",
  protect,
  authorizeRoles("ADMIN"),
  approveProduct
);

router.put(
  "/:id/reject",
  protect,
  authorizeRoles("ADMIN"),
  rejectProduct
);

// ==========================================
// GET SINGLE PRODUCT
// ==========================================

router.get(
  "/:id",
  protect,
  getProductById
);

// ==========================================
// UPDATE
// ==========================================

router.put(
  "/:id",
  protect,
  authorizeRoles("ADMIN", "REPRESENTATIVE"),
  updateProduct
);

// ==========================================
// DEACTIVATE
// ==========================================

router.delete(
  "/:id",
  protect,
  authorizeRoles("ADMIN"),
  deleteProduct
);

module.exports = router;