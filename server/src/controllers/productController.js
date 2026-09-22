const Product = require("../models/Product");

// ==========================================
// CREATE PRODUCT
// ADMIN + REPRESENTATIVE
// ==========================================
const createProduct = async (req, res) => {
  try {
    const {
      name,
      shortDescription,
      description,
      image,
      manufacturedIn,
      purpose,
      uses,
      category,
      price,
      rating,
    } = req.body;

    if (
      !name ||
      !description ||
      !purpose ||
      !category ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, description, purpose, category and price are required",
      });
    }

    const isAdmin = req.user.role === "ADMIN";

    const product = await Product.create({
      name,
      shortDescription: shortDescription || "",
      description,
      image: image || "",
      manufacturedIn: manufacturedIn || "",
      purpose,
      uses: Array.isArray(uses) ? uses : [],
      category,
      price,
      rating: rating || 0,

      createdBy: req.user._id,
      updatedBy: req.user._id,

      // Admin products are immediately approved.
      // Representative products require admin approval.
      approvalStatus: isAdmin ? "APPROVED" : "PENDING",

      approvedBy: isAdmin ? req.user._id : null,
      approvedAt: isAdmin ? new Date() : null,
    });

    const populatedProduct = await Product.findById(product._id)
      .populate("createdBy", "fullName email role")
      .populate("updatedBy", "fullName email role")
      .populate("approvedBy", "fullName email role");

    return res.status(201).json({
      success: true,
      message: isAdmin
        ? "Product created successfully"
        : "Product submitted for admin approval",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

// ==========================================
// GET APPROVED ACTIVE PRODUCTS
// DOCTOR / REP / ADMIN
// ==========================================
const getProducts = async (req, res) => {
  try {
    const filter = {
      isActive: true,
      approvalStatus: "APPROVED",
    };

    const products = await Product.find(filter)
      .populate("createdBy", "fullName email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// ==========================================
// GET ALL PRODUCTS
// ADMIN
// ==========================================
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("createdBy", "fullName email role")
      .populate("updatedBy", "fullName email role")
      .populate("approvedBy", "fullName email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch all products",
    });
  }
};

// ==========================================
// GET MY PRODUCTS
// REPRESENTATIVE
// ==========================================
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      createdBy: req.user._id,
    })
      .populate("createdBy", "fullName email role")
      .populate("updatedBy", "fullName email role")
      .populate("approvedBy", "fullName email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get My Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your products",
    });
  }
};

// ==========================================
// GET PRODUCT BY ID
// ==========================================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("createdBy", "fullName email role")
      .populate("updatedBy", "fullName email role")
      .populate("approvedBy", "fullName email role");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Doctors can only access approved active products.
    if (req.user.role === "DOCTOR") {
      if (
        !product.isActive ||
        product.approvalStatus !== "APPROVED"
      ) {
        return res.status(404).json({
          success: false,
          message: "Product not available",
        });
      }
    }

    // Representative can access their own products
    // even while they are pending.
    if (req.user.role === "REPRESENTATIVE") {
      const isOwner =
        product.createdBy &&
        product.createdBy._id.equals(req.user._id);

      if (!isOwner && product.approvalStatus !== "APPROVED") {
        return res.status(404).json({
          success: false,
          message: "Product not available",
        });
      }
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// ==========================================
// UPDATE PRODUCT
// ADMIN + REPRESENTATIVE
// ==========================================
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const isAdmin = req.user.role === "ADMIN";

    const isOwner =
      product.createdBy &&
      product.createdBy.equals(req.user._id);

    // Representative can edit only products created by them.
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "You can only edit products created by you",
      });
    }

    const {
      name,
      shortDescription,
      description,
      image,
      manufacturedIn,
      purpose,
      uses,
      category,
      price,
      rating,
      isActive,
    } = req.body;

    if (name !== undefined) product.name = name;
    if (shortDescription !== undefined)
      product.shortDescription = shortDescription;
    if (description !== undefined)
      product.description = description;
    if (image !== undefined) product.image = image;
    if (manufacturedIn !== undefined)
      product.manufacturedIn = manufacturedIn;
    if (purpose !== undefined) product.purpose = purpose;
    if (uses !== undefined) {
      product.uses = Array.isArray(uses) ? uses : [];
    }
    if (category !== undefined)
      product.category = category;
    if (price !== undefined)
      product.price = price;
    if (rating !== undefined)
      product.rating = rating;

    if (isAdmin) {
      if (isActive !== undefined) {
        product.isActive = isActive;
      }

      product.updatedBy = req.user._id;
    } else {
      // Representative edits require another approval.
      product.updatedBy = req.user._id;
      product.approvalStatus = "PENDING";
      product.approvedBy = null;
      product.approvedAt = null;
      product.rejectionReason = "";
    }

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate("createdBy", "fullName email role")
      .populate("updatedBy", "fullName email role")
      .populate("approvedBy", "fullName email role");

    return res.status(200).json({
      success: true,
      message: isAdmin
        ? "Product updated successfully"
        : "Product updated and submitted for admin approval",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

// ==========================================
// APPROVE PRODUCT
// ADMIN ONLY
// ==========================================
const approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.approvalStatus = "APPROVED";
    product.approvedBy = req.user._id;
    product.approvedAt = new Date();
    product.rejectionReason = "";
    product.isActive = true;

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate("createdBy", "fullName email role")
      .populate("updatedBy", "fullName email role")
      .populate("approvedBy", "fullName email role");

    return res.status(200).json({
      success: true,
      message: "Product approved successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Approve Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve product",
    });
  }
};

// ==========================================
// REJECT PRODUCT
// ADMIN ONLY
// ==========================================
const rejectProduct = async (req, res) => {
  try {
    const { reason } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.approvalStatus = "REJECTED";
    product.approvedBy = null;
    product.approvedAt = null;
    product.rejectionReason =
      reason || "Product rejected by administrator";
    product.isActive = false;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product rejected successfully",
      product,
    });
  } catch (error) {
    console.error("Reject Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject product",
    });
  }
};

// ==========================================
// DELETE PRODUCT PERMANENTLY
// ADMIN ONLY
// ==========================================
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted permanently",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getAllProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  approveProduct,
  rejectProduct,
  deleteProduct,
};