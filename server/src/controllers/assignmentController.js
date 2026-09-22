const Assignment = require("../models/Assignment");
const User = require("../models/User");

// ==========================================
// ADMIN: ASSIGN DOCTOR TO REPRESENTATIVE
// ==========================================
const createAssignment = async (req, res) => {
  try {
    const { representativeId, doctorId, notes } = req.body;

    if (!representativeId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: "Representative and doctor are required",
      });
    }

    // Check representative
    const representative = await User.findOne({
      _id: representativeId,
      role: "REPRESENTATIVE",
      isActive: true,
    });

    if (!representative) {
      return res.status(404).json({
        success: false,
        message: "Active representative not found",
      });
    }

    // Check doctor
    const doctor = await User.findOne({
      _id: doctorId,
      role: "DOCTOR",
      isActive: true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Active doctor not found",
      });
    }

    // Prevent duplicate assignment
    const existingAssignment = await Assignment.findOne({
      representative: representativeId,
      doctor: doctorId,
    });

    if (existingAssignment) {
      if (existingAssignment.status === "ACTIVE") {
        return res.status(409).json({
          success: false,
          message: "Doctor is already assigned to this representative",
        });
      }

      // Reactivate old assignment
      existingAssignment.status = "ACTIVE";
      existingAssignment.assignedBy = req.user._id;
      existingAssignment.assignedAt = new Date();
      existingAssignment.notes = notes || "";

      await existingAssignment.save();

      const assignment = await Assignment.findById(
        existingAssignment._id
      )
        .populate("representative", "fullName email phone")
        .populate(
          "doctor",
          "fullName email phone specialization organizationId"
        )
        .populate("assignedBy", "fullName email");

      return res.status(200).json({
        success: true,
        message: "Doctor assignment reactivated successfully",
        assignment,
      });
    }

    const assignment = await Assignment.create({
      representative: representativeId,
      doctor: doctorId,
      assignedBy: req.user._id,
      notes: notes || "",
    });

    const populatedAssignment = await Assignment.findById(
      assignment._id
    )
      .populate("representative", "fullName email phone")
      .populate(
        "doctor",
        "fullName email phone specialization organizationId"
      )
      .populate("assignedBy", "fullName email");

    return res.status(201).json({
      success: true,
      message: "Doctor assigned successfully",
      assignment: populatedAssignment,
    });
  } catch (error) {
    console.error("Create Assignment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign doctor",
    });
  }
};

// ==========================================
// ADMIN: GET ALL ASSIGNMENTS
// ==========================================
const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({})
      .populate(
        "representative",
        "fullName email phone isActive"
      )
      .populate(
        "doctor",
        "fullName email phone specialization organizationId isActive"
      )
      .populate("assignedBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get All Assignments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
    });
  }
};

// ==========================================
// REPRESENTATIVE: GET MY ASSIGNED DOCTORS
// ==========================================
const getMyAssignedDoctors = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      representative: req.user._id,
      status: "ACTIVE",
    })
      .populate(
        "doctor",
        "fullName email phone specialization organizationId avatar isActive"
      )
      .sort({ assignedAt: -1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get My Assigned Doctors Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned doctors",
    });
  }
};

// ==========================================
// ADMIN: GET DOCTORS ASSIGNED TO A REP
// ==========================================
const getRepresentativeAssignments = async (req, res) => {
  try {
    const representativeId = req.params.representativeId;

    const representative = await User.findOne({
      _id: representativeId,
      role: "REPRESENTATIVE",
    });

    if (!representative) {
      return res.status(404).json({
        success: false,
        message: "Representative not found",
      });
    }

    const assignments = await Assignment.find({
      representative: representativeId,
      status: "ACTIVE",
    })
      .populate(
        "doctor",
        "fullName email phone specialization organizationId avatar isActive"
      )
      .sort({ assignedAt: -1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(
      "Get Representative Assignments Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch representative assignments",
    });
  }
};

// ==========================================
// ADMIN: REMOVE DOCTOR FROM REPRESENTATIVE
// ==========================================
const removeAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(
      req.params.id
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    assignment.status = "INACTIVE";

    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Doctor assignment removed successfully",
      assignment,
    });
  } catch (error) {
    console.error("Remove Assignment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove assignment",
    });
  }
};

module.exports = {
  createAssignment,
  getAllAssignments,
  getMyAssignedDoctors,
  getRepresentativeAssignments,
  removeAssignment,
};