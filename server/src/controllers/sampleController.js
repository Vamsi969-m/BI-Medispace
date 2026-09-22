const Sample = require("../models/Sample");
const Product = require("../models/Product");

const requestSample = async (req, res) => {
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

    const sample = await Sample.create({
      doctor: req.user._id,
      product,
      quantity,
      deliveryOrganization,
      deliveryAddress,
      notes: notes || "",
    });

    const populatedSample = await Sample.findById(sample._id)
      .populate("doctor", "fullName email phone organizationId")
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
      message: "Sample request submitted successfully",
      sample: populatedSample,
    });
  } catch (error) {
    console.error("Request Sample Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit sample request",
    });
  }
};

const getMySamples = async (req, res) => {
  try {
    const samples = await Sample.find({
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
      samples,
    });
  } catch (error) {
    console.error("Get My Samples Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sample requests",
    });
  }
};

const getSampleById = async (req, res) => {
  try {
    const sample = await Sample.findById(req.params.id)
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

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: "Sample request not found",
      });
    }

    const isOwner =
      sample.doctor._id.toString() ===
      req.user._id.toString();

    const isAdmin = req.user.role === "ADMIN";

    const isRepresentative =
      req.user.role === "REPRESENTATIVE" &&
      sample.representative &&
      sample.representative._id.toString() ===
        req.user._id.toString();

    if (!isOwner && !isAdmin && !isRepresentative) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this request",
      });
    }

    res.json({
      success: true,
      sample,
    });
  } catch (error) {
    console.error("Get Sample Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sample request",
    });
  }
};

const getAllSamples = async (req, res) => {
  try {
    const samples = await Sample.find()
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
      samples,
    });
  } catch (error) {
    console.error("Get All Samples Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sample requests",
    });
  }
};

const updateSampleStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sample status",
      });
    }

    const sample = await Sample.findById(
      req.params.id
    );

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: "Sample request not found",
      });
    }

    sample.status = status;

    if (status === "APPROVED") {
      sample.representative = req.user._id;
      sample.processedAt = new Date();
    }

    if (status === "DELIVERED") {
      sample.deliveredAt = new Date();
    }

    await sample.save();

    const updatedSample = await Sample.findById(
      sample._id
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
      message: `Sample status updated to ${status}`,
      sample: updatedSample,
    });
  } catch (error) {
    console.error("Update Sample Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update sample status",
    });
  }
};

const updateTrackingNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: "Tracking number is required",
      });
    }

    const sample = await Sample.findByIdAndUpdate(
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

    if (!sample) {
      return res.status(404).json({
        success: false,
        message: "Sample request not found",
      });
    }

    res.json({
      success: true,
      message: "Tracking number updated",
      sample,
    });
  } catch (error) {
    console.error(
      "Update Tracking Number Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update tracking number",
    });
  }
};

module.exports = {
  requestSample,
  getMySamples,
  getSampleById,
  getAllSamples,
  updateSampleStatus,
  updateTrackingNumber,
};