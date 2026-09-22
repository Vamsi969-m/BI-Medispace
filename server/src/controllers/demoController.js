const Demo = require("../models/Demo");

// Doctor books a demo
const bookDemo = async (req, res) => {
  try {
    const {
      product,
      demoType,
      scheduledDate,
      notes,
    } = req.body;

    if (!product || !demoType || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: "Product, demo type and scheduled date are required",
      });
    }

    const demo = await Demo.create({
      doctor: req.user._id,
      product,
      demoType,
      scheduledDate,
      notes: notes || "",
      status: "PENDING",
    });

    const populatedDemo = await Demo.findById(demo._id)
      .populate("product")
      .populate("doctor", "fullName email phone specialization");

    res.status(201).json({
      success: true,
      message: "Demo booked successfully",
      demo: populatedDemo,
    });
  } catch (error) {
    console.error("Book Demo Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to book demo",
    });
  }
};


// Get demos booked by the logged-in doctor
const getMyDemos = async (req, res) => {
  try {
    const demos = await Demo.find({
      doctor: req.user._id,
    })
      .populate("product")
      .populate(
        "representative",
        "fullName email phone specialization"
      )
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      demos,
    });
  } catch (error) {
    console.error("Get My Demos Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch demos",
    });
  }
};


// Get one demo session
// Only the doctor who booked it, assigned representative,
// or admin can access it.
const getDemoById = async (req, res) => {
  try {
    const demo = await Demo.findById(req.params.id)
      .populate("product")
      .populate(
        "doctor",
        "fullName email phone specialization"
      )
      .populate(
        "representative",
        "fullName email phone specialization"
      );

    if (!demo) {
      return res.status(404).json({
        success: false,
        message: "Demo not found",
      });
    }

    const isDoctor =
      demo.doctor &&
      demo.doctor._id.toString() === req.user._id.toString();

    const isRepresentative =
      demo.representative &&
      demo.representative._id.toString() ===
        req.user._id.toString();

    const isAdmin = req.user.role === "ADMIN";

    if (!isDoctor && !isRepresentative && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this demo session",
      });
    }

    res.json({
      success: true,
      demo,
    });
  } catch (error) {
    console.error("Get Demo Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch demo",
    });
  }
};


// Representative/Admin approves demo
const approveDemo = async (req, res) => {
  try {
    const demo = await Demo.findById(req.params.id);

    if (!demo) {
      return res.status(404).json({
        success: false,
        message: "Demo not found",
      });
    }

    demo.status = "APPROVED";

    await demo.save();

    res.json({
      success: true,
      message: "Demo approved successfully",
      demo,
    });
  } catch (error) {
    console.error("Approve Demo Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to approve demo",
    });
  }
};


// Add meeting details
const addMeetingDetails = async (req, res) => {
  try {
    const {
      platform,
      meetingLink,
      meetingId,
      password,
      startTime,
      endTime,
    } = req.body;

    const demo = await Demo.findById(req.params.id);

    if (!demo) {
      return res.status(404).json({
        success: false,
        message: "Demo not found",
      });
    }

    demo.meeting = {
      platform,
      meetingLink,
      meetingId,
      password,
      startTime,
      endTime,
    };

    demo.status = "DISPATCHED";

    await demo.save();

    res.json({
      success: true,
      message: "Meeting details added successfully",
      demo,
    });
  } catch (error) {
    console.error(
      "Add Meeting Details Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to add meeting details",
    });
  }
};


// Update demo status
const updateDemoStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "DISPATCHED",
      "LIVE",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid demo status",
      });
    }

    const demo = await Demo.findById(req.params.id);

    if (!demo) {
      return res.status(404).json({
        success: false,
        message: "Demo not found",
      });
    }

    demo.status = status;

    await demo.save();

    res.json({
      success: true,
      message: "Demo status updated successfully",
      demo,
    });
  } catch (error) {
    console.error(
      "Update Demo Status Error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to update demo status",
    });
  }
};

const getAllDemos = async (req, res) => {
  try {
    const demos = await Demo.find()
      .populate(
        "doctor",
        "fullName email phone specialization"
      )
      .populate(
        "product",
        "name category shortDescription image price"
      )
      .populate(
        "representative",
        "fullName email phone specialization"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      demos,
    });
  } catch (error) {
    console.error("Get All Demos Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch demo requests",
    });
  }
};


module.exports = {
  bookDemo,
  getMyDemos,
  getDemoById,
  approveDemo,
  getAllDemos,
  addMeetingDetails,
  updateDemoStatus,
};