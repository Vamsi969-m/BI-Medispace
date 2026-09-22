const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    representative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

// A doctor should not have the same representative
// assigned more than once.
assignmentSchema.index(
  { representative: 1, doctor: 1 },
  { unique: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);