const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      product,
      quantity,
      deliveryOrganization,
      deliveryAddress,
      notes,
    } = req.body;

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product is required",
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    if (!deliveryOrganization) {
      return res.status(400).json({
        success: false,
        message: "Delivery organization is required",
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    const existingProduct = await Product.findById(product);

    if (!existingProduct || !existingProduct.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Always take the price from the trusted database.
    const unitPrice = existingProduct.price;

    const subtotal = unitPrice * quantity;

    const total = subtotal;

    const order = await Order.create({
      doctor: req.user._id,
      product: existingProduct._id,
      quantity,
      unitPrice,
      subtotal,
      total,
      deliveryOrganization,
      deliveryAddress,
      notes: notes || "",
    });

    const populatedOrder = await Order.findById(order._id)
      .populate(
        "doctor",
        "fullName email phone organizationId"
      )
      .populate(
        "product",
        "name image purpose price"
      )
      .populate(
        "representative",
        "fullName email phone"
      );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to place order",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      doctor: req.user._id,
    })
      .populate(
        "product",
        "name image purpose price"
      )
      .populate(
        "representative",
        "fullName email phone"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate(
        "doctor",
        "fullName email phone organizationId"
      )
      .populate(
        "product",
        "name image purpose price"
      )
      .populate(
        "representative",
        "fullName email phone"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isOwner =
      order.doctor._id.toString() ===
      req.user._id.toString();

    const isAdmin = req.user.role === "ADMIN";

    const isRepresentative =
      req.user.role === "REPRESENTATIVE" &&
      order.representative &&
      order.representative._id.toString() ===
        req.user._id.toString();

    if (!isOwner && !isAdmin && !isRepresentative) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this order",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate(
        "doctor",
        "fullName email phone organizationId"
      )
      .populate(
        "product",
        "name image purpose price"
      )
      .populate(
        "representative",
        "fullName email phone"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;

    if (status === "CONFIRMED") {
      order.confirmedAt = new Date();
      order.representative = req.user._id;
    }

    if (status === "DELIVERED") {
      order.deliveredAt = new Date();
    }

    await order.save();

    const updatedOrder = await Order.findById(
      order._id
    )
      .populate(
        "doctor",
        "fullName email phone organizationId"
      )
      .populate(
        "product",
        "name image purpose price"
      )
      .populate(
        "representative",
        "fullName email phone"
      );

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Update Order Status Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

const updateOrderTracking = async (req, res) => {
  try {
    const { trackingNumber } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: "Tracking number is required",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        trackingNumber: trackingNumber.trim(),
      },
      {
        new: true,
      }
    )
      .populate(
        "doctor",
        "fullName email phone organizationId"
      )
      .populate(
        "product",
        "name image purpose price"
      )
      .populate(
        "representative",
        "fullName email phone"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Tracking number updated",
      order,
    });
  } catch (error) {
    console.error(
      "Update Order Tracking Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update tracking number",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderTracking,
};