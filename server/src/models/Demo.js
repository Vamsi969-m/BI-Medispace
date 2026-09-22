const mongoose = require("mongoose");

const demoSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    demoType: {
      type: String,
      enum: ["VIDEO", "PHONE", "FACE_TO_FACE"],
      required: true,
    },

    scheduledDate: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "DISPATCHED",
        "LIVE",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    representative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    meeting: {
      platform: {
        type: String,
        enum: [
          "ZOOM",
          "GOOGLE_MEET",
          "MICROSOFT_TEAMS",
          "WEBEX",
          "OTHER",
        ],
        default: null,
      },

      meetingLink: {
        type: String,
        default: "",
      },

      meetingId: {
        type: String,
        default: "",
      },

      password: {
        type: String,
        default: "",
      },

      startTime: {
        type: Date,
        default: null,
      },

      endTime: {
        type: Date,
        default: null,
      },
    },

    sessionNotes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Demo", demoSchema);